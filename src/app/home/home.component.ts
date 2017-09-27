import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../service/auth.service'
import { environment } from '../../environments/environment'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  users: string[] = []
  environment = environment
  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
    this.users = this.authService.backendUsers()
    if (this.authService.isLoggedIn()) this.router.navigateByUrl("/dashboard")
  }

  loginUser(username: string) {
    console.log("loginUser:", username)
    this.authService.login(username).subscribe(user => this.router.navigateByUrl("/dashboard"))
  }
}
