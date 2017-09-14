import { Injectable } from '@angular/core';

import { Task, TaskTemplate, Result, ResultItem, Sequence, TaskCodeCreator, StableRandom } from './model'
import { TaskTemplateService } from './task-template.service'

@Injectable()
export class TaskService {
  newTaskCount = 0
  allTasks: Task[] = []
  tasks: Task[] = []
  taskSequence = new Sequence()
  resultSequence = new Sequence()
  resultItemSequence = new Sequence()
  userId = "test.user@test.test"

  // Remove this when real api is in use and you dont have to create taskCodes in UI
  private codeCreator: TaskCodeCreator = new TaskCodeCreator(new StableRandom(1))

  constructor(private taskTemplateService: TaskTemplateService) {
    taskTemplateService.getTaskTemplates().then(t => {
      this.allTasks = t.map(template => this.toTask(template))
      this.addTaskForUser(this.allTasks[0])
    })
  }

  getTasks(): Promise<Task[]> {
    return Promise.resolve(this.tasks)
  }

  getTask(id: number): Promise<Task> {
    const task = this.tasks.find(t => t.id == id)
    return Promise.resolve(task)
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

  private addTaskForUser(task: Task): Task {
    console.log("addTaskForUser:", task)
    let result: Result = {
      id: this.resultSequence.next(),
      taskId: task.id,
      userId: this.userId,
      resultItems: []
    }

    const clonedTask = this.cloneTask(task)
    clonedTask.results = [result]
    this.tasks = [clonedTask].concat(this.tasks)
    return clonedTask
  }

  private toTask(template: TaskTemplate): Task {
    let code: string = this.codeCreator.createCode()
    return {
      id: this.taskSequence.next(),
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

  private cloneTask(task: Task): Task {
    return {
      id: this.taskSequence.next(),
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
  }
}