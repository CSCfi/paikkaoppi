import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { AuthService } from '../service/auth.service'
import { TaskTemplateComponent } from '../task-template/task-template.component'
import { TaskTemplateService } from '../service/task-template.service'
import { TaskService } from '../service/task.service'
import { ConversionService } from '../service/conversion.service'
import { TaskTemplate, User, Role, TaskType } from '../service/model'

@Component({
  selector: 'app-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.css']
})
export class LibraryComponent implements OnInit {
  taskTemplates?: TaskTemplate[] = []
  selectedTemplateForTask?: TaskTemplate
  selectedTemplate?: TaskTemplate
  model: NewTaskModel = new NewTaskModel(null)
  showDeleteTaskTemplateComponent = false
  role: Role

  constructor(private taskTemplateService: TaskTemplateService,
    private authService: AuthService,
    private taskService: TaskService,
    private conversionService: ConversionService,
    private router: Router) { }

  ngOnInit() {
    this.loadTaskTemplates()
    this.role = this.authService.getRole()
  }

  private loadTaskTemplates() {
    this.taskTemplateService.getTaskTemplates().subscribe(
      (data) => {
        this.taskTemplates = data
      })
  }

  getTaskTypeClass(type: TaskType) {
    return 'type--' + this.conversionService.taskTypeToOrderNumber(type)
  }

  isCreator(template: TaskTemplate) {
    return this.authService.getUsername() === template.user.username
  }

  createTask(id: number) {
    console.info("Create task from template ", id)
    this.taskTemplateService.getTaskTemplate(id)
      .subscribe(
      (data) => {
        this.selectedTemplateForTask = data
        this.model = new NewTaskModel(data.name)
      })
  }

  showDeleteTaskTemplateDialog(id: number) {
    console.log('showDeleteTaskTemplateDialog for template id: ' + id)
    this.taskTemplateService.getTaskTemplate(id)
      .subscribe(
      (data) => {
        this.selectedTemplate = data
        this.showDeleteTaskTemplateComponent = true
      })
  }

  deleteTaskTemplate() {
    console.log('deleteTaskTemplate') 
    this.showDeleteTaskTemplateComponent = false
    this.loadTaskTemplates()
  }

  closePopup() {
    console.log("closePopup")
    this.selectedTemplateForTask = null
    this.model = null
  }

  onSubmit() {
    console.log("onSubmit")
    this.taskService.createTaskFrom(this.selectedTemplateForTask.id, this.model.name).subscribe(
      (data) => {
        if (this.authService.isTeacher())
          this.router.navigate(["/dashboard", data.id])
        else
          this.router.navigate(["/map", data.id])
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
