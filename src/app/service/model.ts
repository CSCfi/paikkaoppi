import * as GeoJSON from "geojson"
import { MapAction } from '../map/oskari-rpc.component'
import { Result } from './model-result'

export type Role = "teacher" | "student"

export class Roles {
  static teacherRole: Role = "teacher"
  static studentRole: Role = "student"
}

export interface User {
  username: string,
  email: string,
  firstName: string,
  lastName: string,
  role: Role
}

/**
 * `TaskTemplate` is a template for a task, which contain all information about the `Task`.
 * `TaskTemplate` can be instantiated as a `Task`, and then code is generated for the `Task`.
 * All students in the class will perform the same `Task` instance. 
 * When students save their results they will add a `Result` to the `Task` with their userId.
 * Each student has their own `Result` which groups all the answers together.
  */
export interface TaskTemplate {
    id: number
    name: string
    title: string
    description: string
    instructions: Instruction[]
    info: string
    tags: string[]
}

export interface Instruction {
    name: string
    description: string
}

/**
 * For a student task has 0-1 results.
 * For a teacher task has 0-* results.
 */
export interface Task {
    id: number
    taskTemplateId: number
    name: string
    title: string
    description: string
    instructions: Instruction[]
    info: string
    tags: string[]
    code: string
    user: User
    results: Result[]
}

export interface ResultItem {
    id?: number
    resultId: number
    geometry: Geometry
    name?: string
    description?: string
}

export interface Message {
    class: string
    description: string,
    action: MapAction
}

export type MessageType = 'info' | 'warn' | 'error'

export type Geometry = Point | PolygonFeatureCollection
export type Point = GeoJSON.Point
export type FeatureCollection = GeoJSON.FeatureCollection<GeoJSON.GeometryObject>
export type PolygonFeatureCollection = GeoJSON.FeatureCollection<GeoJSON.Polygon>
// only point and polygon current supported by domain.

// Remove this when real api is in use and you dont have to create taskCodes in UI
export class StableRandom {
    constructor(private seed: number) {
    }

    random(): number {
        const x = Math.sin(this.seed++) * 10000
        return x - Math.floor(x)
    }
}

// Remove this when real api is in use and you dont have to create taskCodes in UI
export class TaskCodeCreator {
    constructor(private random: StableRandom) { }

    createCode() {
        var text: string = "";
        var possible: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

        for (var i = 0; i < 6; i++)
            text += possible.charAt(Math.floor(this.random.random() * possible.length))
        return text
    }
}

export class Sequence {
    value = 0
    next(): number {
        this.value = this.value + 1
        return this.value
    }
}