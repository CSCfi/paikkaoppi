import { Injectable } from '@angular/core'
import { GeoService } from './geo.service'
import { ResultItem } from '../service/model'

/**
 * No Injectable annotation, since this has to be instantiated manually
 *
 * @Injectable()
 */
export class OskariPolygonService {
  readonly drawAreaId: string = 'drawArea'
  readonly layerIdPrefix: string = 'polygon-'
  readonly measureLineId: string = 'measureLine'
  readonly measureAreaId: string = 'measureArea'
  geoService: GeoService
  channel: any

  constructor(geoService: GeoService, channel: any) {
    this.geoService = geoService
    this.channel = channel
  }

  polygonLayerIdForId(id: string | number): string {
    return this.layerIdPrefix + id.toString()
  }

  polygonIdForLayerId(layerId: string): number {
    return Number(layerId.substr(this.layerIdPrefix.length))
  }

  addPolygonToMap(resultItem: ResultItem) {
    const params = [resultItem.geometry, {
      clearPrevious: false,
      layerId: this.polygonLayerIdForId(resultItem.id)
    }]
    console.log('addPolygonToMap', resultItem, params)
    this.channel.postRequest('MapModulePlugin.AddFeaturesToMapRequest', params)
  }

  startDrawPolygon() {
    const params = [this.drawAreaId, 'Polygon']
    console.log('startDrawPolygon', params)
    this.channel.postRequest('DrawTools.StartDrawingRequest', params)
  }

  stopDrawPolygon() {
    // This removes unfinished drawings
    const params = [this.drawAreaId, false]
    console.log('stopDrawPolygon', params)
    this.channel.postRequest('DrawTools.StopDrawingRequest', params)
  }

  startMeasureLine() {
    const params = [this.measureLineId, 'LineString', {showMeasureOnMap: true, allowMultipleDrawing: 'single'}]
    console.log('startMeasureLine', params)
    this.channel.postRequest('DrawTools.StartDrawingRequest', params)
  }

  stopMeasureLine() {
    console.log('stopMeasureLine', this.measureLineId)
    this.channel.postRequest('DrawTools.StopDrawingRequest', [this.measureLineId, true])
    this.channel.postRequest('DrawTools.StopDrawingRequest', [this.measureLineId, false])
  }

  startMeasureArea() {
    const params = [this.measureAreaId, 'Polygon', {showMeasureOnMap: true, allowMultipleDrawing: 'single'}]
    console.log('startMeasureArea', params)
    this.channel.postRequest('DrawTools.StartDrawingRequest', params)
  }

  stopMeasureArea() {
    console.log('stopMeasureArea', this.measureAreaId)
    this.channel.postRequest('DrawTools.StopDrawingRequest', [this.measureAreaId, true])
    this.channel.postRequest('DrawTools.StopDrawingRequest', [this.measureAreaId, false])
  }

  removePolygonFromMap(resultItem: ResultItem) {
    console.log('removePolygonFromMap', resultItem)
    // Removes finished drawings
    const item = resultItem as any
    const id = item.isNew ? this.drawAreaId : resultItem.id
    if (item.isNew) this.removeDrawingFromMapById(this.drawAreaId)
    else this.removePolygonFromMapByLayerId(this.polygonLayerIdForId(resultItem.id))
  }

  removeDrawingFromMapById(id: string) {
    // Removes finished drawings
    const params = [id.toString(), true]
    console.log('removeDrawingFromMapById', params)
    this.channel.postRequest('DrawTools.StopDrawingRequest', params)
  }

  removePolygonFromMapByLayerId(layerId: string) {
    // Removes finished drawings
    const params = [null, null, layerId]
    console.log('removePolygonFromMapByLayerId', params)
    this.channel.postRequest('MapModulePlugin.RemoveFeaturesFromMapRequest', params)
  }

  replaceDrawingWithPolygonOnMap(resultItem: ResultItem) {
    this.addPolygonToMap(resultItem)
    this.removeDrawingFromMapById(this.drawAreaId)
  }
}
