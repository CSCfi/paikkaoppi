import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AuthService } from './auth.service';

@Injectable()
export class NotLoggedInGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    
    console.log('NotLoggedInGuard.canActivate')
    return this.authService.isLoggedIn().mergeMap(value => {
      if (value) {
        console.log(`NotLoggedInGuard:canActivate FAIL, route: ${next.routeConfig.path} redirect to "/dashboard"`)
        this.router.navigate(['/dashboard'])
        return Observable.of(false)
      } else {
        console.log(`NotLoggedInGuard:canActivate OK, route: ${next.routeConfig.path}`);
        return Observable.of(true)
      }
    })
  }
}
