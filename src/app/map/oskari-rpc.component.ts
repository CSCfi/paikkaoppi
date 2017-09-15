import { forEach } from '@angular/router/src/utils/collection'
import { Component, NgZone, AfterViewInit, ViewChild, EventEmitter, Output } from '@angular/core'
import OskariRPC from 'oskari-rpc'
import { environment } from '../../environments/environment'
import { Config } from './config'
import { MarkComponent } from './mark.component'
import { MarkService } from '../service/mark.service'
import { GeoService } from './geo.service'

@Component({
  selector: 'app-oskari-rpc',
  templateUrl: './oskari-rpc.component.html',
  styleUrls: ['./oskari-rpc.component.css']
})
export class OskariRpcComponent implements AfterViewInit {
  @ViewChild(MarkComponent) markComponent

  env = environment.mapEnv
  domain = environment.mapDomain
  channel: any
  markerAction = false
  drawAreaAction = false
  actionHandlers: Map<string, any> = new Map<string, any>()

  constructor(
    private zone: NgZone,
    private geoService: GeoService,
    private markService: MarkService) { }

  ngAfterViewInit() {
    console.info('OskariRpcComponent: ngAfterViewInit')
    const iframe = document.getElementById('oskari-map')
    console.info('Connect IFrame to ', this.domain)
    this.channel = OskariRPC.connect(iframe, this.domain)
    this.channel.onReady(
      () => this.zone.runGuarded(
        () => this.checkRpcVersion()
      )
    )
  }

  setMarkerToMap(lat, lon) {
    console.info('setMarkerToMap:', lat, lon)
    this.addMarker(lat, lon)
  }

  addMarker(lat, lon) {
    const markerOptions = this.geoService.marker(lat, lon)
    this.channel.handleEvent('AfterAddMarkerEvent', function (data) {
      this.markComponent.visible = true
      this.markComponent.mark = {
        markerId: data.id,
        lon: lon,
        lat: lat
      }
    }.bind(this))

    this.channel.postRequest('MapModulePlugin.AddMarkerRequest', [markerOptions])
  }

  openMarker(markerId: string) {
    this.zone.runGuarded(() => {
      console.info('openMarker:', markerId)

      this.markService.getMark(markerId).then(mark => {
        this.markComponent.visible = true
        this.markComponent.mark = mark
      })
    })
  }

  handleMarkDeleted(mark) {
    this.removeMarker(mark.markerId)
  }

  removeMarker(id: string) {
    console.info('removeMarker:', id)
    this.channel.postRequest('MapModulePlugin.RemoveMarkersRequest', [id])
  }

  toggleMarkerAction() {
    this.clearActionHandlers()
    this.markerAction = !this.markerAction

    if (this.markerAction) {
      const eventName = 'MapClickedEvent'
      const markerHandler = function (data) {
        this.setMarkerToMap(data.lat, data.lon)
        this.toggleMarkerAction()
      }.bind(this)

      this.actionHandlers.set(eventName, markerHandler)
      this.channel.handleEvent(eventName, markerHandler)
      this.channel.setCursorStyle(['pointer'], (data) => this.zone.runGuarded(() => { }))
    } else {
      const eventName = 'MarkerClickEvent'
      const markerHandler = function (data) {
        this.openMarker(data.id)
      }.bind(this)

      this.actionHandlers.set(eventName, markerHandler)
      this.channel.handleEvent(eventName, markerHandler)
      this.channel.setCursorStyle(['default'], (data) => this.zone.runGuarded(() => { }))
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

  toggleDrawAreaAction() {
    this.clearActionHandlers()
    this.drawAreaAction = !this.drawAreaAction

    if (this.drawAreaAction) {
      console.log('Set draw area on')
      const eventName = 'DrawingEvent'
      const drawAreaHandler = function (event) {
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
