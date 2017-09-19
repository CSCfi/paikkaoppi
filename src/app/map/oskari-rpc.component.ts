import { forEach } from '@angular/router/src/utils/collection'
import { Component, NgZone, AfterViewInit, ViewChild, EventEmitter, Input, Output } from '@angular/core'
import OskariRPC from 'oskari-rpc'
import { environment } from '../../environments/environment'
import { Task, Result, ResultItem, PolygonFeatureCollection } from '../service/model'
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
  readonly drawAreaId: string = 'drawArea'

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
          this.debugAllChannelFunctions()
          const eventName = 'FeatureEvent'
          this.channel.handleEvent(eventName, function(event) {
            console.log(eventName, event)
          })
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
        } else if (this.geoService.isPolygon(resultItem)) {
          this.addPolygonToMap(resultItem)
        } else {
          console.error("Skipping drawing ResultItem, since not supported yet!", resultItem)
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
        this.replaceGeometryIdOnMap(markerId, resultItem)
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

  private replaceGeometryIdOnMap(oldMarkerId: string, resultItem: ResultItem) {
    if (this.geoService.isPoint(resultItem)) {
      const markerOptions = this.geoService.resultItemMarker(resultItem)
      console.log("replaceMarkerIdOnMap: oldMarkerId: ", oldMarkerId, ". New ResultItem: ", resultItem)
      this.channel.postRequest('MapModulePlugin.AddMarkerRequest', [markerOptions, "" + resultItem.id])
      this.channel.postRequest('MapModulePlugin.RemoveMarkersRequest', [oldMarkerId])
    } else if (this.geoService.isPolygon(resultItem)) {
      console.error("Replace saved area ResultItem on map -- TODO")
    } else {
      throw new SyntaxError("Unknown ResultItem type:" + resultItem.geometry.type)
    }
  }

  deleteResultItem(resultItem: ResultItem) {
    if ((resultItem as any).isNew) {
      console.log("deleteResultItem -- Marker was a new one. Only remove it from map.", resultItem)
      const markerId: string = (resultItem as any).markerId
      // TODO: Tarkista polygonille, mikä on id?
      this.removeGeometryFromMap(resultItem, markerId)
    } else {
      console.log("deleteResultItem -- Marker was already saved. Remove it from map and DB.", resultItem)
      this.removeGeometryFromMap(resultItem, resultItem.id.toString())
      this.taskService.removeResultItem(resultItem.id)
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

  private removeGeometryFromMap(resultItem: ResultItem, id: string) {
    if (this.geoService.isPoint(resultItem))
      this.removeMarkerFromMap(id)
    else if (this.geoService.isPolygon(resultItem))
      // TODO: Tarkista polygon, mikä on ID?
      this.removeDrawAreaFromMap(id)
    else {
      throw new SyntaxError("deleteResultItem - Unknown resultItem type:" + resultItem.geometry.type)
    }
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
    console.log("drawAreaAction:", this.drawAreaAction)
    if (this.drawAreaAction) this.setDrawAreaListenerActive()
    else {
      this.stopDrawArea()
      this.setShowCoordinateActive()
      this.setOpenMarkerListenerActive()
    }
  }

  setDrawAreaListenerActive() {
    const eventName = 'DrawingEvent'
    const drawAreaHandler = function (event) {
      this.zone.runGuarded(() => {
        console.log(eventName, event)
        if (event.isFinished) {
          this.toggleDrawAreaAction()
          this.testFeatureCollectionReplace(event.geojson)
        }
      })
    }.bind(this)
    this.actionHandlers.set(eventName, drawAreaHandler)
    this.channel.handleEvent(eventName, drawAreaHandler)
    this.startDrawArea()
  }

  addPolygonToMap(resultItem: ResultItem) {
    var params = [resultItem.geometry, {
      clearPrevious: false,
    }]

    this.channel.postRequest('MapModulePlugin.AddFeaturesToMapRequest', params)
  }

  testFeatureCollectionReplace(geojson: PolygonFeatureCollection) {
    const geojsonObject = geojson

    this.removeDrawAreaFromMap(this.drawAreaId)

    const resultItem = this.geoService.polygonResultItem(this.resultId(), geojson)
    this.taskService.saveResultItem(resultItem.resultId, resultItem).then( item => this.addPolygonToMap(item))

    

    /*
    var x = 488704;
    var y = 6939136;
    var geojsonObject = {
      'type': 'FeatureCollection',
      'crs': {
        'type': 'name',
        'properties': {
          'name': 'EPSG:3067'
        }
      },
      'features': [
        {
          'type': 'Feature',
          'geometry': {
            'type': 'LineString',
            'coordinates': [[x, y], [x + 100000, y + 100000]]
          },
          'properties': {
            'test_property': 1
          }
        },
        {
          'type': 'Feature',
          'geometry': {
            'type': 'Point',
            'coordinates': [x, y]
          },
          'properties': {
            'test_property': 2
          }
        }

      ]
    };
    var testOptions = {
      'minResolution': 0,
      'maxResolution': 1000
    };
    */

    /*
    var params = [geojsonObject, {
      clearPrevious: false,
    }];

    this.channel.postRequest(
      'MapModulePlugin.AddFeaturesToMapRequest',
      params
    );
    this.channel.log('MapModulePlugin.AddFeaturesToMapRequest posted with data', params);

    */
    /*
    var geojsonObject2 = {
      'type': 'FeatureCollection',
      'crs': {
        'type': 'name',
        'properties': {
          'name': 'EPSG:3067'
        }
      },
      'features': [
        {
          'type': 'Feature',
          'geometry': {
            'type': 'LineString',
            'coordinates': [[x + 30000, y], [x + 130000, y + 100000]]
          },
          'properties': {
            'test_property': 'Line'
          }
        },
        {
          'type': 'Feature',
          'geometry': {
            'type': 'Point',
            'coordinates': [x + 30000, y]
          },
          'properties': {
            'test_property': 'empty'
          }
        }

      ]
    };

    var testOptions2 = {
      'minResolution': 0,
      'maxResolution': 1000
    };
    var params2 = [geojsonObject2, {
      clearPrevious: false,
      layerOptions: testOptions2,
      centerTo: true,
      featureStyle: {
        fill: {
          color: '#ff0000'
        },
        stroke: {
          color: '#ff0000',
          width: 5
        },
        text: {
          scale: 1.3,
          fill: {
            color: 'rgba(0,0,0,1)'
          },
          stroke: {
            color: 'rgba(255,255,255,1)',
            width: 2
          },
          labelProperty: 'test_property'
        }
      },
      cursor: 'zoom-out',
      prio: 1
    }];


    this.channel.postRequest(
      'MapModulePlugin.AddFeaturesToMapRequest',
      params2
    );
    this.channel.log('MapModulePlugin.AddFeaturesToMapRequest posted with data', params2);
    */
  }

  startDrawArea() {
    const config = [this.drawAreaId, 'Polygon']
    this.channel.postRequest('DrawTools.StartDrawingRequest', config)
  }

  stopDrawArea() {
    console.log("stopDrawArea", this.drawAreaId)
    // This removes unfinished drawings
    const config = [this.drawAreaId, false]
    this.channel.postRequest('DrawTools.StopDrawingRequest', config)
  }

  removeDrawAreaFromMap(id: any) {
    console.log("removeDrawArea:", id)
    // This removes finished drawings
    const config = [this.drawAreaId, true]
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

  debugAllChannelFunctions() {
    this.channel.getAllLayers( items => items.forEach(item => console.log("getAllLayers", item)))
    this.channel.getMapPosition( pos => console.log("getMapPosition", pos))
    this.channel.getSupportedEvents( items => console.log("getSupportedEvents", items))
    this.channel.getSupportedFunctions( items => console.log("getSupportedFunctions", items))
    this.channel.getSupportedRequests( items => console.log("getSupportedRequests", items))
    this.channel.getZoomRange( items => console.log("getZoomRange", items))
    this.channel.getMapBbox( pos => console.log("getMapBbox", pos))
    this.channel.getCurrentState( pos => console.log("getCurrentState", pos))
    this.channel.useState( pos => console.log("useState", pos))
    this.channel.getFeatures( items => console.log("getFeatures", items))
  }
}
