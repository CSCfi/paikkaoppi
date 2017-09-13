import * as GeoJSON from "geojson"

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
    results: Result[]
}

export interface Result {
    id: number
    taskId: number
    userId: string
    resultItems: ResultItem[]
}

export interface ResultItem {
    id: number
    resultId: number
    geometry: Geometry
    name: string
    description: string
}

// only point and polygon current supported by domain.
export type Geometry = GeoJSON.Point | GeoJSON.Polygon

export interface Mark {
    id: number
    markerId: string
    lat: number
    lon: number
    name: string
    description: string
}
