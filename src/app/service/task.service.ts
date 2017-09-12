import { Injectable } from '@angular/core';

import { Task, TaskTemplate } from './model'
import { TaskTemplateService } from './task-template.service'

@Injectable()
export class TaskService {
  tasks: Task[] = []
  // Remove this when real api is in use and you dont have to create taskCodes in UI
  private codeCreator: TaskCodeCreator = new TaskCodeCreator(new StableRandom(1))

  constructor(private taskTemplateService: TaskTemplateService) {
    taskTemplateService.getTaskTemplates().then(t => this.tasks = t.map(template => this.toTask(template, this.codeCreator)))
  }

  private toTask(template: TaskTemplate, codeCreator: TaskCodeCreator): Task {
    let code: string = codeCreator.createCode()
    return {
      id: template.id,
      name: template.name,
      title: template.title,
      description: template.description,
      instructions: template.instructions,
      info: template.info,
      tags: template.tags,
      code: code
    }
  }

  getTasks(): Promise<Task[]> {
    return Promise.resolve(this.tasks)
  }

  getTask(id: number): Promise<Task> {
    const task = this.tasks.find(t => t.id == id)
    return Promise.resolve(task)
  }

  createTaskFrom(id: number, name: string): Promise<Task> {
    return this.taskTemplateService.getTaskTemplate(id).then(template => {
      let task = this.toTask(template, this.codeCreator)
      task.name = name
      task.id = this.tasks.length + 1
      this.tasks.push(task)
      return task
    })
  }
}

// Remove this when real api is in use and you dont have to create taskCodes in UI
class StableRandom {
  constructor(private seed: number) {
  }

  random(): number {
    const x = Math.sin(this.seed++) * 10000
    return x - Math.floor(x)
  }
}

// Remove this when real api is in use and you dont have to create taskCodes in UI
class TaskCodeCreator {
  constructor(private random: StableRandom) { }

  createCode() {
    var text: string = "";
    var possible: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    for (var i = 0; i < 6; i++)
      text += possible.charAt(Math.floor(this.random.random() * possible.length))
    return text
  }
}
