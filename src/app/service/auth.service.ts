import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'
import 'rxjs/add/observable/empty'
import { environment } from '../../environments/environment'

import { User, Role, Roles } from '../service/model'

@Injectable()
export class AuthService {
  static KEY_ROLE = "role"
  static KEY_USER = "user"
  // Mock users
  static mockUsers: User[] = [
    { username: "OliviaOppilas", firstName: "Olivia", lastName: "Oppilas", email: "olivia.oppilas@koulu.fi", role: Roles.studentRole },
    { username: "OrvokkiOpettaja", firstName: "Orvokki", lastName: "Opettaja", email: "Orvokki.Opettaja@koulu.fi", role: Roles.teacherRole },]

  constructor(private http: HttpClient) {
    console.info("AuthService()")
    this.updateCurrentUser().subscribe(
      (user) => {
        console.log(`CurrentUser: ${user.username}`)
        this.setUser(user)
      },
      (err) => {
        this.setUser(null)
      })
  }

  login(username: string): Observable<User> {
    if (environment.apiMock) {
      let user = AuthService.mockUsers.find(u => u.username == username)
      this.setUser(user)
      return Observable.of(user)
    } else {
      this.setUser(null)
      return this.http.get<User>(`${environment.apiUri}/auth/login/${username}`).switchMap(
        (loginUser: User) => {
          return this.updateCurrentUser().switchMap(
            (user: User) => {
              console.log(`CurrentUser: ${user.username}`)
              this.setUser(user)
              return Observable.of(user)
            })
        })
    }
  }

  logout(): Observable<void> {
    console.log("AuthService.logout()")
    if (environment.apiMock) {
      this.localStorageLogout()
      return Observable.empty()
    } else {
      return this.http.get<void>(`${environment.apiUri}/auth/logout`).switchMap(
        _ => {
          console.log("LogoutResult")
          this.localStorageLogout()
          return Observable.empty()
        }
      )
    }
  }

  private updateCurrentUser(): Observable<User> {
    console.info("AuthService.updateCurrentUser()")
    if (environment.apiMock) {
      const user = this.getUser()
      if (user) return Observable.of(this.getUser())
      else return Observable.throw(new HttpErrorResponse({ status: 400, error: "Not logged in" }))
    } else {
      return this.http.get<User>(`${environment.apiUri}/user/current`)
    }
  }

  private localStorageLogout() {
    localStorage.removeItem(AuthService.KEY_ROLE)
    localStorage.removeItem(AuthService.KEY_USER)
  }

  getRole(): Role {
    return localStorage.getItem(AuthService.KEY_ROLE) as Role
  }

  getUser(): User | null {
    let userStr = localStorage.getItem(AuthService.KEY_USER)
    return (userStr) ? JSON.parse(userStr) : null
  }

  getUsername(): string {
    const user = this.getUser()
    return user ? user.username : null
  }

  isLoggedIn(): boolean {
    return this.getRole() != null
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
    } else
      this.localStorageLogout()
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
