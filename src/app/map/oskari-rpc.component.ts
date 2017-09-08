import { forEach } from '@angular/router/src/utils/collection';
import { Component, NgZone, AfterViewInit } from '@angular/core';
import OskariRPC from 'oskari-rpc';
import { environment } from '../../environments/environment';
import { Config } from './config';


@Component({
  selector: 'app-oskari-rpc',
  templateUrl: './oskari-rpc.component.html',
  styleUrls: ['./oskari-rpc.component.css']
})
export class OskariRpcComponent implements AfterViewInit {
  env = environment.mapEnv
  domain = environment.mapDomain
  channel: any
  markerAction = false
  drawAreaAction = false
  actionHandlers: Map<string, any> = new Map<string, any>()

  constructor(private zone: NgZone) { }

  ngAfterViewInit() {
    console.info('OskariRpcComponent: ngAfterViewInit')
    const iframe = document.getElementById('oskari-map')
    console.info('Connect IFrame to ', this.domain)
    this.channel = OskariRPC.connect(iframe, this.domain)
    this.channel.onReady(() => {
      this.zone.runGuarded(() => this.checkRpcVersion())
    })
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

  setMarkerToMap(lon, lat) {
    console.info('setMarkerToMap:', lon, lat)
    this.addMarker(lon, lat)
  }

  removeMarker(id: string) {
    console.info('removeMarker:', id)
    this.channel.postRequest('MapModulePlugin.RemoveMarkersRequest', [id])
  }

  addMarker(lon, lat) {
    const markerOptions = {
      x: lon,
      y: lat,
      color: 'ff0000',
      msg: '',
      shape: 2,
      size: 10
    }
    this.channel.postRequest('MapModulePlugin.AddMarkerRequest', [markerOptions])
  }

  startDrawArea() {
    const config = ['drawArea', 'Polygon']
    this.channel.postRequest('DrawTools.StartDrawingRequest', config)
  }

  stopDrawArea() {
    const config = ['drawArea', false]
    this.channel.postRequest('DrawTools.StopDrawingRequest', config)
  }

  toggleMarkerAction() {
    this.clearActionHandlers()
    this.markerAction = !this.markerAction

    if (this.markerAction) {
      console.log('Set marker on')
      const eventName = 'MapClickedEvent'
      const markerHandler = function(data) {
        this.setMarkerToMap(data.lon, data.lat)
        this.toggleMarkerAction()
      }.bind(this)

      this.actionHandlers.set(eventName, markerHandler)
      this.channel.handleEvent(eventName, markerHandler)
      this.channel.setCursorStyle(['pointer'], (data) => this.zone.runGuarded(() => {}))

    } else {
      console.log('Set marker off')
      const eventName = 'MarkerClickEvent'
      const markerHandler = function(data) {
        this.removeMarker(data.id)
      }.bind(this)

      this.actionHandlers.set(eventName, markerHandler)
      this.channel.handleEvent(eventName, markerHandler)
      this.channel.setCursorStyle(['default'], (data) => this.zone.runGuarded(() => {}))
    }
  }

  toggleDrawAreaAction() {
    this.clearActionHandlers()
    this.drawAreaAction = !this.drawAreaAction

    if (this.drawAreaAction) {
      console.log('Set draw area on')
      const eventName = 'DrawingEvent'
      const drawAreaHandler = function(event) {
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

  clearActionHandlers() {
    this.actionHandlers.forEach((handler: any, eventName: string) => {
      this.channel.unregisterEventHandler(eventName, handler)
    })
    this.actionHandlers.clear()
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
