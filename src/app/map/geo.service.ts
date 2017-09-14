import { Injectable } from '@angular/core';
import { Config } from './config'

@Injectable()
export class GeoService {

  constructor() { }

  marker(lat: number, lon: number) : any {
    return Object.assign( {y: lat, x: lon}, Config.markerOptions)
  } 
}