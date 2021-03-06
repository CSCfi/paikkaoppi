import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/throw';
import { environment } from '../../environments/environment'
import { TaskTemplateService } from './task-template.service'
import { AuthService } from './auth.service'
import { User, Role, Roles, Task, TaskDashboard, TaskTemplate, ResultItem, TaskCodeCreator, StableRandom } from './model'
import { Result } from './model-result'

@Injectable()
export class TaskService {

  constructor(
    private http: HttpClient,
    private taskTemplateService: TaskTemplateService,
    private authService: AuthService) {
  }

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${environment.apiUri}/task`)
  }

  getTasksForDashboard(): Observable<TaskDashboard[]> {
    return this.http.get<TaskDashboard[]>(`${environment.apiUri}/task/dashboard`)
  }

  getTask(id: number, includeResults: boolean = false, includeAttachments: boolean = false): Observable<Task> {
    return this.http.get<Task>(`${environment.apiUri}/task/${id}`, {
      params: new HttpParams()
        .append('includeResults', '' + includeResults)
        .append('includeAttachments', '' + includeAttachments)
    })
  }

  createTaskFrom(taskTemplateId: number, name: string): Observable<Task> {
    return this.http.post<Task>(`${environment.apiUri}/task`, {
      taskTemplateId: taskTemplateId,
      name: name
    })
  }

  getUnusedCodes(): Observable<string[]> {
    if (environment.production === false)
      return this.http.get<string[]>(`${environment.apiUri}/task/unusedcodes`)
    else
      return Observable.of(null)
  }

  addTaskWithCode(code: string): Observable<Task> {
    return this.http.post<Result>(`${environment.apiUri}/result`, { code: code })
      .switchMap(data => this.getTask(data.taskId, true, true))
  }

  getResultItem(resultItemId: number): Observable<ResultItem> {
    return this.http.get<ResultItem>(`${environment.apiUri}/resultitem/${resultItemId}`)
  }

  saveResultItem(resultId: number, resultItem: ResultItem): Observable<ResultItem> {
    return this.http.post<ResultItem>(`${environment.apiUri}/result/${resultId}/resultitem`, resultItem)
  }

  removeResultItem(resultItemId: number): Observable<number> {
    return this.http.delete(`${environment.apiUri}/resultitem/${resultItemId}`)
      .switchMap((data) => Observable.of(resultItemId))
  }

  updateResultItem(resultItemId: number, resultItem: ResultItem): Observable<ResultItem> {
    return this.http.put<ResultItem>(`${environment.apiUri}/resultitem/${resultItemId}`, resultItem)
  }

  deleteTask(taskId: number): Observable<Task> {
    return this.http.delete<Task>(`${environment.apiUri}/task/${taskId}`)
  }
}
