import { Injectable } from '@angular/core';
import { GeoService } from './geo.service'
import { ResultItem } from '../service/model'

/**
 * No Injectable annotation, since this has to be instantiated manually
 * 
 * @Injectable()
 */
export class OskariPointService {
  geoService: GeoService
  channel: any

  constructor(geoService: GeoService, channel: any) {
    this.geoService = geoService
    this.channel = channel
  }

  addPointToMap(resultItem: ResultItem) {
    // Add marker to map
    const params = [this.geoService.resultItemMarker(resultItem), "" + resultItem.id]
    console.log("addPointToMap", resultItem, params)
    this.channel.postRequest('MapModulePlugin.AddMarkerRequest', params)
  }

  addNewPointToMap(resultId: number, lat: number, lon: number) {
    const params = this.geoService.marker([lat, lon])
    console.log("addNewPointToMap", params)
    this.channel.postRequest('MapModulePlugin.AddMarkerRequest', [params])
  }

  replacePointOnMap(oldPointId: string, resultItem: ResultItem) {
    console.log("replaceMarkerIdOnMap: oldMarkerId: ", oldPointId, ". New ResultItem: ", resultItem)
    this.addPointToMap(resultItem)
    this.channel.postRequest('MapModulePlugin.RemoveMarkersRequest', [oldPointId])
  }

  removePointFromMap(resultItem: ResultItem) {
    if ((resultItem as any).isNew) {
      const params = [(resultItem as any).markerId]
      console.log("removePointFromMap -- Point was a new one.", resultItem, params)
      this.channel.postRequest('MapModulePlugin.RemoveMarkersRequest', params)
    } else {
      const params = [resultItem.id.toString()]
      console.log("removePointFromMap -- Point was an old one.", resultItem, params)
      this.channel.postRequest('MapModulePlugin.RemoveMarkersRequest', params)
    }
  }
}