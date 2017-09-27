import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { Observable } from 'rxjs/Observable'
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

  constructor(private http: HttpClient) { }

  login(username: string): Observable<User> {
    if (environment.apiMock) {
      let user = AuthService.mockUsers.find(u => u.username == username)
      if (user) {
        this.setUser(user)
        this.setRole(user.role)
      }
      if (user != null) return Observable.of(user)
      else return Observable.throw(new HttpErrorResponse({status: 401, error: "Login failed"}) )
    } else {
      return this.http.get<User>(`${environment.apiUri}/login/${username}`).switchMap((user: User) => {
        this.setRole(user.role)
        this.setUser(user)
        return Observable.of(user)
      })
    }
  }

  logout() {
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

  private setRole(role: Role) {
    localStorage.setItem(AuthService.KEY_ROLE, role)
  }

  private setUser(user: User) {
    localStorage.setItem(AuthService.KEY_USER, JSON.stringify(user))
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
