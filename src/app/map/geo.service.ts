import { Injectable } from '@angular/core'
import * as GeoJSON from 'geojson'
import proj4 from 'proj4'
import { ResultItem, Geometry, Point, FeatureCollection, PolygonFeatureCollection } from '../service/model'
import { EPSG3067, EPSG4326, MARKER_OPTIONS, LOCATION_OPTIONS, geometryTypePoint, geometryTypePolygon,
  geometryTypeFeatureCollection } from './config'

@Injectable()
export class GeoService {
  constructor() {
  }

  marker(coordinates: number[]): any {
    return Object.assign({ y: coordinates[0], x: coordinates[1] }, MARKER_OPTIONS)
  }

  location(lat: number, lon: number): any {
    return Object.assign({ y: lat, x: lon }, LOCATION_OPTIONS)
  }

  resultItemMarker(resultItem: ResultItem): any {
    const geometry: GeoJSON.Point = resultItem.geometry as GeoJSON.Point
    console.log(this.toWGS84(geometry.coordinates[0], geometry.coordinates[1]))
    return this.marker(geometry.coordinates)
  }

  cloneResultItem(resultItem: ResultItem): ResultItem {
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

  polygonResultItem(resultId: number, geojson: PolygonFeatureCollection): ResultItem {
    return {
      resultId: resultId,
      geometry: geojson as PolygonFeatureCollection,
    }
  }

  isPoint(resultItem: ResultItem) {
    return resultItem && resultItem['geometry'] && resultItem.geometry.type === geometryTypePoint
  }

  isPolygon(resultItem: ResultItem) {
    if (!(resultItem && resultItem['geometry']))
      return false
    const geometry: Geometry = resultItem.geometry
    if (geometry.type === geometryTypeFeatureCollection) {
      const featureCollection = geometry as FeatureCollection
      return featureCollection.features.every(feature => feature.geometry.type === geometryTypePolygon)
    }
    return false
  }

  point(lat: number, lon: number): GeoJSON.Point {
    return {
      type: 'Point',
      coordinates: [lat, lon]
    }
  }

  pointWGS84Coordinates(resultItem: ResultItem): Coordinates | null {
    if (this.isPoint(resultItem)) {
      const geometry = resultItem.geometry as GeoJSON.Point
      return this.toWGS84(geometry.coordinates[0], geometry.coordinates[1])
    }
    return null
  }

  polygonCoordinates(resultItem: ResultItem): number[][] {
    const polygon = resultItem.geometry as PolygonFeatureCollection
    const features = polygon.features
    const coordinates = polygon.features.map(f => f.geometry.coordinates)
    if (features.length !== 1 || coordinates.length !== 1) {
      throw Error('Failed to get coordinates for polygon: ' + JSON.stringify(polygon))
    }
    return coordinates[0][0]
  }

  polygonWGS84Coordinates(resultItem: ResultItem): Coordinates[] {
    const coordinates = this.polygonCoordinates(resultItem)
    coordinates.forEach(console.log)
    return coordinates.map(c => this.toWGS84(c[0], c[1]))
  }

  // Same as WGS84
  toWGS84(lat, lon): Coordinates {
    // FYI: Now you have to give the coordinates in different order than with oskari-coordinates
    const coordinates = proj4(EPSG3067, EPSG4326, [lon, lat])
    return new Coordinates(coordinates[1], coordinates[0])
  }
}
export class HourMinuteSecond {
  hour: number
  minute: number
  second: number

  constructor(private coordinate: number) {
    this.hour = Math.floor(coordinate)
    const minutesExact = (coordinate - this.hour) * 60
    this.minute = Math.floor(minutesExact)
    const secondsExact = (minutesExact - this.minute) * 60
    this.second = secondsExact
  }

  asString(decimals?: number): string {
    return this.hour + '°' + this.minute + '\'' + this.formatAsString(this.second, decimals) + '\''
  }

  formatAsString(value: number, decimals?: number): string {
    const rounded = this.round(value, decimals)
    return rounded.toString().replace('.', ',')
  }

  round(value: number, decimals?: number) {
    if (decimals) return value.toFixed(decimals)
    else return value
  }
}

export class Coordinates {
  lat: HourMinuteSecond
  lon: HourMinuteSecond
  constructor(private latitude: number, private longitude: number) {
    this.lat = new HourMinuteSecond(latitude)
    this.lon = new HourMinuteSecond(longitude)
  }
}
