import { Injectable } from '@angular/core';

import { Task, TaskTemplate } from './model'
import { TaskTemplateService } from './task-template.service'

@Injectable()
export class TaskService {
  tasks: Task[] = []

  constructor(private taskTemplateService: TaskTemplateService) {
    this.tasks = taskTemplateService.getTaskTemplates().map(this.toTask)
  }

  private toTask(template: TaskTemplate): Task {
    function createCode() : string {
      var text : string = "";
      var possible : string = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  
      for (var i = 0; i < 6; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      return text;
    }
  
    let code : string = createCode()
    return {
      name: template.name,
      title: template.title,
      description: template.description,
      code: code
    }
  }

   getTasks(): Task[] {
    return this.tasks
  }
}
