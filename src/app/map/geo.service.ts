import { Injectable } from '@angular/core';
import { Config } from './config'
import * as GeoJSON from "geojson"
import { ResultItem } from '../service/model'

@Injectable()
export class GeoService {

  constructor() { }

  marker(coordinates: number[]): any {
    return Object.assign({ y: coordinates[0], x: coordinates[1] }, Config.markerOptions)
  }

  resultItemMarker(resultItem: ResultItem) : any {
    const geometry: GeoJSON.Point = resultItem.geometry as GeoJSON.Point
    return this.marker(geometry.coordinates)
  }

  cloneResultItem(resultItem: ResultItem) : ResultItem {
    return {
      id: resultItem.id,
      resultId: resultItem.resultId,
      geometry: resultItem.geometry,
      name: resultItem.name,
      description: resultItem.description
    }
  }

  pointResultItem(resultId: number, lat: number, lon: number): ResultItem {
    return {
      resultId: resultId,
      geometry: this.point(lat, lon),
    }
  }

  point(lat: number, lon: number): GeoJSON.Point {
    return {
      type: 'Point',
      coordinates: [lat, lon]
    }
  }
}