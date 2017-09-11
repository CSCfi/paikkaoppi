import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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

  constructor(private authService: AuthService, private router: Router, private taskService: TaskService) { }

  ngOnInit() {
    this.user = this.authService.getUser()
    this.role = this.authService.getRole()
    this.taskService.getTasks().then(tasks => this.tasks = tasks)
  }

  logout() {
    this.authService.logout()
    this.router.navigateByUrl("/home")
  }
}
