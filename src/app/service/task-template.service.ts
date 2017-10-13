import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs/Observable'
import { environment } from '../../environments/environment'
import { Task, TaskTemplate } from './model'

@Injectable()
export class TaskTemplateService {
  constructor(private http: HttpClient) { }

  createTaskTemplate(taskTemplate: TaskTemplate): Observable<TaskTemplate> {
    return this.http.post<TaskTemplate>(`${environment.apiUri}/tasktemplate`, taskTemplate)
  }
  
  getTaskTemplates(): Observable<TaskTemplate[]> {
    return this.http.get<TaskTemplate[]>(`${environment.apiUri}/tasktemplate`)
  }

  getTaskTemplate(id: number): Observable<TaskTemplate> {
    return this.http.get<TaskTemplate>(`${environment.apiUri}/tasktemplate/${id}`)
  }
}
