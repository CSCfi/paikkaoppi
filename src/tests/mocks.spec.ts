import { Observable } from 'rxjs/Observable'

import { Grade, Role, Task, TaskDashboard, TaskTemplate, TaskType, User, Visibility } from '../app/service/model';
import { AuthService } from "../app/service/auth.service";

export class AuthServiceMock extends AuthService {

  getUser(): User | null {
    return TestMethods.getTeacher()
  }

  getUsername(): string {
    return TestMethods.getTeacher().username
  }

  getRole(): Role {
    return 'teacher'
  }

  isLoggedIn(): Observable<boolean> {
    return Observable.of(true)
  }

  login(username: string): Observable<User> {
    return Observable.of(this.getUser())
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
      results: null,
      visibility: <Visibility>'OPEN'
    }])
  }

  getTasksForDashboard(): Observable<TaskDashboard[]> {
    return Observable.of([{
      id: 1,
      name: 'Tehtävä 1',
      code: 'code',
      creator: 'oppi.opettaja@koulu.fi',
      resultItemCount: 1,
      type: <TaskType>'INVESTIGATE'
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
    return TestMethods.getTaskTemplateWithId(id)
  }
}

export class OpsServiceMock {

  getGrades(): Observable<Grade[]> {
    return Observable.of([TestMethods.getGradeWithId(1), TestMethods.getGradeWithId(1)])
  }
}

export class TestMethods {

  static getTeacher(): User {
    return {
      username: 'oppi.opettaja@koulu.fi',
      firstName: 'Oppi',
      lastName: 'Opettaja',
      role: 'teacher',
      municipality: 'KuntaYksi',
      school: 'DemolaTestSchool',
      schoolClass: '9A',
      profile: 1,
      email: 'oppi.opettaja@koulu.fi'
    }
  }

  static getTaskTemplate(): TaskTemplate {
    return this.getTaskTemplateWithId(1)
  }

  static getTaskTemplateWithId(id: number): TaskTemplate {
    return {
      id: id,
      name: "Tehtäväpohja",
      type: "ACT",
      title: "Tehtäväpohja",
      description: "Tehtäväpohja",
      instructions: null,
      info: "Info",
      tags: ["tags"],
      ops: null,
      user: TestMethods.getTeacher(),
      visibility: "OPEN",
      resultVisibility: "OPEN"
    }
  }

  static getGradeWithId(id: number): Grade {
    return {
      id: id,
      name: "Vuosiluokat " + id
    }
  }
}
