import { forEach } from '@angular/router/src/utils/collection'
import { Component, NgZone, AfterViewInit, ViewChild, EventEmitter, Input, Output } from '@angular/core'
import OskariRPC from 'oskari-rpc'
import { environment } from '../../environments/environment'
import { Task, Result, ResultItem, PolygonFeatureCollection } from '../service/model'
import { ResultItemComponent } from './result-item.component'
import { GeoService, Coordinates } from './geo.service'
import { TaskService } from '../service/task.service'
import { OskariPointService } from './oskari-point.service'
import { OskariPolygonService } from './oskari-polygon.service'

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

  pointService: OskariPointService
  polygonService: OskariPolygonService

  constructor(
    private zone: NgZone,
    private geoService: GeoService,
    private taskService: TaskService) {
  }

  ngAfterViewInit() {
    const iframe = document.getElementById('oskari-map')
    console.info('Connect IFrame to ', this.domain)
    this.channel = OskariRPC.connect(iframe, this.domain)
    this.channel.onReady(
      () => this.zone.runGuarded(
        () => {
          this.pointService = new OskariPointService(this.geoService, this.channel)
          this.polygonService = new OskariPolygonService(this.geoService, this.channel)
          this.checkRpcVersion()
          this.resetMapLocation()
          this.drawTaskResultsToMap(this.task)
          this.setInitialMapToolMode()
          this.debugAllChannelFunctions()
        }
      )
    )
  }

  private drawTaskResultsToMap(task: Task) {
    for (let result of task.results) {
      for (let resultItem of result.resultItems) {
        if (this.geoService.isPoint(resultItem)) {
          this.pointService.addPointToMap(resultItem)
        } else if (this.geoService.isPolygon(resultItem)) {
          this.polygonService.addPolygonToMap(resultItem)
        } else {
          console.error("Skipping drawing ResultItem, since not supported yet!", resultItem)
        }
      }
    }
  }

  saveResultItem(event: any) {
    const resultId = this.resultId()
    const resultItem = event as ResultItem
    if (event.isNew) {
      if (this.geoService.isPoint(resultItem)) {
        console.log("saveResultItem -- Saving new resultItem to db to resultId", resultId, event)
        const markerId = event["markerId"]
        this.taskService.saveResultItem(resultId, event).subscribe(resultItem => {
          console.log("resultItemSaved:", resultItem)
          this.reloadTask()
          this.pointService.replacePointOnMap(markerId, resultItem)
        })
      } else if (this.geoService.isPolygon(resultItem)) {
        console.log("saveResultItem -- Saving new resultItem to db to resultId", resultId, event)
        this.taskService.saveResultItem(resultId, resultItem).subscribe(item => {
          console.log("resultItemSaved:", item)
          this.reloadTask()
          this.polygonService.replaceDrawingWithPolygonOnMap(item)
        })
      } else {
        console.error("Not supported resultItem type")
      }
    } else {
      console.log("saveResultItem -- Updating resultItem with id ", event.id, event)
      this.taskService.updateResultItem(event.id, event).subscribe(_ => this.reloadTask())
    }
  }

  private reloadTask() {
    console.log("Loading task again...")
    this.taskService.getTask(this.task.id, true).subscribe(
      (data) => {
        this.task = data
        console.log("Task loaded:", data)
      })
  }

  deleteResultItem(resultItem: ResultItem) {
    let removeFromMap = function (resultItem: ResultItem) {
      if (this.geoService.isPoint(resultItem)) {
        this.pointService.removePointFromMap(resultItem)
      } else if (this.geoService.isPolygon(resultItem)) {
        this.polygonService.removePolygonFromMap(resultItem)
      }
    }.bind(this)

    if (resultItem.id) this.taskService.removeResultItem(resultItem.id).subscribe(_ => removeFromMap(resultItem))
    else removeFromMap(resultItem)
  }

  resultItemPopupHidden(resultItem: ResultItem) {
    this.resultItemPopupVisible = false
    this.updateToolbarCoordinatesFromResultItem(resultItem)
  }

  showResultItemPopup(resultItem: ResultItem) {
    this.resultItemPopupResultItem = resultItem
    this.resultItemPopupVisible = true
  }

  private addNewPointToMap(lat, lon) {
    const eventName = 'AfterAddMarkerEvent'
    const afterAddMarkerEventFunction = function (data) {
      const resultItem: any = this.geoService.pointResultItem(this.resultId(), lat, lon)
      resultItem["isNew"] = true
      resultItem["markerId"] = data.id
      console.log(eventName, data, resultItem)
      this.showResultItemPopup(resultItem)
      this.channel.unregisterEventHandler(eventName, afterAddMarkerEventFunction)
    }.bind(this)

    this.channel.handleEvent(eventName, afterAddMarkerEventFunction)
    this.pointService.addNewPointToMap(this.resultId(), lat, lon)
  }

  private resultId(): number {
    if (this.task != null && this.task.results.length == 1) {
      return this.task.results[0].id
    }
    throw new SyntaxError("ResultId not found since task did not have only one result")
  }

  private findResultItemFromTask(id: number | string) {
    for (let result of this.task.results) {
      let resultItem = result.resultItems.find(item => item.id == id)
      if (resultItem != null) {
        return resultItem
      }
    }
    throw new SyntaxError("ResultItem with id " + id + " not found")
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
      this.setInitialMapToolMode()
    }
  }

  private setAddMarkerListenerActive() {
    const eventName = 'MapClickedEvent'
    const markerHandler = function (data) {
      this.zone.runGuarded(() => {
        this.addNewPointToMap(data.lat, data.lon)
        this.updateToolbarCoordinates(data.lat, data.lon)
        console.log("AddMarker", eventName, this.coordinates)
        this.toggleMarkerAction()
      })
    }.bind(this)

    this.actionHandlers.set(eventName, markerHandler)
    this.channel.handleEvent(eventName, markerHandler)
    this.channel.setCursorStyle(['pointer'], (data) => this.zone.runGuarded(() => { }))
  }

  private setInitialMapToolMode() {
    // Set open marker listener active by default
    this.setShowCoordinateActive()
    this.setAllOpenPopupListenersActive()
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

  private setAllOpenPopupListenersActive() {
    this.setOpenPointListenerActive()
    this.setOpenPolygonListenerActive()
  }

  private setOpenPointListenerActive() {
    const eventName = 'MarkerClickEvent'
    const markerHandler = function (data) {
      this.zone.runGuarded(() => {
        console.log(eventName)
        this.openPointPopup(data.id)
      })
    }.bind(this)

    this.actionHandlers.set(eventName, markerHandler)
    this.channel.handleEvent(eventName, markerHandler)
    this.channel.setCursorStyle(['default'], (data) => this.zone.runGuarded(() => { }))
  }

  private openPointPopup(id: string) {
    const resultId: number = this.resultId()
    const resultItem: ResultItem = this.geoService.cloneResultItem(this.findResultItemFromTask(id))
    this.updateToolbarCoordinatesFromResultItem(resultItem)
    console.log("Open markerId", id, "ResultId:", resultId, "ResultItem:", resultItem, "Coordinates:", this.coordinates)
    this.showResultItemPopup(resultItem)
  }


  private setOpenPolygonListenerActive() {
    const eventName = 'FeatureEvent'
    const featureClickedHandler = function (event) {
      this.zone.runGuarded(() => {
        if (event["operation"] == 'click') {
          this.openPolygonPopup(event.features)
        }
      })
    }.bind(this)
    this.actionHandlers.set(eventName, featureClickedHandler)
    this.channel.handleEvent(eventName, featureClickedHandler)
    this.channel.setCursorStyle(['default'], (data) => this.zone.runGuarded(() => { }))
  }

  openPolygonPopup(features: any[]) {
    if (features.length > 1) {
      console.info("There are multiple features clicked at the same time, opening the first one.")
    }
    const feature = features[0]
    const layerId: string = feature.layerId
    const id: number = this.polygonService.polygonIdForLayerId(layerId)
    const resultId: number = this.resultId()
    const resultItem: ResultItem = this.geoService.cloneResultItem(this.findResultItemFromTask(id))
    console.log("openPolygonPopup: layerId", layerId, "id", id, "resultId", resultId, "resultItem", resultItem)
    this.showResultItemPopup(resultItem)
  }

  toggleDrawAreaAction() {
    this.clearActionHandlers()
    this.drawAreaAction = !this.drawAreaAction
    if (this.markerAction && this.drawAreaAction) {
      this.toggleMarkerAction()
    }
    console.log("drawAreaAction:", this.drawAreaAction)
    if (this.drawAreaAction) this.setDrawAreaListenerActive()
    else {
      this.polygonService.stopDrawPolygon()
      this.setInitialMapToolMode()
    }
  }

  setDrawAreaListenerActive() {
    const eventName = 'DrawingEvent'
    const drawAreaHandler = function (event) {
      this.zone.runGuarded(() => {
        console.log(eventName, event)
        if (event.isFinished) {
          const geojson: PolygonFeatureCollection = event.geojson
          const resultItem = this.geoService.polygonResultItem(this.resultId(), geojson) as any
          resultItem["isNew"] = true
          this.showResultItemPopup(resultItem)
          console.log("DrawingEvent.isFinished:", eventName, event, resultItem)
          this.toggleDrawAreaAction()
        }
      })
    }.bind(this)
    this.actionHandlers.set(eventName, drawAreaHandler)
    this.channel.handleEvent(eventName, drawAreaHandler)
    this.polygonService.startDrawPolygon()
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

  resetMapLocation() {
    // These properties are made up. Looked pretty decent.
    const mapPosition = {
      "centerX": 443367,
      "centerY": 7067167,
      "zoom": 0,
    }

    this.channel.postRequest('MapMoveRequest', [mapPosition.centerX, mapPosition.centerY, mapPosition.zoom])
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

  debugAllChannelFunctions() {
    this.channel.getAllLayers(items => items.forEach(item => console.log("getAllLayers", item)))
    this.channel.getMapPosition(pos => console.log("getMapPosition", pos))
    this.channel.getSupportedEvents(items => console.log("getSupportedEvents", items))
    this.channel.getSupportedFunctions(items => console.log("getSupportedFunctions", items))
    this.channel.getSupportedRequests(items => console.log("getSupportedRequests", items))
    this.channel.getZoomRange(items => console.log("getZoomRange", items))
    this.channel.getMapBbox(pos => console.log("getMapBbox", pos))
    this.channel.getCurrentState(pos => console.log("getCurrentState", pos))
    this.channel.getFeatures(items => console.log("getFeatures", items))
  }
}
