import { Injectable } from '@angular/core'
import { GeoService } from './geo.service'
import { ResultItem } from '../service/model'

/**
 * No Injectable annotation, since this has to be instantiated manually
 *
 * @Injectable()
 */
export class OskariLocationService {
  geoService: GeoService
  channel: any
  readonly locationId = 'userLocationMarker'

  constructor(geoService: GeoService, channel: any) {
    this.geoService = geoService
    this.channel = channel
  }

  showLocationOnMap(lat: number, lon: number) {
    // Add marker to map
    const params = [this.geoService.location(lat, lon), this.locationId]
    this.channel.postRequest('MapModulePlugin.RemoveMarkersRequest', [this.locationId])
    this.channel.postRequest('MapModulePlugin.AddMarkerRequest', params)
  }

  zoomToLocation(): void {
    const eventName = 'UserLocationEvent'
    const userLocationEventFn = function (event) {
      this.showLocationOnMap(event.lat, event.lon)
      this.channel.unregisterEventHandler(eventName, userLocationEventFn)
    }.bind(this)

    this.channel.handleEvent(eventName, userLocationEventFn)
    this.channel.postRequest('MyLocationPlugin.GetUserLocationRequest', [true])
  }
}
