import { Injectable } from '@angular/core';

import { Task, TaskTemplate } from './model'
import { TaskTemplateService } from './task-template.service'

@Injectable()
export class TaskService {
  tasks: Task[] = []

  constructor(private taskTemplateService: TaskTemplateService) {
    taskTemplateService.getTaskTemplates().then( t => this.tasks = t.map(this.toTask))
  }

  private toTask(template: TaskTemplate): Task {
    function createCode(): string {
      var text: string = "";
      var possible: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

      for (var i = 0; i < 6; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      return text;
    }
    let code: string = createCode()
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
    const task = this.tasks.find( t => t.id == id)
    return Promise.resolve(task)
  }

  createTaskFrom(id: number, name: string) : Promise<Task> {
    return this.taskTemplateService.getTaskTemplate(id).then( template => {
      let task = this.toTask(template)
      task.name = name
      this.tasks.push(task)
      return task
    })
  }
}
