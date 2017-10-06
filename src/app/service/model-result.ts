import {ResultItem, User} from './model'

export interface Result {
    id: number
    taskId: number
    user: User
    resultItems: ResultItem[]
}
