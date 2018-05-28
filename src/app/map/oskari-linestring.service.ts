import { Injectable } from '@angular/core'
import { GeoService } from './geo.service'
import { ResultItem } from '../service/model'

/**
 * No Injectable annotation, since this has to be instantiated manually
 *
 * @Injectable()
 */
export class OskariLineStringService {
  readonly drawLineId: string = 'drawLine'
  readonly layerIdPrefix: string = 'linestring-'
  geoService: GeoService
  channel: any

  constructor(geoService: GeoService, channel: any) {
    this.geoService = geoService
    this.channel = channel
  }

  lineLayerIdForId(id: string | number): string {
    return this.layerIdPrefix + id.toString()
  }

  lineIdForLayerId(layerId: string): number {
    return Number(layerId.substr(this.layerIdPrefix.length))
  }

  addLineToMap(resultItem: ResultItem) {
    const params = [resultItem.geometry, {
      clearPrevious: false,
      layerId: this.lineLayerIdForId(resultItem.id)
    }]
    console.log('addLineToMap', resultItem, params)
    this.channel.postRequest('MapModulePlugin.AddFeaturesToMapRequest', params)
  }

  startDrawLineString() {
    const params = [this.drawLineId, 'LineString']
    console.log('startDrawLineString', params)
    this.channel.postRequest('DrawTools.StartDrawingRequest', params)
  }

  stopDrawLineString() {
    const params = [this.drawLineId, 'LineString']
    console.log('stopDrawLineString', params)
    this.channel.postRequest('DrawTools.StopDrawingRequest', params)
  }

  removeLineFromMap(resultItem: ResultItem) {
    console.log('removeLineFromMap', resultItem)
    // Removes finished drawings
    const item = resultItem as any
    const id = item.isNew ? this.drawLineId : resultItem.id
    if (item.isNew) this.removeLineFromMapById(this.drawLineId)
    else this.removeLineFromMapByLayerId(this.lineLayerIdForId(resultItem.id))
  }

  removeLineFromMapById(id: string) {
    // Removes finished drawings
    const params = [id.toString(), true]
    console.log('removeLineFromMapById', params)
    this.channel.postRequest('DrawTools.StopDrawingRequest', params)
  }

  removeLineFromMapByLayerId(layerId: string) {
    // Removes finished drawings
    const params = [null, null, layerId]
    console.log('removeLineFromMapByLayerId', params)
    this.channel.postRequest('MapModulePlugin.RemoveFeaturesFromMapRequest', params)
  }

  replaceDrawingWithLineOnMap(resultItem: ResultItem) {
    this.addLineToMap(resultItem)
    this.removeLineFromMapById(this.drawLineId)
  }
}
