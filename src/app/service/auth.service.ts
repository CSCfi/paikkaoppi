import { Injectable } from '@angular/core';

export type Role = "teacher" | "student";

export class Roles {
  static teacherRole: Role = "teacher";
  static studentRole: Role = "student";
}

export interface User {
  name: string
}

@Injectable()
export class AuthService {

  static KEY_ROLE = "role"
  static KEY_USER = "user"
  static teacherUser: User = { name: "Orvokki Opettaja" }
  static studentUser: User = { name: "Olivia Oppilas" }

  constructor() { }

  loginAsTeacher() {
    this.setRole(Roles.teacherRole)
    this.setUser(AuthService.teacherUser)
  }

  loginAsStudent() {
    this.setRole(Roles.studentRole)
    this.setUser(AuthService.studentUser)
  }

  private setRole(role: Role) {
    localStorage.setItem(AuthService.KEY_ROLE, role)
  }

  private setUser(user: User) {
    localStorage.setItem(AuthService.KEY_USER, JSON.stringify(user))
  }

  logout() {
    localStorage.removeItem(AuthService.KEY_ROLE)
    localStorage.removeItem(AuthService.KEY_USER)
  }

  getRole(): Role {
    return localStorage.getItem(AuthService.KEY_ROLE) as Role
  }

  getUser() : User | null {
    let userStr = localStorage.getItem(AuthService.KEY_USER)
    return (userStr) ? JSON.parse(userStr) : null
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
}
