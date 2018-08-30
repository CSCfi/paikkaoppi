import * as GeoJSON from "geojson"
import { MapAction } from '../map/oskari-rpc.component'
import { Result } from './model-result'

export type Role = "teacher" | "student"
export type TaskType = "INVESTIGATE" | "ACT" | "PUZZLE"
export type Visibility = "OPEN" | "RESTRICTED"

export class Roles {
  static teacherRole: Role = "teacher"
  static studentRole: Role = "student"
}

export interface User {
  username: string,
  firstName: string,
  lastName: string,
  role: Role,
  municipality: string,
  school: string,
  schoolClass: string,
  profile: number
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
    type: string
    visibility: Visibility
    resultVisibility: Visibility
    title: string
    description: string
    instructions: Instruction[]
    info: string
    tags: string[]
    ops: any
    user: User
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
    visibility: Visibility
    title: string
    description: string
    instructions: Instruction[]
    info: string
    tags: string[]
    code: string
    user: User
    results: Result[]
}

export interface TaskDashboard {
    id: number
    name: string
    code: string
    creator: string
    resultItemCount: number
}

export interface ResultItem {
    id?: number
    resultId: number
    geometry: Geometry
    visibility?: Visibility
    name?: string
    description?: string
    attachments?: Attachment[]
}

export interface Attachment {
    id: number
    name: string
    contentType: string
    sizeInBytes: number
}

export interface Grade {
    id: number
    name: string
}

export interface WideKnowledge {
    id: number
    name: string
}

export interface Subject {
    id: number
    name: string
    parent: Subject
    childs: Subject[]
}

export interface Target {
    id: number
    name: string
}

export interface ContentArea {
    id: number
    name: string
}

export type Geometry = Point | PolygonFeatureCollection | LineString | LineStringFeatureCollection
export type Point = GeoJSON.Point
export type FeatureCollection = GeoJSON.FeatureCollection<GeoJSON.GeometryObject>
export type PolygonFeatureCollection = GeoJSON.FeatureCollection<GeoJSON.Polygon>
export type LineStringFeatureCollection = GeoJSON.FeatureCollection<GeoJSON.LineString>
export type LineString = GeoJSON.LineString
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
        let text = ''
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

        for (let i = 0; i < 6; i++)
            text += possible.charAt(Math.floor(this.random.random() * possible.length))
        return text
    }
}
