import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/throw';
import { environment } from '../../environments/environment'
import { TaskTemplateService } from './task-template.service'
import { AuthService } from './auth.service'
import { User, Role, Roles, Task, TaskTemplate, Result, ResultItem, Sequence, TaskCodeCreator, StableRandom } from './model'

@Injectable()
export class TaskService {
  private newTaskCount = 0
  private allTasks: Task[] = []
  private tasks: Task[] = []
  private taskSequence = new Sequence()
  private resultSequence = new Sequence()
  private resultItemSequence = new Sequence()

  // Remove this when real api is in use and you dont have to create taskCodes in UI
  private codeCreator: TaskCodeCreator = new TaskCodeCreator(new StableRandom(1))

  constructor(
    private http: HttpClient,
    private taskTemplateService: TaskTemplateService,
    private authService: AuthService) {
    taskTemplateService.getTaskTemplates().subscribe(
      (data) => {
        this.allTasks = data.map(template => this.toTask(template))
        this.addTaskForUser(this.allTasks[0])
      })
  }

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${environment.apiUri}/task`)
  }

  getTask(id: number, includeResults: boolean): Observable<Task> {
    return this.http.get<Task>(`${environment.apiUri}/task/${id}`, {
      params: new HttpParams().append('includeResults', '' + includeResults)
    })
  }

  createTaskFrom(taskTemplateId: number, name: string): Observable<Task> {
    return this.http.post<Task>(`${environment.apiUri}/task`, {
      taskTemplateId: taskTemplateId,
      name: name
    })
  }

  getUnusedCodes(): Observable<string[]> {
    return this.http.get<string[]>(`${environment.apiUri}/task/unusedcodes`)
  }

  addTaskWithCode(code: string): Observable<Task> {
    return this.http.post<Result>(`${environment.apiUri}/result`, { code: code })
      .switchMap(data => this.getTask(data.taskId, true))
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

  private addTaskForUser(task: Task): Task {
    console.log("addTaskForUser:", task)
    const clonedTask = this.cloneTask(task, false, false)
    clonedTask.id = this.taskSequence.next()
    const result: Result = {
      id: this.resultSequence.next(),
      taskId: clonedTask.id,
      user: this.createUser(),
      resultItems: []
    }
    clonedTask.results = [result]
    this.tasks = [clonedTask].concat(this.tasks)
    return clonedTask
  }

  private toTask(template: TaskTemplate): Task {
    const code: string = this.codeCreator.createCode()
    return {
      id: 0,
      taskTemplateId: template.id,
      name: template.name,
      title: template.title,
      description: template.description,
      instructions: template.instructions,
      info: template.info,
      tags: template.tags,
      code: code,
      user: this.createUser(),
      results: []
    }
  }

  private createUser(): User {
    return this.authService.getUser()
  }

  private cloneTask(task: Task, includeResults: boolean, includeResultItems: boolean): Task {
    const cloned: Task = {
      id: task.id,
      taskTemplateId: task.taskTemplateId,
      name: task.name,
      title: task.title,
      description: task.description,
      instructions: task.instructions,
      info: task.info,
      tags: task.tags,
      code: task.code,
      user: task.user,
      results: []
    }
    if (includeResults) {
      cloned.results = task.results.map(r => this.cloneResult(r, includeResultItems))
    }
    return cloned
  }

  private cloneResult(result: Result, includeResultItems: boolean): Result {
    const cloned: Result = {
      id: result.id,
      taskId: result.taskId,
      user: result.user,
      resultItems: []
    }
    if (includeResultItems) {
      cloned.resultItems = result.resultItems.map(this.cloneResultItem)
    }
    return cloned
  }

  private cloneResultItem(resultItem: ResultItem): ResultItem {
    return {
      id: resultItem.id,
      resultId: resultItem.resultId,
      geometry: resultItem.geometry,
      name: resultItem.name,
      description: resultItem.description
    }
  }

  private findResultById(resultId: number): Result {
    for (const task of this.tasks) {
      const result = task.results.find(r => r.id === resultId)
      if (result != null) {
        return result
      }
    }
    throw new SyntaxError("Result not found with id " + resultId)
  }

  private findResultWithItemId(resultItemId: number): Result {
    for (const task of this.tasks) {
      for (const result of task.results) {
        const resultItem: ResultItem = result.resultItems.find(r => r.id === resultItemId)
        if (resultItem != null) { return result }
      }
    }
    throw new SyntaxError("ResultItem not found with id " + resultItemId)
  }
}
