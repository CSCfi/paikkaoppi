import { forEach } from '@angular/router/src/utils/collection';
import 'rxjs/add/operator/switchMap';
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/of';
import { Component, OnInit } from '@angular/core'
import { Router, ParamMap, ActivatedRoute } from '@angular/router'
import { AuthService } from '../service/auth.service'
import { TaskService } from '../service/task.service'
import { ProfileService } from '../service/profile.service'
import { Role, Task, TaskDashboard, User } from '../service/model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  user: User
  role: Role
  //tasks: Task[]
  tasks: TaskDashboard[]
  taskId?: number
  // For Proto
  unusedCodes: string[]
  codeLength = 5
  model: NewTaskModel = new NewTaskModel(new Array(this.codeLength))
  formError: string
  profileEdit = false
  codePasted = false
  
  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private taskService: TaskService,
    private profileService: ProfileService) { }

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

  changeProfile(profile: number) {
    this.profileService.setProfile(profile)
  }

  saveProfile() {
    this.profileService.updateProfile().subscribe(
      value => this.profileEdit = false
    )
  }

  private getProfile(user: User): number {
    return this.profileService.getProfile(user)
  }

  getProfileClass(): string {
    return 'variant--' + this.getProfile(this.user);
  }

  private loadTasks() {
    this.taskService.getTasksForDashboard().subscribe(
      (data) => {
        this.tasks = data
        this.sortTasks()
        this.updateCodes()
      })
  }

  private updateCodes() {
    this.taskService.getUnusedCodes().subscribe(codes => this.unusedCodes = codes)
  }

  private sortTasks() {
    if (!(this.tasks != null && this.tasks.length > 0 && this.taskId != null))
      return

    // If id is defined, put that item first.
    const task = this.tasks.find(t => t.id === this.taskId)
    if (task != null)
      this.tasks = [task].concat(this.tasks.filter(t => t.id !== this.taskId))
  }

  setKeyIfOk(index: number, key: string) {
    if (this.handleSpecialKey(index, key)) {
      return
    }

    this.formError = null
    
    if (this.isSupportedKey(key)) {
      this.model.code[index] = key

      if (index < 4) {
        document.getElementById('code' + (index + 1)).focus()
      }

      this.codeChanged()
    
    } else {
      this.model.code[index] = ""
    }
  }

  handlePaste(e: any) {
    const content = e.clipboardData.getData('text/plain');
    if (this.isSupportedCode(content)) {
      for (let i = 0; i < content.length; i++) {
        this.model.code[i] = content.charAt(i)
      }
      console.log('code pasted:', content)
      this.codeChanged()
    }

    this.codePasted = true
    e.preventDefault()
  }

  private isSupportedCode(code: string) {
    if (code == null || code === '' || code.length !== 5) {
      return false
    }

    for (let i = 0; i < code.length; i++) {
      if (!this.isSupportedKey(code.charAt(i))) {
        return false
      }
    }

    return true
  }

  private isSupportedKey(key: string) {
    return key.length === 1 && !key.match(/[^0-9a-z]/i)
  }

  private handleSpecialKey(index: number, key: string) {
    if (key === 'ArrowLeft' || key === 'Backspace') {
      if (index > 0) {
        document.getElementById('code' + (index - 1)).focus()
      }
      return true
    
    } else if (key === 'ArrowRight') {
      if (index < 4) {
        document.getElementById('code' + (index + 1)).focus()
      }
      return true
    
    } else if (key === 'Shift' || key === 'Control' || key === 'Meta' || key === 'Tab') {
      return true
    
    } else if (key === 'Escape') {
      for (let i = 0; i < this.model.code.length; i++) {
        this.model.code[i] = ""
      }
      document.getElementById('code0').focus()
      return true
    
    } else if (this.codePasted) {
      this.codePasted = false
      return true
    }
    
    return false
  }

  codeChanged() {
    this.formError = null
    if (this.model.getFullCode().length === 5) {
      console.log('codeChanged', this.model.getFullCode())
      this.addTask()
    }
  }

  addTask() {
    const code = this.model.getFullCode()
    console.log('addTask():', code)
    this.formError = null
    this.taskService.addTaskWithCode(code)
      .subscribe(
      (data) => {
        this.model = new NewTaskModel(new Array(this.codeLength))
        this.router.navigate(['/dashboard', data.id])
      },
      (err) => {
        this.formError = 'not found'
        console.info('Failed to add task with code:', code, '. Reason was:', err)
      })
  }

  logout() {
    console.log('dashboard.logout()')
    this.authService.logout()
  }
}

export class NewTaskModel {
  code: string[]

  constructor(code: string[]) {
    this.code = code
  }

  getFullCode(): string {
    return this.code.join('').replace(/\s/g, '').toUpperCase()
  }
}
