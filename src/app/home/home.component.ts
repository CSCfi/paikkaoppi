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
    // TODO: VILI Check here, that this component can only be shown in local environments, not in client test or prod.
    // TODO: MARKUS Check here, that this component can only be shown in local environments, not in client test or prod.
    this.authService.isLoggedIn().subscribe(value => {
      if (value) {
          this.router.navigateByUrl('/dashboard')
      }
    })
  }

  loginUser(username: string) {
    console.log("loginUser:", username)
    this.authService.login(username)
      .subscribe(user => this.router.navigateByUrl("/dashboard"))
  }
}
