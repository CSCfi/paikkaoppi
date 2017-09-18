import { forEach } from '@angular/router/src/utils/collection'
import { Component, NgZone, AfterViewInit, ViewChild, EventEmitter, Input, Output } from '@angular/core'
import OskariRPC from 'oskari-rpc'
import { environment } from '../../environments/environment'
import { Task, Result, ResultItem, geometryTypePoint, geometryTypePolygon } from '../service/model'
import { Config } from './config'
import { ResultItemComponent } from './result-item.component'
import { GeoService } from './geo.service'
import { TaskService } from '../service/task.service'

@Component({
  selector: 'app-oskari-rpc',
  templateUrl: './oskari-rpc.component.html',
  styleUrls: ['./oskari-rpc.component.css']
})
export class OskariRpcComponent implements AfterViewInit {
  @ViewChild(ResultItemComponent) resultItemComponent
  @Input() task: Task | null

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
    console.info('OskariRpcComponent: ngAfterViewInit')
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
        switch (resultItem.geometry.type) {
          case geometryTypePoint: {
            const markerOptions = this.geoService.resultItemMarker(resultItem)
            this.channel.postRequest('MapModulePlugin.AddMarkerRequest', [markerOptions, "" + resultItem.id])
            break
          }
          default: {
            console.log("Skipping drawing ResultItem: ", resultItem)
          }
        }
      }
    }
  }

  private setInitialMapToolMode(task: Task) {
    // Set open marker listener active by default
    this.setOpenMarkerListenerActive()
  }

  saveResultItem(event: any) {
    console.log("saveResultItem")
    const resultId = this.resultId()
    if (event.isNew) {
      console.log("Saving new result item to db to resultId", resultId)
      console.log(event)
      const markerId = event["markerId"]
      this.taskService.saveResultItem(resultId, event).then(resultItem => {
        console.log("resultItemSaved:", resultItem)
        this.reloadTask()
        this.replaceMarkerIdOnMap(markerId, resultItem)
      })
    } else {
      console.log("Updating resultItem with id ", event.id)
      console.log(event)
      this.taskService.updateResultItem(event.id, event).then(_ => this.reloadTask())
    }
  }

  private reloadTask() {
    console.log("Loading task again...")
    this.taskService.getTask(this.task.id, true).then(task => {
      this.task = task
      console.log("Task loaded:", task)
      for (let r of task.results) {
        r.resultItems.forEach(console.log)
      }
    })
  }

  private replaceMarkerIdOnMap(oldMarkerId: string, resultItem: ResultItem) {
    const markerOptions = this.geoService.resultItemMarker(resultItem)
    console.log("replaceMarkerIdOnMap: oldMarkerId: ", oldMarkerId, ". New ResultItem: ", resultItem)
    this.channel.postRequest('MapModulePlugin.AddMarkerRequest', [markerOptions, "" + resultItem.id])
    this.channel.postRequest('MapModulePlugin.RemoveMarkersRequest', [oldMarkerId])
  }

  deleteResultItem(event: any) {
    console.log("deleteResultItem", event)
    if (event.isNew) {
      console.log("Marker was a new one. Only remove it from map.")
      this.removeMarkerFromMap(event.markerId)
    } else {
      console.log("Marker was already saved. Remove it from map and DB.")
      this.removeMarkerFromMap(event.id)
      this.taskService.removeResultItem(event.id)
    }
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
      this.resultItemComponent.model = resultItem
      this.resultItemComponent.visible = true
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

  private openMarker(markerId: string) {
    this.zone.runGuarded(() => {
      const resutlId: number = this.resultId()
      const resultItem: ResultItem = this.geoService.cloneResultItem(this.findResultItemFromTask(markerId))
      console.log("Open markerId", markerId, "ResultId:", resutlId, "ResultItem:", resultItem)
      this.resultItemComponent.model = resultItem
      this.resultItemComponent.visible = true
    })
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

  toggleMarkerAction() {
    console.log("toggleMarkerAction")
    this.clearActionHandlers()
    this.markerAction = !this.markerAction
    if (this.markerAction && this.drawAreaAction) {
      this.toggleDrawAreaAction()
    }
    console.log("markerAction:", this.markerAction)
    if (this.markerAction) this.setAddMarkerListenerActive()
    else this.setOpenMarkerListenerActive()
  }

  private setAddMarkerListenerActive() {
    const eventName = 'MapClickedEvent'
    const markerHandler = function (data) {
      console.log(eventName)
      this.setMarkerToMap(data.lat, data.lon)
      this.toggleMarkerAction()
    }.bind(this)

    this.actionHandlers.set(eventName, markerHandler)
    this.channel.handleEvent(eventName, markerHandler)
    this.channel.setCursorStyle(['pointer'], (data) => this.zone.runGuarded(() => { }))
  }

  private setOpenMarkerListenerActive() {
    const eventName = 'MarkerClickEvent'
    const markerHandler = function (data) {
      console.log(eventName)
      this.openMarker(data.id)
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
