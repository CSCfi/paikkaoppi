import { Observable } from 'rxjs/Rx';
import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, ParamMap, Router } from '@angular/router'
import { AuthService } from '../service/auth.service'
import { TaskTemplateService } from '../service/task-template.service'
import { TaskService } from '../service/task.service'
import { ConversionService } from '../service/conversion.service'
import { Grade, Role, Subject, TaskTemplate, TaskType } from '../service/model'

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
  gradesMap: Map<Number, Grade> = new Map<Number, Grade>()
  grades: Grade[]
  subjectMap: Map<Number, Subject> = new Map<Number, Subject>()
  subjects: Subject[]

  constructor(private taskTemplateService: TaskTemplateService,
              private authService: AuthService,
              private taskService: TaskService,
              private conversionService: ConversionService,
              private route: ActivatedRoute,
              private router: Router) {
  }

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
        this.allTaskTemplates.filter(value => value.ops)
          .forEach(value => {
            this.addToGradesMap(<Grade[]>value.ops.grades)
            this.addToSubjectsMap(<Subject[]>value.ops.subjects)
          })
        this.grades = Array.from(this.gradesMap.values())
        this.subjects = Array.from(this.subjectMap.values())
        this.initFilter()
        this.setVisibleTaskTemplates()
      })
  }

  private addToGradesMap(grades: Grade[]) {
    if (!grades) {
      return
    }
    grades.forEach(g => this.gradesMap.set(g.id, g))
  }

  private addToSubjectsMap(subjects: Subject[]) {
    if (!subjects) {
      return
    }
    subjects.forEach(s => this.subjectMap.set(s.id, s))
  }

  private initFilter() {
    return {
      creator: 'ALL',
      type: 'ALL',
      visibility: 'ALL',
      grade: null,
      subject: null
    }
  }

  getGradeName(id: number) {
    return this.gradesMap.get(id) ? this.gradesMap.get(id).name : ''
  }

  getSubjectName(id: number) {
    return this.subjectMap.get(id) ? this.subjectMap.get(id).name : ''
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
    else if (type === 'grade')
      this.cFilter.grade = value ? parseInt(value) : null
    else if (type === 'subject')
      this.cFilter.subject = value ? parseInt(value) : null

    this.setVisibleTaskTemplates()
  }

  private setVisibleTaskTemplates() {
    this.taskTemplates = this.allTaskTemplates
      .filter(t => this.cFilter.type === 'ALL' || t.type === this.cFilter.type)
      .filter(t => this.cFilter.creator === 'ALL' || t.user.username === this.username)
      .filter(t => this.cFilter.visibility === 'ALL' || t.visibility === this.cFilter.visibility)
      .filter(t => !this.cFilter.grade || (t.ops && (<Grade[]>t.ops.grades)
        .some(grade => grade.id === this.cFilter.grade)))
      .filter(t => !this.cFilter.subject || (t.ops && (<Subject[]>t.ops.subjects)
        .some(subject => subject.id === this.cFilter.subject)))
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
