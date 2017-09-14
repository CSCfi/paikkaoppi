import { Injectable } from '@angular/core';

import { Task, TaskTemplate, Result, ResultItem, Sequence, TaskCodeCreator, StableRandom } from './model'
import { TaskTemplateService } from './task-template.service'

@Injectable()
export class TaskService {
  private newTaskCount = 0
  private allTasks: Task[] = []
  private tasks: Task[] = []
  private taskSequence = new Sequence()
  private resultSequence = new Sequence()
  private resultItemSequence = new Sequence()
  private userId = "test.user@test.test"

  // Remove this when real api is in use and you dont have to create taskCodes in UI
  private codeCreator: TaskCodeCreator = new TaskCodeCreator(new StableRandom(1))

  constructor(private taskTemplateService: TaskTemplateService) {
    taskTemplateService.getTaskTemplates().then(t => {
      this.allTasks = t.map(template => this.toTask(template))
      this.addTaskForUser(this.allTasks[0])
    })
  }

  getTasks(): Promise<Task[]> {
    return Promise.resolve(this.tasks.map(t => this.cloneTask(t, true, true)))
  }

  getTask(id: number, includeResultItems: boolean): Promise<Task> {
    const task = this.tasks.find(t => t.id == id)
    if (task != null)
      return Promise.resolve(this.cloneTask(task, true, includeResultItems))
    else
      return Promise.reject("Task not found with id " + id)
  }

  createTaskFrom(taskTemplateId: number, name: string): Promise<Task> {
    this.newTaskCount++
    return this.taskTemplateService.getTaskTemplate(taskTemplateId).then(template => {
      let task = this.toTask(template)
      task.name = name
      return this.addTaskForUser(task)
    })
  }

  getAllCodes(): string[] {
    return this.allTasks.map(t => t.code)
  }

  addTaskWithCode(code: string): Promise<Task> {
    const upperCaseCode = code.toUpperCase()
    console.info("addTaskWithCode:", upperCaseCode)
    if (this.tasks.find(t => t.code == upperCaseCode) != null) {
      console.log("Task already added, rejecting result")
      return Promise.reject("Task already added with code " + upperCaseCode)
    }
    const task = this.allTasks.find(t => t.code == upperCaseCode)
    if (task == null) {
      console.info("No task found with code:", upperCaseCode)
      return Promise.reject("No task found with code " + upperCaseCode)
    } else {
      return Promise.resolve(this.addTaskForUser(task))
    }
  }

  saveResultItem(resultId: number, resultItem: ResultItem): Promise<ResultItem> {
    try {
      const result = this.findResultById(resultId)
      const clonedItem = this.cloneResultItem(resultItem)
      clonedItem.id = this.resultItemSequence.next()
      result.resultItems.push(clonedItem)
      return Promise.resolve(this.cloneResultItem(clonedItem))
    } catch (e) {
      console.error(e)
      return Promise.reject("Failed to save ResultItem for resultId " + resultId + " with data " + resultItem)
    }
  }

  removeResultItem(resultItemId: number): Promise<number> {
    try {
      const result = this.findResultWithItemId(resultItemId)
      result.resultItems = result.resultItems.filter(i => i.id != resultItemId)
      return Promise.resolve(resultItemId)
    } catch (e) {
      console.error(e)
      return Promise.reject("Failed to remove resultItem with id " + resultItemId)
    }
  }

  updateResultItem(resultItemId: number, resultItem: ResultItem): Promise<ResultItem> {
    try {
      const result = this.findResultWithItemId(resultItem.id)
      result.resultItems = result.resultItems.filter(i => i.id != resultItem.id)
      const clonedItem = this.cloneResultItem(resultItem)
      result.resultItems.push(clonedItem)
      return Promise.resolve(this.cloneResultItem(clonedItem))
    } catch (e) {
      console.error(e)
      return Promise.reject("Failed to update resultItem. Item: " + JSON.stringify(resultItem))
    }
  }

  private addTaskForUser(task: Task): Task {
    console.log("addTaskForUser:", task)
    const clonedTask = this.cloneTask(task, false, false)
    clonedTask.id = this.taskSequence.next()
    let result: Result = {
      id: this.resultSequence.next(),
      taskId: clonedTask.id,
      userId: this.userId,
      resultItems: []
    }
    clonedTask.results = [result]
    this.tasks = [clonedTask].concat(this.tasks)
    return clonedTask
  }

  private toTask(template: TaskTemplate): Task {
    let code: string = this.codeCreator.createCode()
    return {
      id: 0,
      taskTemplateId: template.id,
      name: template.name,
      title: template.title,
      description: template.description,
      instructions: template.instructions,
      info: template.info,
      tags: template.tags,
      code: code,
      results: []
    }
  }

  private cloneTask(task: Task, includeResults: boolean, includeResultItems: boolean): Task {
    const cloned: Task = {
      id: task.id,
      taskTemplateId: task.taskTemplateId,
      name: task.name,
      title: task.title,
      description: task.description,
      instructions: task.instructions,
      info: task.info,
      tags: task.tags,
      code: task.code,
      results: []
    }
    if (includeResults) {
      cloned.results = task.results.map(r => this.cloneResult(r, includeResultItems))
    }
    return cloned
  }

  private cloneResult(result: Result, includeResultItems: boolean): Result {
    const cloned: Result = {
      id: result.id,
      taskId: result.taskId,
      userId: result.userId,
      resultItems: []
    }
    if (includeResultItems) {
      cloned.resultItems = result.resultItems.map(this.cloneResultItem)
    }
    return cloned
  }

  private cloneResultItem(resultItem: ResultItem): ResultItem {
    return {
      id: resultItem.id,
      resultId: resultItem.resultId,
      geometry: resultItem.geometry,
      name: resultItem.name,
      description: resultItem.description
    }
  }

  private findResultById(resultId: number): Result {
    for (let task of this.tasks) {
      let result = task.results.find(r => r.id == resultId)
      if (result != null) {
        return result
      }
    }
    throw new Error("Result not found with id " + resultId)
  }

  private findResultWithItemId(resultItemId: number): Result {
    for (let task of this.tasks) {
      for (let result of task.results) {
        let resultItem: ResultItem = result.resultItems.find(r => r.id == resultItemId)
        if (resultItem != null)
          return result
      }
    }
    throw new Error("ResultItem not found with id " + resultItemId)
  }
}
