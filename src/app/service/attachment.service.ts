import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs/Observable'
import { environment } from '../../environments/environment'

@Injectable()
export class AttachmentService {

  constructor(
    private http: HttpClient) {
  }

  removeAttachment(attachmentId: number): Observable<number> {
    return this.http.delete(`${environment.apiUri}/attachment/${attachmentId}`)
      .switchMap((data) => Observable.of(attachmentId))
  }
}
