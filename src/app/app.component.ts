import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { ProfileService } from './service/profile.service'
import { AuthService } from './service/auth.service'
import { DashboardComponent } from './dashboard/dashboard.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor(
    private translateService: TranslateService,
    private profileService: ProfileService,
    private authService: AuthService) {
  }

  ngOnInit() {
    this.translateService.use('fi');
  }

  getProfileClass(): string {
    return 'variant--' + this.profileService.getProfile(this.authService.getUser());
  }
  
}
