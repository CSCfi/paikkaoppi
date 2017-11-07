import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs/Observable'
import { environment } from '../../environments/environment'
import { Grade, Subject, Target, ContentArea } from './model'

@Injectable()
export class OpsService {
  constructor(private http: HttpClient) { }

  getGrades(): Observable<Grade[]> {
    return this.http.get<Grade[]>(`${environment.apiUri}/ops/grades`)
  }

  getSubjects(gradeId: number): Observable<Subject[]> {
    return this.http.get<Subject[]>(`${environment.apiUri}/ops/grades/${gradeId}/subjects`)
  }

  getSubject(subjectId: number): Observable<Subject> {
    return this.http.get<Subject>(`${environment.apiUri}/ops/subjects/${subjectId}`)
  }

  getTargets(gradeId: number, subjectId: number): Observable<Target[]> {
    return this.http.get<Target[]>(`${environment.apiUri}/ops/grades/${gradeId}/subjects/${subjectId}/targets`)
  }

  getContentAreas(gradeId: number, subjectId: number): Observable<ContentArea[]> {
    return this.http.get<ContentArea[]>(`${environment.apiUri}/ops/grades/${gradeId}/subjects/${subjectId}/contentareas`)
  }
}
