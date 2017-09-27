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
    if (this.authService.isLoggedIn()) {
      console.log(`NotLoggedInGuard:canActivate FAIL, route: ${next.routeConfig.path} redirect to "/"`);
      this.router.navigate(['/dashboard']);
      return false;
    } else {
      console.log(`NotLoggedInGuard:canActivate OK, route: ${next.routeConfig.path}`);
      return true;
    }
  }
}