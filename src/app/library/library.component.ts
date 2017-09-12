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
  taskName?: string

  constructor(private taskTemplateService: TaskTemplateService,
    private taskService: TaskService, private router: Router) { }

  ngOnInit() {
    this.taskTemplateService.getTaskTemplates().then(t => this.taskTemplates = t)
  }

  createTask(id: number) {
    console.info("Create task from template ", id)

    this.taskTemplateService.getTaskTemplate(id).then(t => {
      this.selectedTemplate = t
    })
  }

  closePopup() {
    this.selectedTemplate = null
  }

  createButtonPressed() {
    this.taskService.createTaskFrom(this.selectedTemplate.id, this.taskName).then(
      t => this.router.navigateByUrl("/dashboard")
    )
  }
}
