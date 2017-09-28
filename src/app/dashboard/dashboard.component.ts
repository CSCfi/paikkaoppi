import 'rxjs/add/operator/switchMap'
import { Observable } from "rxjs/Observable";
import 'rxjs/add/observable/of'
import { Component, OnInit } from '@angular/core';
import { Router, ParamMap, ActivatedRoute } from '@angular/router';
import { AuthService } from '../service/auth.service'
import { TaskService } from '../service/task.service'
import { Task, User, Role } from '../service/model'

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  user: User
  role: Role
  tasks: Task[]
  taskId?: number
  // For Proto
  unusedCodes: string[]
  model: NewTaskModel = new NewTaskModel(null)
  formError: string

  constructor(private authService: AuthService, private router: Router,
    private route: ActivatedRoute, private taskService: TaskService) { }

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

  private loadTasks() {
    this.taskService.getTasks().subscribe(
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
    const task = this.tasks.find(t => t.id == this.taskId)
    if (task != null)
      this.tasks = [task].concat(this.tasks.filter(t => t.id != this.taskId))
  }

  codeChanged() {
    this.formError = null
  }

  addTask() {
    console.log("addTask():", this.model.code)
    this.formError = null
    this.taskService.addTaskWithCode(this.model.code)
      .subscribe(
      (data) => {
        this.model = new NewTaskModel(null)
        this.router.navigate(['/dashboard', data.id])
      },
      (err) => {
        this.formError = "not found"
        console.info("Failed to add task with code:", this.model.code, ". Reason was:", err)
      })
  }

  logout() {
    console.log("dashboard.logout()")
    this.authService.logout().subscribe(
      _ => {
        console.log("dashboard.logout() result")
        this.router.navigateByUrl("/home")
      },
     (err) => {
       console.error("Dashboard.logout error", err)
     })
  }
}
export class NewTaskModel {
  code: string

  constructor(code: string) {
    this.code = code
  }
}