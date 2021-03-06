import { TranslateService } from '@ngx-translate/core';
import { forEach } from '@angular/router/src/utils/collection';
import 'rxjs/add/operator/switchMap';
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/of';
import { Component, OnInit } from '@angular/core'
import { ParamMap, ActivatedRoute } from '@angular/router'
import { AuthService } from '../service/auth.service'
import { TaskService } from '../service/task.service'
import { ProfileService } from '../service/profile.service'
import { ConversionService } from '../service/conversion.service'
import { Role, Task, TaskDashboard, User, TaskType } from '../service/model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  user: User
  role: Role
  tasks: TaskDashboard[]
  taskId?: number
  selectedDropdown?: number
  selectedTask?: Task
  profileEdit = false
  isProfileOpen = false
  showDeleteTaskComponent = false
  // For Proto
  unusedCodes: string[]
  
  constructor(
    private authService: AuthService,
    private translateService: TranslateService,
    private route: ActivatedRoute,
    private taskService: TaskService,
    private profileService: ProfileService,
    private conversionService: ConversionService) { }

  ngOnInit() {
    this.user = this.authService.getUser()
    this.role = this.authService.getRole()
    
    this.route.paramMap
      .switchMap((params: ParamMap) => Observable.of(params.has('id') ? +params.get('id') : null))
      .subscribe(id => {
        this.taskId = id
        this.loadTasks()
      })
  }

  showDeleteTaskDialog(id: number) {
    console.log('showDeleteTaskDialog for task id: ' + id)
    this.taskService.getTask(id)
      .subscribe(
      (data) => {
        this.selectedTask = data
        this.showDeleteTaskComponent = true
      })
  }

  deleteTask() {
    this.showDeleteTaskComponent = false
    this.loadTasks()
  }

  closeTaskDialog() {
    this.showDeleteTaskComponent = false
  }

  getTaskTypeClass(type: TaskType) {
    return 'type--' + this.conversionService.taskTypeToOrderNumber(type)
  }

  isCreator(task: TaskDashboard) {
    return this.authService.getUsername() === task.creator
  }

  isDropdownOpen(index: number) {
    return this.selectedDropdown === index
  }

  toggleDropdown(index: number) {
    this.selectedDropdown = this.selectedDropdown === index ? null : index
  }

  changeProfile(profile: number) {
    this.profileService.setProfile(profile)
  }

  getLanguage(): string {
    return this.translateService.currentLang
  }

  changeLanguage(language: string) {
    this.translateService.use(language)
  }

  saveProfile() {
    this.profileService.updateProfile().subscribe(
      value => {
        this.profileEdit = false
      }
    )
  }

  getProfileClass(): string {
    return 'variant--' + this.getProfile();
  }

  getProfile(): number {
    return this.profileService.getProfile(this.user);
  }

  private updateCodes() {
    this.taskService.getUnusedCodes().subscribe(codes => this.unusedCodes = codes)
  }

  private loadTasks() {
    this.taskService.getTasksForDashboard().subscribe(
      (data) => {
        this.tasks = data
        this.sortTasks()
        this.updateCodes()
      })
  }

  private sortTasks() {
    if (!(this.tasks != null && this.tasks.length > 0 && this.taskId != null))
      return

    // If id is defined, put that item first.
    const task = this.tasks.find(t => t.id === this.taskId)
    if (task != null)
      this.tasks = [task].concat(this.tasks.filter(t => t.id !== this.taskId))
  }

  logout() {
    console.log('dashboard.logout()')
    this.authService.logout()
  }
}
