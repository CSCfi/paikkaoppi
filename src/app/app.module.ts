import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { FormsModule } from '@angular/forms'
import { HttpClientModule } from '@angular/common/http'

import { AppComponent } from './app.component'
import { DashboardComponent } from './dashboard/dashboard.component'
import { LibraryComponent } from './library/library.component'
import { MapModule } from './map/map.module'

import { AppRoutingModule } from './app-routing.module'
import { HomeComponent } from './home/home.component'

import { AuthService } from './service/auth.service'
import { AuthGuard } from './service/auth.guard'
import { NotLoggedInGuard } from './service/not-logged-in.guard'
import { TaskService } from './service/task.service'
import { TaskTemplateService } from './service/task-template.service'

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    DashboardComponent,
    LibraryComponent
  ],
  imports: [
    AppRoutingModule, BrowserModule, FormsModule, HttpClientModule, MapModule
  ],
  providers: [AuthService, TaskService, TaskTemplateService, AuthGuard, NotLoggedInGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
