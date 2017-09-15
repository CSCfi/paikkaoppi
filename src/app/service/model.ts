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