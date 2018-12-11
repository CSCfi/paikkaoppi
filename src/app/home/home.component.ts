import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../service/auth.service';
import { environment } from '../../environments/environment';
import { MPassAuthSource } from '../service/model';
import { LocationStrategy } from '@angular/common';

export interface LoginMenuItem {
  mPassSource: MPassAuthSource
  loginUrl: string
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  prod: boolean = environment.production
  users: string[] = []
  menuItems: LoginMenuItem[] = []
  showMenu = false

  constructor(private authService: AuthService, private router: Router, private location: LocationStrategy) {
  }

  ngOnInit() {
    if (!this.prod) {
      this.users = this.authService.backendUsers()
      this.authService.isLoggedIn().subscribe(value => {
        if (value) {
          this.router.navigateByUrl('/dashboard')
        }
      })
      return;
    }
    // Fetch mPass login choices
    this.authService.getMPassAuthSources().subscribe(resp => {
      this.menuItems = resp.response.map(value => {
        const target = `${window.location.origin}${this.location.prepareExternalUrl('dashboard')}`
        const url = `/Shibboleth.sso/Login?authnContextClassRef=urn:mpass.id:authnsource:${value.id}&target=${target}`
        return {
          mPassSource: value,
          loginUrl: url
        }
      });
    })
  }

  loginUser(username: string) {
    if (!this.prod) {
      console.log('loginUser:', username)
      this.authService.login(username)
        .subscribe(() => this.router.navigateByUrl('/dashboard'))
    }
  }

  toggleMenu() {
    this.showMenu = !this.showMenu;
  }
}
