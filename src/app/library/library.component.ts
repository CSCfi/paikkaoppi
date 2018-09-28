import { Observable } from 'rxjs/Rx';
import { Component, OnInit } from '@angular/core'
import { Router, ActivatedRoute, ParamMap } from '@angular/router'
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
  taskTemplateId?: number
  
  constructor(private taskTemplateService: TaskTemplateService,
    private authService: AuthService,
    private taskService: TaskService,
    private conversionService: ConversionService,
    private route: ActivatedRoute,
    private router: Router) { }

  ngOnInit() {
    this.role = this.authService.getRole()
    this.username = this.authService.getUsername()

    this.route.paramMap
      .switchMap((params: ParamMap) => Observable.of(params.has('id') ? +params.get('id') : null))
      .subscribe(id => {
        this.taskTemplateId = id
        this.loadTaskTemplates()
      })
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
      creator: 'ALL',
      type: 'ALL',
      visibility: 'ALL'
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
    else if (type === 'visibility')
      this.cFilter.visibility = value

    this.setVisibleTaskTemplates()
  }

  private setVisibleTaskTemplates() {
    if (this.cFilter.creator === 'ALL' && this.cFilter.type === 'ALL') {
      this.taskTemplates = this.allTaskTemplates
    } else if (this.cFilter.type === 'ALL') {
      this.taskTemplates = this.allTaskTemplates.filter(t => t.user.username === this.username)
    } else if (this.cFilter.creator === 'ALL') {
      this.taskTemplates = this.allTaskTemplates.filter(t => t.type === this.cFilter.type)
    } else {
      this.taskTemplates = this.allTaskTemplates.filter(t => t.type === this.cFilter.type).filter(t => t.user.username === this.username)
    }

    if (this.cFilter.visibility !== 'ALL') {
      this.taskTemplates = this.taskTemplates.filter(t => t.visibility === this.cFilter.visibility);
    }
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
    this.showDeleteTaskTemplateComponent = false
    this.loadTaskTemplates()
  }

  closeTaskTemplateDialog() {
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
