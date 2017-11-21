import { Component } from '@angular/core';

import { ProfileService } from './service/profile.service'
import { AuthService } from './service/auth.service'
import { DashboardComponent } from './dashboard/dashboard.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(
    private profileService: ProfileService,
    private authService: AuthService) {
  }

  getProfile(): number {
    return this.profileService.getProfile(this.authService.getUser());
  }

  getProfileClass(): string {
    return 'variant--' + this.profileService.getProfile(this.authService.getUser());
  }

}
