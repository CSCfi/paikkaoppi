import { Observable, Subscription } from 'rxjs/Rx';
import { Injectable } from '@angular/core'
import { GeoService } from './geo.service'
import { ResultItem } from '../service/model'

/**
 * No Injectable annotation, since this has to be instantiated manually
 *
 * @Injectable()
 */
export class OskariLocationService {
  private geoService: GeoService
  private channel: any
  private trackUserLocation = false
  private readonly interval = 5000
  private readonly locationId = 'userLocationMarker'
  private readonly userLocationEventName = 'UserLocationEvent'
  private trackSubscription?: Subscription = null
  private currentUserLocation?: number[] = null

  constructor(geoService: GeoService, channel: any) {
    this.geoService = geoService
    this.channel = channel
  }

  trackUserLocationOnMap(enabled: boolean) {
    this.trackUserLocation = enabled
    if (!this.trackUserLocation) {
      if (this.trackSubscription !== null) {
        this.channel.unregisterEventHandler(this.userLocationEventName, this.trackUserLocationEventFn.bind(this))
        this.trackSubscription.unsubscribe()
        this.trackSubscription = null
        this.currentUserLocation = null
        this.removeLocationOnMap()
      }
      return
    }

    this.channel.handleEvent(this.userLocationEventName, this.trackUserLocationEventFn.bind(this))

    const requestLocationFn = function () {
      this.channel.postRequest('MyLocationPlugin.GetUserLocationRequest', [false])
    }.bind(this)
    requestLocationFn()

    this.trackSubscription = Observable.interval(this.interval).timeInterval().subscribe(
      (currentInterval) => requestLocationFn()
    )
  }

  private trackUserLocationEventFn(event: any) {
    console.log('eventName:', this.userLocationEventName, 'event:', event)
    if (this.currentUserLocation == null || event.lat !== this.currentUserLocation[0] || event.lon !== this.currentUserLocation[1]) {
      this.showLocationOnMap(event.lat, event.lon)
      this.currentUserLocation = [event.lat, event.lon]
    }
  }

  private showLocationOnMap(lat: number, lon: number) {
    // Add marker to map
    const params = [this.geoService.location(lat, lon), this.locationId]
    this.removeLocationOnMap()
    this.channel.postRequest('MapModulePlugin.AddMarkerRequest', params)
  }

  private removeLocationOnMap() {
    this.channel.postRequest('MapModulePlugin.RemoveMarkersRequest', [this.locationId])
  }

  zoomToLocation(): void {
    const userLocationEventFn = function (event) {
      this.showLocationOnMap(event.lat, event.lon)
      this.channel.unregisterEventHandler(this.userLocationEventName, userLocationEventFn)
    }.bind(this)

    this.channel.handleEvent(this.userLocationEventName, userLocationEventFn)
    this.channel.postRequest('MyLocationPlugin.GetUserLocationRequest', [true])
  }
}
