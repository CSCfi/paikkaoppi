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
    if (environment.apiMock) return Observable.of(this.tasks.map(t => this.cloneTask(t, true, true)))
    else {
      return this.http.get<Task[]>(`${environment.apiUri}/task`)
    }
  }

  getTask(id: number, includeResults: boolean): Observable<Task> {
    if (environment.apiMock) return this.getTaskMock(id, includeResults)
    else return this.http.get<Task>(`${environment.apiUri}/task/${id}`, { params: new HttpParams().append("includeResults", "" + includeResults) })
  }

  private getTaskMock(id: number, includeResultItems: boolean): Observable<Task> {
    const task = this.tasks.find(t => t.id == id)
    if (task != null)
      return Observable.of(this.cloneTask(task, true, includeResultItems))
    else
      return Observable.throw(new HttpErrorResponse({ status: 404, statusText: "NotFound", error: "Task not found" }))
  }

  createTaskFrom(taskTemplateId: number, name: string): Observable<Task> {
    if (environment.apiMock) return this.createTaskFromMock(taskTemplateId, name)
    else {
      return this.http.post<Task>(`${environment.apiUri}/task`, {
        taskTemplateId: taskTemplateId,
        name: name
      })
    }
  }
  private createTaskFromMock(taskTemplateId: number, name: string): Observable<Task> {
    this.newTaskCount++
    return this.taskTemplateService.getTaskTemplate(taskTemplateId).switchMap((data) => {
      let task = this.toTask(data)
      task.name = name
      let savedTask = this.addTaskForUser(task)
      return Observable.of(savedTask)
    })
  }

  getUnusedCodes(): Observable<string[]> {
    if (environment.apiMock) {
      const allCodes = this.allTasks.map(t => t.code)
      if (this.tasks == null || this.tasks.length == 0)
        return Observable.of(allCodes)
      else {
        return Observable.of(allCodes.filter(code => {
          const taskWithCode = this.tasks.find(t => t.code == code)
          return taskWithCode == null
        }))
      }
    } else {
      return this.http.get<string[]>(`${environment.apiUri}/task/unusedcodes`)
    }
  }

  addTaskWithCode(code: string): Observable<Task> {
    if (environment.apiMock) return this.addTaskWithCodeMock(code)
    else {
      return this.http.post<Result>(`${environment.apiUri}/result`, { code: code })
        .switchMap(data => this.getTask(data.taskId, true))
    }
  }
  private addTaskWithCodeMock(code: string): Observable<Task> {
    const upperCaseCode = code.toUpperCase()
    console.info("addTaskWithCode:", upperCaseCode)
    if (this.tasks.find(t => t.code == upperCaseCode) != null) {
      console.log("Task already added, rejecting result")
      return Observable.throw(new HttpErrorResponse({ status: 400, error: "Task already added with code " + upperCaseCode }))
    }
    const task = this.allTasks.find(t => t.code == upperCaseCode)
    if (task == null) {
      console.info("No task found with code:", upperCaseCode)
      return Observable.throw(new HttpErrorResponse({ status: 404, error: "No task found with code " + upperCaseCode }))
    } else {
      return Observable.of(this.addTaskForUser(task))
    }
  }

  saveResultItem(resultId: number, resultItem: ResultItem): Observable<ResultItem> {
    if (environment.apiMock) return this.saveResultItemMock(resultId, resultItem)
    else {
      return this.http.post<ResultItem>(`${environment.apiUri}/result/${resultId}/resultitem`, resultItem)
    }
  }
  private saveResultItemMock(resultId: number, resultItem: ResultItem): Observable<ResultItem> {
    try {
      const result = this.findResultById(resultId)
      const clonedItem = this.cloneResultItem(resultItem)
      clonedItem.id = this.resultItemSequence.next()
      result.resultItems.push(clonedItem)
      return Observable.of(this.cloneResultItem(clonedItem))
    } catch (e) {
      console.error(e)
      return Observable.throw(new HttpErrorResponse({ status: 500, error: "Failed to save" }))
    }
  }

  removeResultItem(resultItemId: number): Observable<number> {
    if (environment.apiMock) return this.removeResultItemMock(resultItemId)
    else {
      return this.http.delete(`${environment.apiUri}/resultitem/${resultItemId}`)
        .switchMap((data) => Observable.of(resultItemId))
    }
  }
  private removeResultItemMock(resultItemId: number): Observable<number> {
    try {
      const result = this.findResultWithItemId(resultItemId)
      result.resultItems = result.resultItems.filter(i => i.id != resultItemId)
      return Observable.of(resultItemId)
    } catch (e) {
      console.error(e)
      return Observable.throw("Failed to remove resultItem with id " + resultItemId)
    }
  }

  updateResultItem(resultItemId: number, resultItem: ResultItem): Observable<ResultItem> {
    if (environment.apiMock) return this.updateResultItemMock(resultItemId, resultItem)
    else {
      return this.http.put<ResultItem>(`${environment.apiUri}/resultitem/${resultItemId}`, resultItem)
    }
  }
  private updateResultItemMock(resultItemId: number, resultItem: ResultItem): Observable<ResultItem> {
    try {
      const result = this.findResultWithItemId(resultItem.id)
      result.resultItems = result.resultItems.filter(i => i.id != resultItem.id)
      const clonedItem = this.cloneResultItem(resultItem)
      result.resultItems.push(clonedItem)
      return Observable.of(this.cloneResultItem(clonedItem))
    } catch (e) {
      console.error(e)
      return Observable.throw(new HttpErrorResponse({ status: 500, error: "Failed to update" }))
    }
  }

  private addTaskForUser(task: Task): Task {
    console.log("addTaskForUser:", task)
    const clonedTask = this.cloneTask(task, false, false)
    clonedTask.id = this.taskSequence.next()
    let result: Result = {
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
    let code: string = this.codeCreator.createCode()
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
    for (let task of this.tasks) {
      let result = task.results.find(r => r.id == resultId)
      if (result != null) {
        return result
      }
    }
    throw new SyntaxError("Result not found with id " + resultId)
  }

  private findResultWithItemId(resultItemId: number): Result {
    for (let task of this.tasks) {
      for (let result of task.results) {
        let resultItem: ResultItem = result.resultItems.find(r => r.id == resultItemId)
        if (resultItem != null)
          return result
      }
    }
    throw new SyntaxError("ResultItem not found with id " + resultItemId)
  }
}
