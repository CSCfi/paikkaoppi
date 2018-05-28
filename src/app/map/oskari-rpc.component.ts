import { AfterViewInit, Component, Input, Output, NgZone, EventEmitter, OnInit } from '@angular/core'
import OskariRPC from 'oskari-rpc'
import { Observable } from 'rxjs/Rx'
import 'rxjs/add/observable/interval';

import { environment } from '../../environments/environment'
import { AuthService } from '../service/auth.service'
import { MessageService, Message, MessageSeverity, MessageAction, MessageActionType } from '../message/message.service';

import { PolygonFeatureCollection, ResultItem, Task, LineString, FeatureCollection} from '../service/model'
import { Result } from '../service/model-result'
import { TaskService } from '../service/task.service'
import { Coordinates, GeoService } from './geo.service'
import { OskariPointService } from './oskari-point.service'
import { OskariPolygonService } from './oskari-polygon.service'
import { OskariLocationService } from './oskari-location.service'
import { OskariLineStringService } from './oskari-linestring.service'

@Component({
  selector: 'app-oskari-rpc',
  templateUrl: './oskari-rpc.component.html',
  styleUrls: ['./oskari-rpc.component.css']
})
export class OskariRpcComponent implements AfterViewInit, OnInit {
  @Input() task: Task | null
  @Output() markerOpened = new EventEmitter<void>()
  @Output() markerClosed = new EventEmitter<void>()

  resultItemPopupVisible = false
  resultItemPopupResult: Result
  resultItemPopupResultItem: any
  coordinates: Coordinates | null
  mapLayers: MapLayer[] = []
  selectedLayer?: MapLayer = null
  actionMessages: Map<MapAction, Message> = new Map
  zoomLevel = 0
  minZoomLevel = 0
  maxZoomLevel = 13

  env = environment.mapEnv
  domain = environment.mapDomain
  mapTools = environment.mapTools
  channel: any

  // These booleans are for setting correct state for the tool button in html
  markerAction = false
  drawLineStringAction = false
  drawAreaAction = false
  trackLocation = false
  measureLineAction = false
  measureAreaAction = false
  showAllResultItems = false

  actionHandlers: Map<string, any> = new Map<string, any>()

  pointService: OskariPointService
  polygonService: OskariPolygonService
  lineService: OskariLineStringService
  locationService: OskariLocationService

  constructor(
    private zone: NgZone,
    private geoService: GeoService,
    private taskService: TaskService,
    private authService: AuthService,
    private messageService: MessageService) {
  }
  ngOnInit() {
    if (this.authService.isTeacher()) {
      this.showAllResultItems = !this.showAllResultItems
    }
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
          this.locationService = new OskariLocationService(this.zone, this.geoService, this.channel)
          this.lineService = new OskariLineStringService(this.geoService, this.channel)
          this.checkRpcVersion()
          this.resetMapLocation()
          this.loadLayers()
          this.drawTaskResultsToMap(this.task)
          this.setInitialMapToolMode()
          this.debugAllChannelFunctions()
        }
      )
    )
  }

  private drawTaskResultsToMap(task: Task) {
    const currentUsername = this.authService.getUsername()
    
    for (const result of task.results) {
      const showResultItem = this.showResultItem(result, currentUsername)
      for (const resultItem of result.resultItems) {
        if (this.geoService.isPoint(resultItem) && showResultItem) {
          this.pointService.addPointToMap(resultItem)
        } else if (this.geoService.isPolygon(resultItem) && showResultItem) {
          this.polygonService.addPolygonToMap(resultItem)
        } else if (this.geoService.isLineString(resultItem) && showResultItem) {
          this.lineService.addLineToMap(resultItem)
        } else if (this.geoService.isPoint(resultItem) && !showResultItem) {
          this.pointService.removePointFromMap(resultItem)
        } else if (this.geoService.isPolygon(resultItem) && !showResultItem) {
          this.polygonService.removePolygonFromMap(resultItem)
        } else if (this.geoService.isLineString(resultItem) && !showResultItem) {
          this.lineService.removeLineFromMap(resultItem)
        } else {
          console.error('Skipping drawing ResultItem, since not supported yet!', resultItem)
        }
      }
    }
  }

  toggleAllTaskResults() {
    this.showAllResultItems = !this.showAllResultItems
    this.drawTaskResultsToMap(this.task)
  }

  private showResultItem (result: Result, currentUsername: String) {
    if (this.showAllResultItems) {
      return true
    } else {
      return currentUsername == result.user.username
    }
  }
  
  saveResultItem(event: any) {
    const resultId = this.resultId()
    const resultItem = event as ResultItem
    if (event.isNew) {
      if (this.geoService.isPoint(resultItem)) {
        console.log('saveResultItem -- Saving new resultItem to db to resultId', resultId, event)
        const markerId = event['markerId']
        this.taskService.saveResultItem(resultId, event).subscribe(ri => {
          console.log('resultItemSaved:', ri)
          this.reloadTask()
          this.pointService.replacePointOnMap(markerId, ri)
        })
      } else if (this.geoService.isPolygon(resultItem)) {
        console.log('saveResultItem -- Saving new resultItem to db to resultId', resultId, event)
        this.taskService.saveResultItem(resultId, resultItem).subscribe(item => {
          console.log('resultItemSaved:', item)
          this.reloadTask()
          this.polygonService.replaceDrawingWithPolygonOnMap(item)
        })
      } else if (this.geoService.isLineString(resultItem)) {
        console.log('saveResultItem -- Saving new resultItem to db to resultId', resultId, event)
        this.taskService.saveResultItem(resultId,resultItem).subscribe(item => {
          console.log('resultItemSaved:', item)
          this.reloadTask()
          this.lineService.replaceDrawingWithLineOnMap(item)
        })
      } else {
        console.error('Not supported resultItem type')
      }
    } else {
      // Remove new attachment ids because those are already linked to result item
      delete event.newAttachmentIds
      console.log('saveResultItem -- Updating resultItem with id ', event.id, event)
      this.taskService.updateResultItem(event.id, event).subscribe(_ => this.reloadTask())
    }
  }

  private reloadTask() {
    console.log('Loading task again...')
    this.taskService.getTask(this.task.id, true, true).subscribe(
      (data) => {
        this.task = data
        console.log('Task loaded:', data)
      })
  }

  deleteResultItem(resultItem: ResultItem) {
    console.log('deleteResultItem')
    const removeFromMap = function (x: ResultItem) {
      if (this.geoService.isPoint(x)) {
        this.pointService.removePointFromMap(x)
      } else if (this.geoService.isPolygon(x)) {
        this.polygonService.removePolygonFromMap(x)
      } else if (this.geoService.isLineString(x)) {
        this.lineService.removeLineFromMap(x)
      }
    }.bind(this)

    if (resultItem.id) {
      this.taskService.removeResultItem(resultItem.id).subscribe((data) => removeFromMap(resultItem))
    } else {
      removeFromMap(resultItem)
    }
  }

  resultItemPopupHidden(resultItem: ResultItem) {
    this.resultItemPopupVisible = false
    this.updateToolbarCoordinatesFromResultItem(resultItem)
    this.markerClosed.next()
  }

  showResultItemPopup(resultItem: ResultItem) {
    this.resultItemPopupResultItem = resultItem
    this.resultItemPopupResult = this.task.results.find(r => r.id === resultItem.resultId)
    this.resultItemPopupVisible = true
    this.markerOpened.next()
  }

  private addNewPointToMap(lat, lon) {
    const eventName = 'AfterAddMarkerEvent'
    const afterAddMarkerEventFunction = function (data) {
      const resultItem: any = this.geoService.pointResultItem(this.resultId(), lat, lon)
      resultItem.isNew = true
      resultItem.markerId = data.id
      resultItem.visibility = this.task.visibility;
      console.log(eventName, data, resultItem)
      this.showResultItemPopup(resultItem)
      this.channel.unregisterEventHandler(eventName, afterAddMarkerEventFunction)
    }.bind(this)

    this.channel.handleEvent(eventName, afterAddMarkerEventFunction)
    this.pointService.addNewPointToMap(this.resultId(), lat, lon)
  }

  private result(): Result {
    const currentUsername = this.authService.getUsername()
    if (this.task != null && this.task.results && this.task.results.length > 0) {
      const result: Result | null = this.task.results.find(r => r.user != null && r.user.username === currentUsername)
      if (result != null) return result
    }
    throw new SyntaxError(`No result found for user ${JSON.stringify(this.authService.getUser())} from task ${JSON.stringify(this.task)}`)
  }

  private resultId(): number {
    return this.result().id
  }

  private updateToolbarCoordinatesFromResultItem(resultItem: ResultItem) {
    this.coordinates = this.geoService.pointWGS84Coordinates(resultItem)
  }

  private updateToolbarCoordinates(lat: number, lon: number) {
    this.coordinates = this.geoService.toWGS84(lat, lon)
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
        console.log('showCoordinate:', eventName, this.coordinates)
      })
    }.bind(this)

    this.actionHandlers.set(eventName, mapClickedEventFn)
    this.channel.handleEvent(eventName, mapClickedEventFn)
  }

  private setAllOpenPopupListenersActive() {
    this.setOpenPointListenerActive()
    this.setOpenPolygonListenerActive()
    this.setOpenLineListenerActive()
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

  private openPointPopup(id: number) {
    const resultId: number = this.resultId()
    this.taskService.getResultItem(id).subscribe(
      (data) => {
        const resultItem: ResultItem = data
        this.updateToolbarCoordinatesFromResultItem(resultItem)
        console.log('Open markerId', id, 'ResultId:', resultId, 'ResultItem:', resultItem, 'Coordinates:', this.coordinates)
        this.showResultItemPopup(resultItem)
      })
  }

  private setOpenLineListenerActive() {
    const eventName = 'FeatureEvent'
    const featureClickedHandler = function (event) {
      console.log(event)
      this.zone.runGuarded(() => {
        if (event['operation'] === 'click' && event.features[0].layerId.startsWith('linestring')) {
          this.openLinePopup(event.features)
        }
      })
    }.bind(this)
    this.actionHandlers.set(eventName, featureClickedHandler)
    this.channel.handleEvent(eventName, featureClickedHandler)
    this.channel.setCursorStyle(['default'], (data) => this.zone.runGuarded(() => { }))
  }

  openLinePopup(features: any[]) {
    if (features.length > 1) {
      console.info('There are multiple features clicked at the same time, opening the first one.')
    }
    const feature = features[0]
    const layerId: string = feature.layerId
    const id: number = this.lineService.lineIdForLayerId(layerId)
    const resultId: number = this.resultId()

    this.taskService.getResultItem(id).subscribe(
      (data) => {
        const resultItem: ResultItem = data
        console.log('openLinePopup: layerId', layerId, 'id', id, 'resultId', resultId, 'resultItem', resultItem)
        this.showResultItemPopup(resultItem)
      })
  }

  private setOpenPolygonListenerActive() {
    const eventName = 'FeatureEvent'
    const featureClickedHandler = function (event) {
      this.zone.runGuarded(() => {
        if (event['operation'] === 'click' && event.features[0].layerId.startsWith('polygon')) {
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
      console.info('There are multiple features clicked at the same time, opening the first one.')
    }
    const feature = features[0]
    const layerId: string = feature.layerId
    const id: number = this.polygonService.polygonIdForLayerId(layerId)
    const resultId: number = this.resultId()

    this.taskService.getResultItem(id).subscribe(
      (data) => {
        const resultItem: ResultItem = data
        console.log('openPolygonPopup: layerId', layerId, 'id', id, 'resultId', resultId, 'resultItem', resultItem)
        this.showResultItemPopup(resultItem)
      })
  }

  clearActionHandlers() {
    this.actionHandlers.forEach((handler: any, eventName: string) => {
      this.channel.unregisterEventHandler(eventName, handler)
    })
    this.actionHandlers.clear()
  }

  zoomIn() {
    if (this.zoomLevel >= this.maxZoomLevel) return
    this.channel.zoomIn((data) => this.zone.runGuarded(() => {
      console.log('Zoom level after: ', data)
      this.zoomLevel = data
    }))
  }

  zoomOut() {
    if (this.zoomLevel <= this.minZoomLevel) return
    this.channel.zoomOut((data) => this.zone.runGuarded(() => {
      console.log('Zoom level after: ', data)
      this.zoomLevel = data
    }))
  }

  zoomToLocation() {
    console.log('zoomToLocation')
    this.locationService.zoomToLocation()
    this.zoomLevel = 13
  }

  resetMapLocation() {
    // These properties are made up. Looked pretty decent.
    const mapPosition = {
      'centerX': 443367,
      'centerY': 7067167,
      'zoom': 0,
    }

    this.channel.postRequest('MapMoveRequest', [mapPosition.centerX, mapPosition.centerY, mapPosition.zoom])
  }

  checkRpcVersion() {
    console.info('checkRpcVersion: isReady:', this.channel.isReady())
    const expectedOskariVersion = '1.44.3'
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

  private showLocation(enabled: boolean): void {
    this.locationService.trackUserLocationOnMap(enabled)
  }

  private loadLayers(): void {
    this.channel.getAllLayers(items => {
      if (items != null && items.length > 0) {
        this.mapLayers = items.map(l => l as MapLayer)
        this.selectedLayer = this.mapLayers.find(l => l.visible)
      } else {
        this.mapLayers = []
        this.selectedLayer = null
      }
    })
  }

  selectLayer(id: any): void {
    const newLayer = this.mapLayers.find(l => '' + l.id === '' + id)
    console.log('SelectLayer:', id, 'OldLayer:', this.selectedLayer, 'NewLayer:', newLayer)
    if (newLayer == null)
      return
    if (this.selectedLayer) this.channel.postRequest('MapModulePlugin.MapLayerVisibilityRequest', [this.selectedLayer.id, false])
    this.channel.postRequest('MapModulePlugin.MapLayerVisibilityRequest', [newLayer.id, true])
    this.selectedLayer = newLayer
  }

  toggleTrackLocation(): void {
    this.locationService.trackUserLocationOnMap(!this.trackLocation)
    this.trackLocation = !this.trackLocation
  }

  toggleMarkerAction() {
    this.clearActionHandlers()
    this.markerAction = !this.markerAction
    console.log('toggleMarkerAction', this.markerAction)
    const action = MapAction.Marker
    if (this.markerAction) {
      this.toggleActions(action)
      this.showActionMessage('Merkitse piste', action)
      this.setAddMarkerListenerActive()
    } else {
      this.setInitialMapToolMode()
      this.closeActionMessage(action)
    }
  }

  private setAddMarkerListenerActive() {
    const eventName = 'MapClickedEvent'
    const markerHandler = function (data) {
      this.zone.runGuarded(() => {
        this.addNewPointToMap(data.lat, data.lon)
        this.updateToolbarCoordinates(data.lat, data.lon)
        console.log('AddMarker', eventName, this.coordinates)
        this.channel.unregisterEventHandler(eventName, markerHandler)
        this.toggleMarkerAction()
      })
    }.bind(this)

    this.actionHandlers.set(eventName, markerHandler)
    this.channel.handleEvent(eventName, markerHandler)
    this.channel.setCursorStyle(['pointer'], (data) => this.zone.runGuarded(() => { }))
  }

  toggleDrawAreaAction() {
    this.clearActionHandlers()
    this.drawAreaAction = !this.drawAreaAction
    const action = MapAction.DrawArea
    console.log('toggleDrawAreaAction:', this.drawAreaAction)
    if (this.drawAreaAction) {
      this.toggleActions(action)
      this.showActionMessage('Merkitse alue', action)
      this.setDrawAreaListenerActive()
    } else {
      this.polygonService.stopDrawPolygon()
      this.setInitialMapToolMode()
      this.closeActionMessage(action)
    }
  }

  toggleDrawLineStringAction() {
    this.clearActionHandlers()
    this.drawLineStringAction = !this.drawLineStringAction
    const action = MapAction.DrawLine
    console.log('toggleDrawLineStringAction', this.drawLineStringAction)
    if (this.drawLineStringAction) {
      this.toggleActions(action)
      this.showActionMessage('Merkitse viiva', action)
      this.setDrawLineListenerActive()
      } else {
      this.lineService.stopDrawLineString()
      this.setInitialMapToolMode()
      this.closeActionMessage(action)
    }
  }

  setDrawLineListenerActive() {
    const eventName = 'DrawingEvent'
    const drawLineHandler = function (event) {
      this.zone.runGuarded(() => {
        console.log(eventName, event)
        if (event.isFinished) {
          const geojson: LineString = event.geojson
          const resultItem = this.geoService.lineStringResultItem(this.resultId(), geojson) as any
          resultItem['isNew'] = true
          resultItem.visibility = this.task.visibility;
          this.showResultItemPopup(resultItem)
          console.log('DrawingEvent.isFinished:', eventName, event, resultItem)
          this.channel.unregisterEventHandler(eventName, drawLineHandler)
          this.toggleDrawLineStringAction()
        }
      })
    }.bind(this)
    this.actionHandlers.set(eventName, drawLineHandler)
    this.channel.handleEvent(eventName, drawLineHandler)
    this.lineService.startDrawLineString()
  }

  setDrawAreaListenerActive() {
    const eventName = 'DrawingEvent'
    const drawAreaHandler = function (event) {
      this.zone.runGuarded(() => {
        console.log(eventName, event)
        if (event.isFinished) {
          const geojson: PolygonFeatureCollection = event.geojson
          const resultItem = this.geoService.polygonResultItem(this.resultId(), geojson) as any
          resultItem['isNew'] = true
          resultItem.visibility = this.task.visibility;
          this.showResultItemPopup(resultItem)
          console.log('DrawingEvent.isFinished:', eventName, event, resultItem)
          this.channel.unregisterEventHandler(eventName, drawAreaHandler)
          this.toggleDrawAreaAction()
        }
      })
    }.bind(this)
    this.actionHandlers.set(eventName, drawAreaHandler)
    this.channel.handleEvent(eventName, drawAreaHandler)
    this.polygonService.startDrawPolygon()
  }

  toggleMeasureLine(): void {
    this.clearActionHandlers()
    this.measureLineAction = !this.measureLineAction
    console.log('toggleMeasureLine', this.measureLineAction)
    const action = MapAction.MeasureLine
    if (this.measureLineAction) {
      this.toggleActions(action)
      this.setMeasureListenerActive(action)
      this.showActionMessage('Mittaa etäisyys', action)
    } else {
      this.polygonService.stopMeasureLine()
      this.setInitialMapToolMode()
      this.closeActionMessage(action)
    }
  }

  toggleMeasureArea(): void {
    this.clearActionHandlers()
    this.measureAreaAction = !this.measureAreaAction
    console.log('toggleMeasureArea', this.measureAreaAction)
    const action = MapAction.MeasureArea
    if (this.measureAreaAction) {
      this.toggleActions(action)
      this.setMeasureListenerActive(action)
      this.showActionMessage('Mittaa pinta-ala', action)
    } else {
      this.polygonService.stopMeasureArea()
      this.setInitialMapToolMode()
      this.closeActionMessage(action)
    }
  }

  setMeasureListenerActive(action: MapAction.MeasureLine | MapAction.MeasureArea) {
    if (action === MapAction.MeasureLine)
      this.polygonService.startMeasureLine()
    else if (action === MapAction.MeasureArea)
      this.polygonService.startMeasureArea()
  }

  private toggleActions(currentActionActive: MapAction): void {
    switch (currentActionActive) {
      case MapAction.Marker: {
        if (this.drawAreaAction) this.toggleDrawAreaAction()
        if (this.measureLineAction) this.toggleMeasureLine()
        if (this.measureAreaAction) this.toggleMeasureArea()
        if (this.drawLineStringAction) this.toggleDrawLineStringAction()
        break
      }
      case MapAction.DrawArea: {
        if (this.markerAction) this.toggleMarkerAction()
        if (this.measureLineAction) this.toggleMeasureLine()
        if (this.measureAreaAction) this.toggleMeasureArea()
        if (this.drawLineStringAction) this.toggleDrawLineStringAction()
        break
      }
      case MapAction.MeasureLine: {
        if (this.markerAction) this.toggleMarkerAction()
        if (this.drawAreaAction) this.toggleDrawAreaAction()
        if (this.measureAreaAction) this.toggleMeasureArea()
        if (this.drawLineStringAction) this.toggleDrawLineStringAction()
        break
      }
      case MapAction.MeasureArea: {
        if (this.markerAction) this.toggleMarkerAction()
        if (this.drawAreaAction) this.toggleDrawAreaAction()
        if (this.measureLineAction) this.toggleMeasureLine()
        if (this.drawLineStringAction) this.toggleDrawLineStringAction()
        break
      }
      case MapAction.DrawLine: {
        if (this.markerAction) this.toggleMarkerAction()
        if (this.drawAreaAction) this.toggleDrawAreaAction()
        if (this.measureLineAction) this.toggleMeasureLine()
        if (this.measureAreaAction) this.toggleMeasureArea()
        break
      }
    }
  }

  debugAllChannelFunctions() {
    this.channel.getAllLayers(items => {
      console.log('getAllLayers')
      items.forEach(item => console.log(item))
    })
    this.channel.getMapPosition(pos => console.log('getMapPosition', pos))
    this.channel.getSupportedEvents(items => console.log('getSupportedEvents', items))
    this.channel.getSupportedFunctions(items => console.log('getSupportedFunctions', items))
    this.channel.getSupportedRequests(items => console.log('getSupportedRequests', items))
    this.channel.getZoomRange(items => console.log('getZoomRange', items))
    this.channel.getMapBbox(pos => console.log('getMapBbox', pos))
    this.channel.getCurrentState(pos => console.log('getCurrentState', pos))
    this.channel.getFeatures(items => console.log('getFeatures', items))
  }

  showActionMessage(message: string, action: MapAction): Message {
    const result = this.messageService.info('info', MapAction[action], message)
    this.actionMessages[action] = result.message
    result.observable.subscribe(
      messageAction => {
        console.log('Message ' + messageAction.type + ' event received')
        this.actionMessages.delete(action)
        this.closeAction(action)
      }
    )
    return result.message
  }

  private messageClosed(messageAction: MessageAction): void {
    const code = messageAction.message.code
    const action = MapAction[code]
    if (action != null) {
      this.closeAction(action)
    }
  }

  private closeActionMessage(action: MapAction) {
    const message = this.actionMessages[action]
    if (message) {
      this.messageService.closeMessage(message)
    }
    this.closeAction(action)
  }

  private closeAction(action: MapAction): void {
    switch (action) {
      case MapAction.Marker: {
        if (this.markerAction) this.toggleMarkerAction()
        break
      }
      case MapAction.DrawArea: {
        if (this.drawAreaAction) this.toggleDrawAreaAction()
        break
      }
      case MapAction.MeasureLine: {
        if (this.measureLineAction) this.toggleMeasureLine()
        break
      }
      case MapAction.MeasureArea: {
        if (this.measureAreaAction) this.toggleMeasureArea()
        break
      }
      case MapAction.DrawLine: {
        if (this.drawLineStringAction) this.toggleDrawLineStringAction()
        break
      }
    }
  }
}

export interface MapLayer {
  readonly id: any
  readonly name: string
  readonly opacity: number
  readonly visible: boolean
  readonly minZoom?: number
  readonly maxZoom?: number
}

export enum MapAction {
  Marker, DrawArea, MeasureLine, MeasureArea, DrawLine
}
