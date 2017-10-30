import { Injectable } from '@angular/core'
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'
import { Observable } from 'rxjs/Observable'

import { AuthService } from './auth.service'
import { environment } from '../../environments/environment'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return this.authService.isLoggedIn().mergeMap(value => {
      if (value === false) {
        console.info("Not logged in. Routing back to '/'")
        if (environment.production === false) {
          this.router.navigate(['/'])
        } else {
          window.location.href = "/";
        }
      }
      return Observable.of(value)
    })
  }
}
