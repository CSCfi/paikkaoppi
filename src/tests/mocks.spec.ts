import { Component } from '@angular/core'
import { Observable } from 'rxjs/Observable'

import { Task, TaskTemplate, User, Role } from '../app/service/model'

@Component({
  template: ''
})
export class MockComponent {
}

export class AuthServiceMock {
  getUser(): User | null {
    return TestMethods.getTeacher()
  }

  getRole(): Role {
    return 'teacher'
  }

  isLoggedIn(): boolean {
    return true
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

export class TaskServiceMock {
  getTasks(): Observable<Task[]> {
    return Observable.of([{
      id: 1,
      taskTemplateId: 1,
      name: 'Tehtävä 1',
      title: 'Tehtävä 1',
      description: 'Tehtävä 1',
      instructions: null,
      info: 'Info',
      tags: ['tag1', 'tag2'],
      code: 'code',
      user: TestMethods.getTeacher(),
      results: null
    }])
  }

  getUnusedCodes(): Observable<string[]> {
    return Observable.of([])
  }
}

export class TaskTemplateServiceMock {
  getTaskTemplate(): Observable<TaskTemplate> {
    return Observable.of(this.getTemplate(1))
  }

  getTaskTemplates(): Observable<TaskTemplate[]> {
    return Observable.of([this.getTemplate(1), this.getTemplate(2), this.getTemplate(3)])
  }

  private getTemplate(id: number): TaskTemplate {
    return {
      id: id,
      name: 'Tehtäväpohja ' + id,
      title: 'Tehtäväpohja',
      description: 'Tehtäväpohja',
      instructions: null,
      info: 'Info',
      tags: ['tag1', 'tag2']
    }
  }
}

export class TestMethods {
  static getTeacher(): User {
    return {
      username: 'oppi.opettaja@koulu.fi',
      email: 'oppi.opettaja@koulu.fi',
      firstName: 'Oppi',
      lastName: 'Opettaja',
      role: 'teacher'
    }
  }
}