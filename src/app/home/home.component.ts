import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import {AuthService} from '../auth.service'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
  }

  loginStudent() {
    this.authService.loginAsStudent()
    this.router.navigateByUrl("/dashboard")
  }
  
  loginTeacher() {
    this.authService.loginAsTeacher()
    this.router.navigateByUrl("/dashboard")
  }
}
