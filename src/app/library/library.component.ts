import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User, Role, AuthService } from '../service/auth.service'
import { TaskTemplateService } from '../service/task-template.service'
import { TaskService } from '../service/task.service'
import { TaskTemplate } from '../service/model'

@Component({
  selector: 'app-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.css']
})
export class LibraryComponent implements OnInit {
  taskTemplates?: TaskTemplate[] = []
  selectedTemplate?: TaskTemplate
  model: NewTaskModel = new NewTaskModel(null)

  constructor(private taskTemplateService: TaskTemplateService,
    private taskService: TaskService, private router: Router) { }

  ngOnInit() {
    this.taskTemplateService.getTaskTemplates().subscribe(
      (data) => {
        this.taskTemplates = data
      })
  }

  createTask(id: number) {
    console.info("Create task from template ", id)
    this.taskTemplateService.getTaskTemplate(id).then(t => {
      this.selectedTemplate = t
      this.model = new NewTaskModel(t.name)
    })
  }

  closePopup() {
    this.selectedTemplate = null
    this.model = null
  }

  onSubmit() {
    this.taskService.createTaskFrom(this.selectedTemplate.id, this.model.name).then(
      newTask => this.router.navigate(["/dashboard", newTask.id])
    )
  }
}

export class NewTaskModel {
  name?: string

  constructor(name: string) {
    this.name = name
  }
}