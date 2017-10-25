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

  updateTaskTemplate(taskTemplate: TaskTemplate): Observable<TaskTemplate> {
    return this.http.put<TaskTemplate>(`${environment.apiUri}/tasktemplate/${taskTemplate.id}`, taskTemplate)
  }

  deleteTaskTemplate(taskTemplateId: number): Observable<TaskTemplate> {
    return this.http.delete<TaskTemplate>(`${environment.apiUri}/tasktemplate/${taskTemplateId}`)
  }
  
  getTaskTemplates(): Observable<TaskTemplate[]> {
    return this.http.get<TaskTemplate[]>(`${environment.apiUri}/tasktemplate`)
  }

  getTaskTemplate(id: number): Observable<TaskTemplate> {
    return this.http.get<TaskTemplate>(`${environment.apiUri}/tasktemplate/${id}`)
  }
}
