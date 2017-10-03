import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { AuthService } from '../service/auth.service'
import { TaskTemplateService } from '../service/task-template.service'
import { TaskService } from '../service/task.service'
import { TaskTemplate, User, Role } from '../service/model'

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
    this.taskTemplateService.getTaskTemplate(id)
      .subscribe(
      (data) => {
        this.selectedTemplate = data
        this.model = new NewTaskModel(data.name)
      }
      )
  }

  closePopup() {
    console.log("closePopup")
    this.selectedTemplate = null
    this.model = null
  }

  onSubmit() {
    console.log("onSubmit")
    this.taskService.createTaskFrom(this.selectedTemplate.id, this.model.name).subscribe(
      (data) => {
        console.log(data)
        this.router.navigate(["/dashboard", data.id])
      }
    )
  }
}

export class NewTaskModel {
  name?: string

  constructor(name: string) {
    this.name = name
  }
}