import { Injectable } from '@angular/core';
import * as GeoJSON from "geojson"
import proj4 from 'proj4';
import { EPSG3067, EPSG4326, MARKER_OPTIONS, geometryTypePoint, geometryTypePolygon } from './config'
import { ResultItem } from '../service/model'

@Injectable()
export class GeoService {

  constructor() { }

  marker(coordinates: number[]): any {
    return Object.assign({ y: coordinates[0], x: coordinates[1] }, MARKER_OPTIONS)
  }

  resultItemMarker(resultItem: ResultItem): any {
    const geometry: GeoJSON.Point = resultItem.geometry as GeoJSON.Point
    console.log(this.toEPSG4326(geometry.coordinates[0], geometry.coordinates[1]))
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

  isPoint(resultItem: ResultItem) {
    return resultItem && resultItem.geometry && resultItem.geometry.type == geometryTypePoint
  }

  isPolygon(resultItem: ResultItem) {
    return resultItem && resultItem.geometry && resultItem.geometry.type == geometryTypePolygon
  }

  point(lat: number, lon: number): GeoJSON.Point {
    return {
      type: 'Point',
      coordinates: [lat, lon]
    }
  }

  // Same as WGS84
  toEPSG4326(lat, lon): Coordinates {
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
    return this.hour + "°" + this.minute + "'" + this.formatAsString(this.second, decimals) + "\""
  }

  formatAsString(value: number, decimals?: number) : string {
    const rounded = this.round(value, decimals)
    return rounded.toString().replace(".", ",")
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