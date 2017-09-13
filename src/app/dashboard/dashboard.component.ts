import 'rxjs/add/operator/switchMap'
import { Observable } from "rxjs/Observable";
import 'rxjs/add/observable/of'
import { Component, OnInit } from '@angular/core';
import { Router, ParamMap, ActivatedRoute } from '@angular/router';
import { AuthService, User, Role } from '../service/auth.service'
import { TaskService } from '../service/task.service'
import { Task } from '../service/model'

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
    this.taskService.getTasks().then(tasks => {
      this.tasks = tasks
      this.sortTasks()
      this.updateCodes()
    })
  }

  private updateCodes() {
    const allCodes = this.taskService.getAllCodes()
    if (this.tasks == null || this.tasks.length == 0)
      this.unusedCodes == allCodes
    else {
      this.unusedCodes = allCodes.filter(code => {
        const taskWithCode = this.tasks.find(t => t.code == code)
        return taskWithCode == null
      })
    }
  }

  private sortTasks() {
    if (!(this.tasks != null && this.tasks.length > 0 && this.taskId != null))
      return

    // If id is defined, put that item first.
    const task = this.tasks.find(t => t.id == this.taskId)
    if (task != null)
      this.tasks = [task].concat(this.tasks.filter(t => t.id != this.taskId))
  }

  codeKeyUp() {
    this.formError = null
  }
  
  addTask() {
    console.log("addTask():", this.model.code)
    this.formError = null
    this.taskService.addTaskWithCode(this.model.code)
      .then(t => { 
        this.model = new NewTaskModel(null)
        this.router.navigate(['/dashboard', t.id]) 
      })
      .catch(err => {
        this.formError = "not found"
        console.info("Failed to add task with code:", this.model.code, ". Reason was:", err)
      })
  }

  logout() {
    this.authService.logout()
    this.router.navigateByUrl("/home")
  }
}
export class NewTaskModel {
  code: string

  constructor(code: string) {
    this.code = code
  }
}