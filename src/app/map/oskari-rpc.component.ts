import { forEach } from '@angular/router/src/utils/collection'
import { Component, NgZone, AfterViewInit, ViewChild, EventEmitter, Input, Output } from '@angular/core'
import OskariRPC from 'oskari-rpc'
import { environment } from '../../environments/environment'
import { Task, Result, ResultItem } from '../service/model'
import { ResultItemComponent } from './result-item.component'
import { GeoService, Coordinates } from './geo.service'
import { TaskService } from '../service/task.service'

@Component({
  selector: 'app-oskari-rpc',
  templateUrl: './oskari-rpc.component.html',
  styleUrls: ['./oskari-rpc.component.css']
})
export class OskariRpcComponent implements AfterViewInit {
  @Input() task: Task | null
  resultItemPopupVisible: boolean = false
  resultItemPopupResultItem: any
  coordinates: Coordinates | null

  env = environment.mapEnv
  domain = environment.mapDomain
  mapTools = environment.mapTools
  channel: any
  markerAction = false
  drawAreaAction = false
  actionHandlers: Map<string, any> = new Map<string, any>()

  constructor(
    private zone: NgZone,
    private geoService: GeoService,
    private taskService: TaskService) { }

  ngAfterViewInit() {
    const iframe = document.getElementById('oskari-map')
    console.info('Connect IFrame to ', this.domain)
    this.channel = OskariRPC.connect(iframe, this.domain)
    this.channel.onReady(
      () => this.zone.runGuarded(
        () => {
          this.checkRpcVersion()
          this.drawTaskResultsToMap(this.task)
          this.setInitialMapToolMode(this.task)
        }
      )
    )
  }

  private drawTaskResultsToMap(task: Task) {
    for (let result of task.results) {
      for (let resultItem of result.resultItems) {
        if (this.geoService.isPoint(resultItem)) {
          // Add marker to map
          const markerOptions = this.geoService.resultItemMarker(resultItem)
          this.channel.postRequest('MapModulePlugin.AddMarkerRequest', [markerOptions, "" + resultItem.id])
        } else {
          console.log("Skipping drawing ResultItem, since not supported yet!", resultItem)
        }
      }
    }
  }

  private setInitialMapToolMode(task: Task) {
    // Set open marker listener active by default
    this.setShowCoordinateActive()
    this.setOpenMarkerListenerActive()
  }

  saveResultItem(event: any) {
    const resultId = this.resultId()
    if (event.isNew) {
      console.log("saveResultItem -- Saving new result item to db to resultId", resultId, event)
      const markerId = event["markerId"]
      this.taskService.saveResultItem(resultId, event).then(resultItem => {
        console.log("resultItemSaved:", resultItem)
        this.reloadTask()
        this.replaceMarkerIdOnMap(markerId, resultItem)
      })
    } else {
      console.log("saveResultItem -- Updating resultItem with id ", event.id, event)
      this.taskService.updateResultItem(event.id, event).then(_ => this.reloadTask())
    }
  }

  private reloadTask() {
    console.log("Loading task again...")
    this.taskService.getTask(this.task.id, true).then(task => {
      this.task = task
      console.log("Task loaded:", task)
    })
  }

  private replaceMarkerIdOnMap(oldMarkerId: string, resultItem: ResultItem) {
    const markerOptions = this.geoService.resultItemMarker(resultItem)
    console.log("replaceMarkerIdOnMap: oldMarkerId: ", oldMarkerId, ". New ResultItem: ", resultItem)
    this.channel.postRequest('MapModulePlugin.AddMarkerRequest', [markerOptions, "" + resultItem.id])
    this.channel.postRequest('MapModulePlugin.RemoveMarkersRequest', [oldMarkerId])
  }

  deleteResultItem(event: any) {
    if (event.isNew) {
      console.log("deleteResultItem -- Marker was a new one. Only remove it from map.", event)
      this.removeMarkerFromMap(event.markerId)
    } else {
      console.log("deleteResultItem -- Marker was already saved. Remove it from map and DB.", event)
      this.removeMarkerFromMap(event.id)
      this.taskService.removeResultItem(event.id)
    }
  }

  resultItemPopupHidden(resultItem: ResultItem) {
    this.resultItemPopupVisible = false
    this.updateToolbarCoordinatesFromResultItem(resultItem)
  }

  private setMarkerToMap(lat, lon) {
    console.info('setMarkerToMap:', lat, lon)
    this.addMarkerToMap(lat, lon)
  }

  private addMarkerToMap(lat, lon) {
    const markerOptions = this.geoService.marker([lat, lon])
    const resutlId: number = this.resultId()

    const eventName = 'AfterAddMarkerEvent'
    const afterAddMarkerEventFunction = function (data) {
      const resultItem: any = this.geoService.pointResultItem(resutlId, lat, lon)
      resultItem["isNew"] = true
      resultItem["markerId"] = data.id
      console.log(eventName, data, resultItem)
      this.resultItemPopupResultItem = resultItem
      this.resultItemPopupVisible = true
      this.channel.unregisterEventHandler(eventName, afterAddMarkerEventFunction)
    }.bind(this)

    this.channel.handleEvent(eventName, afterAddMarkerEventFunction)
    this.channel.postRequest('MapModulePlugin.AddMarkerRequest', [markerOptions])
  }

  private resultId(): number {
    if (this.task != null && this.task.results.length == 1) {
      return this.task.results[0].id
    }
    throw Error("ResultId not found since task did not have only one result")
  }

  private findResultItemFromTask(id: number | string) {
    for (let result of this.task.results) {
      let resultItem = result.resultItems.find(item => item.id == id)
      if (resultItem != null) {
        return resultItem
      }
    }
    throw new Error("ResultItem with id " + id + " not found")
  }

  private removeMarkerFromMap(id: string) {
    console.info('removeMarkerFromMap:', id)
    this.channel.postRequest('MapModulePlugin.RemoveMarkersRequest', [id])
  }

  private openMarker(markerId: string) {
    const resutlId: number = this.resultId()
    const resultItem: ResultItem = this.geoService.cloneResultItem(this.findResultItemFromTask(markerId))
    this.updateToolbarCoordinatesFromResultItem(resultItem)
    console.log("Open markerId", markerId, "ResultId:", resutlId, "ResultItem:", resultItem, "Coordinates:", this.coordinates)
    this.resultItemPopupResultItem = resultItem
    this.resultItemPopupVisible = true
  }

  private updateToolbarCoordinatesFromResultItem(resultItem: ResultItem) {
    this.coordinates = this.geoService.getPointCoordinates(resultItem)
  }

  private updateToolbarCoordinates(lat: number, lon: number) {
    this.coordinates = this.geoService.toEPSG4326(lat, lon)
  }

  toggleMarkerAction() {
    console.log("toggleMarkerAction")
    this.clearActionHandlers()
    this.markerAction = !this.markerAction
    if (this.markerAction && this.drawAreaAction) {
      this.toggleDrawAreaAction()
    }
    console.log("markerAction:", this.markerAction)
    if (this.markerAction) this.setAddMarkerListenerActive()
    else {
      this.setShowCoordinateActive()
      this.setOpenMarkerListenerActive()
    }
  }

  private setAddMarkerListenerActive() {
    const eventName = 'MapClickedEvent'
    const markerHandler = function (data) {
      this.zone.runGuarded(() => {
        this.setMarkerToMap(data.lat, data.lon)
        this.updateToolbarCoordinates(data.lat, data.lon)
        console.log("AddMarker", eventName, this.coordinates)
        this.toggleMarkerAction()
      })
    }.bind(this)

    this.actionHandlers.set(eventName, markerHandler)
    this.channel.handleEvent(eventName, markerHandler)
    this.channel.setCursorStyle(['pointer'], (data) => this.zone.runGuarded(() => { }))
  }

  private setShowCoordinateActive() {
    const eventName = 'MapClickedEvent'
    const mapClickedEventFn = function (data) {
      this.zone.runGuarded(() => {
        this.updateToolbarCoordinates(data.lat, data.lon)
        console.log("showCoordinate:", eventName, this.coordinates)
      })
    }.bind(this)

    this.actionHandlers.set(eventName, mapClickedEventFn)
    this.channel.handleEvent(eventName, mapClickedEventFn)
  }

  private setOpenMarkerListenerActive() {
    const eventName = 'MarkerClickEvent'
    const markerHandler = function (data) {
      this.zone.runGuarded(() => {
        console.log(eventName)
        this.openMarker(data.id)
      })
    }.bind(this)

    this.actionHandlers.set(eventName, markerHandler)
    this.channel.handleEvent(eventName, markerHandler)
    this.channel.setCursorStyle(['default'], (data) => this.zone.runGuarded(() => { }))
  }

  toggleDrawAreaAction() {
    this.clearActionHandlers()
    this.drawAreaAction = !this.drawAreaAction
    if (this.markerAction && this.drawAreaAction) {
      this.toggleMarkerAction()
    }

    if (this.drawAreaAction) {
      console.log('Set draw area on')
      const eventName = 'DrawingEvent'
      const drawAreaHandler = function (event) {
        console.log(eventName)
        if (event.isFinished) {
          this.zone.runGuarded(() => {
            console.log(event.geojson)
            this.toggleDrawAreaAction()
          })
        }
      }.bind(this)
      this.actionHandlers.set(eventName, drawAreaHandler)
      this.channel.handleEvent(eventName, drawAreaHandler)
      this.startDrawArea()
    } else {
      console.log('Set draw area off')
      this.stopDrawArea()
    }
  }

  startDrawArea() {
    const config = ['drawArea', 'Polygon']
    this.channel.postRequest('DrawTools.StartDrawingRequest', config)
  }

  stopDrawArea() {
    const config = ['drawArea', false]
    this.channel.postRequest('DrawTools.StopDrawingRequest', config)
  }


  clearActionHandlers() {
    this.actionHandlers.forEach((handler: any, eventName: string) => {
      this.channel.unregisterEventHandler(eventName, handler)
    })
    this.actionHandlers.clear()
  }

  zoomIn() {
    this.channel.zoomIn((data) => this.zone.runGuarded(() => {
      console.log('Zoom level after: ', data)
    }))
  }

  zoomOut() {
    this.channel.zoomOut((data) => this.zone.runGuarded(() => {
      console.log('Zoom level after: ', data)
    }))
  }

  reset() {
    this.channel.resetState(() => this.zone.runGuarded(() => {
      console.log('State reset.')
    }))
  }

  checkRpcVersion() {
    console.info('checkRpcVersion: isReady:', this.channel.isReady())
    const expectedOskariVersion = '1.43.0'
    this.channel.isSupported(expectedOskariVersion, (blnSupported) => this.zone.runGuarded(() => {
      if (blnSupported) {
        console.info('Client is supported and Oskari version is ' + expectedOskariVersion)
      } else {
        console.info('Oskari-instance is not the one we expect (' + expectedOskariVersion + ') or client not supported')
        this.channel.getInfo(function (oskariInfo) {
          console.info('Current Oskari-instance reports version as: ', oskariInfo)
        })
      }
    }))

    this.channel.isSupported((blnSupported) => this.zone.runGuarded(() => {
      if (!blnSupported) {
        console.info('Oskari reported client version (' + OskariRPC.VERSION +
          ') is not supported. The client might work, but some features are not compatible.')
      } else {
        console.info('Client is supported by Oskari.')
      }
    }))
  }
}
