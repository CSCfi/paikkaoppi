import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { Router } from '@angular/router'
import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'
import 'rxjs/add/observable/empty'
import { environment } from '../../environments/environment'

import { User, Role, Roles } from '../service/model'

@Injectable()
export class AuthService {
  static KEY_ROLE = 'role'
  static KEY_USER = 'user'
  initialized: Boolean = false

  constructor(private http: HttpClient, private router: Router) {
    console.info('AuthService()')
    this.updateCurrentUser()
  }

  login(username: string): Observable<User> {
    this.setUser(null)
    return this.http.get<User>(`${environment.apiUri}/auth/login/${username}`).switchMap(
      (loginUser: User) => {
        return this.requestCurrentUser().switchMap(
          (user: User) => {
            console.log(`CurrentUser: ${user.username}`)
            this.setUser(user)
            return Observable.of(user)
          })
      })
  }

  logout() {
    console.log('AuthService.logout()')
    this.localStorageLogout()
    window.location.href = environment.logoutUri
  }

  private updateCurrentUser(): Observable<void> {
    console.info('AuthService.updateCurrentUser()')
    const done = new Subject<void>()
    this.requestCurrentUser().subscribe(
      (user) => {
        console.log(`CurrentUser: ${user.username}`)
        this.setUser(user)
        this.initialized = true
        done.next()
        done.complete()
      },
      (err) => {
        console.log(`Not logged in. Removing currentUser`)
        this.setUser(null)
        this.initialized = true
        done.next()
        done.complete()
      })
      return done.asObservable()
  }

  private requestCurrentUser(): Observable<User> {
    console.info('AuthService.requestCurrentUser()')
    return this.http.get<User>(`${environment.apiUri}/user/current`)
  }

  private localStorageLogout() {
    localStorage.removeItem(AuthService.KEY_ROLE)
    localStorage.removeItem(AuthService.KEY_USER)
  }

  getRole(): Role {
    return localStorage.getItem(AuthService.KEY_ROLE) as Role
  }

  getUser(): User | null {
    const userStr = localStorage.getItem(AuthService.KEY_USER)
    return (userStr) ? JSON.parse(userStr) : null
  }

  getUsername(): string {
    const user = this.getUser()
    return user ? user.username : null
  }

  isLoggedIn(): Observable<boolean> {
    console.log("isLoggedIn()")
    if (this.initialized)
      return Observable.of(this.getRole() != null)
    else {
      return this.updateCurrentUser().mergeMap( () => {
        return Observable.of(this.getRole() != null)
      })
    }
  }

  isTeacher(): boolean {
    return Roles.teacherRole === this.getRole()
  }

  isStudent(): boolean {
    return Roles.teacherRole === this.getRole()
  }

  private setUser(user: User) {
    if (user) {
      localStorage.setItem(AuthService.KEY_USER, JSON.stringify(user))
      localStorage.setItem(AuthService.KEY_ROLE, user.role)
    } else {
      this.localStorageLogout()
    }
  }

  backendUsers(): string[] {
    return [
      'kaisa.opiskelija@koulu.fi',
      'kalle.koululainen@koulu.fi',
      'oppi.opettaja@koulu.fi',
      'professori.poikonen@koulu.fi'
    ]
  }
}
