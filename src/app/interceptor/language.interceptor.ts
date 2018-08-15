import { TranslateService } from '@ngx-translate/core';

import { Injectable } from '@angular/core'
import { HttpInterceptor, HttpHandler, HttpRequest, HttpEvent, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class LanguageInterceptor implements HttpInterceptor {
  constructor(private translateService: TranslateService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
     const langReq = req.clone({
      headers: new HttpHeaders({
        'Accept-Language': this.translateService.currentLang ? this.translateService.currentLang : 'fi'
      })
    });

    return next.handle(langReq);
  }
}  