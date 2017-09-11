export interface Instruction {
    name: string
    description: string
}

export interface Task {
    id: number
    name: string
    title: string
    description: string
    instructions: Instruction[]
    info: string
    tags: string[]
    code: string
}

export interface TaskTemplate {
    id: number
    name: string
    title: string
    description: string
    instructions: Instruction[]
    info: string
    tags: string[]
}