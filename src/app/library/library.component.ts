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
  allTaskTemplates?: TaskTemplate[] = []
  taskTemplates?: TaskTemplate[] = []
  selectedTemplateForTask?: TaskTemplate
  selectedTemplate?: TaskTemplate
  selectedDropdown?: number
  selectedFilter?: string
  cFilter = this.initFilter()
  model: NewTaskModel = new NewTaskModel(null)
  showDeleteTaskTemplateComponent = false
  username: string
  role: Role
  
  constructor(private taskTemplateService: TaskTemplateService,
    private authService: AuthService,
    private taskService: TaskService,
    private conversionService: ConversionService,
    private router: Router) { }

  ngOnInit() {
    this.loadTaskTemplates()
    this.role = this.authService.getRole()
    this.username = this.authService.getUsername()
  }

  private loadTaskTemplates() {
    this.taskTemplateService.getTaskTemplates().subscribe(
      (data) => {
        this.allTaskTemplates = data
        this.initFilter()
        this.setVisibleTaskTemplates()
      })
  }

  private initFilter() {
    return {
      creator: 'Kaikki',
      type: 'Kaikki'
    }
  }

  getTaskTypeClass(type: TaskType) {
    return 'type--' + this.conversionService.taskTypeToOrderNumber(type)
  }

  toggleFilter(filter: string) {
    this.selectedFilter = this.selectedFilter === filter ? null : filter
  }

  isFilterOpen(filter: string) {
    return this.selectedFilter === filter
  }

  toggleDropdown(index: number) {
    this.selectedDropdown = this.selectedDropdown === index ? null : index
  }

  isDropdownOpen(index: number) {
    return this.selectedDropdown === index
  }

  filter(type: string, value: string) {
    if (type === 'creator')
      this.cFilter.creator = value
    else if (type === 'type')
      this.cFilter.type = value

    this.setVisibleTaskTemplates()
  }

  private setVisibleTaskTemplates() {
    if (this.cFilter.creator === 'Kaikki' && this.cFilter.type === 'Kaikki') {
      this.taskTemplates = this.allTaskTemplates
    } else if (this.cFilter.type === 'Kaikki') {
      this.taskTemplates = this.allTaskTemplates.filter(t => t.user.username === this.username)
    } else if (this.cFilter.creator === 'Kaikki') {
      this.taskTemplates = this.allTaskTemplates.filter(t => t.type === this.getType(this.cFilter.type))
    } else {
      this.taskTemplates = this.allTaskTemplates.filter(t => t.type === this.getType(this.cFilter.type)).filter(t => t.user.username === this.username)
    }
  }

  private getType(type: string): string {
    if (type === 'Tutki') return 'INVESTIGATE'
    else if (type === 'Toimi') return 'ACT'
    else return 'PUZZLE'
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

  closeTaskTemplateDialog() {
    console.log("closeTaskTemplateDialog")
    this.showDeleteTaskTemplateComponent = false
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
