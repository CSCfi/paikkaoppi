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

  constructor(private authService: AuthService, private router: Router,
    private route: ActivatedRoute, private taskService: TaskService) { }

  ngOnInit() {
    this.user = this.authService.getUser()
    this.role = this.authService.getRole()
    this.taskService.getTasks().then(tasks => {
      this.tasks = tasks
      this.sortTasks()
    })
    this.route.paramMap
      .switchMap((params: ParamMap) => Observable.of(params.has('id') ? +params.get('id') : null))
      .subscribe(id => {
        this.taskId = id
        this.sortTasks()
      })
  }

  private sortTasks() {
    if (!(this.tasks != null && this.tasks.length > 0 && this.taskId != null))
      return

    // If id is defined, put that item first.
    const task = this.tasks.find(t => t.id == this.taskId)
    if (task != null)
      this.tasks = [task].concat(this.tasks.filter(t => t.id != this.taskId))
  }

  logout() {
    this.authService.logout()
    this.router.navigateByUrl("/home")
  }
}
