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

import { AuthGuard } from './service/auth.guard'
import { NotLoggedInGuard } from './service/not-logged-in.guard'

import { AuthService } from './service/auth.service'
import { TaskService } from './service/task.service'
import { TaskTemplateService } from './service/task-template.service'
import { OpsService } from './service/ops.service'
import { ProfileService } from './service/profile.service'

import { TruncatePipe } from './pipe/truncate.pipe'
import { MessageModule } from './message/message.module'
import { TaskTemplateComponent } from './task-template/task-template.component'
import { DeleteTaskTemplateComponent } from './delete-task-template/delete-task-template.component';
import { CodeComponent } from './code/code.component'

@NgModule({
  declarations: [
    TruncatePipe,
    AppComponent,
    HomeComponent,
    DashboardComponent,
    LibraryComponent,
    TaskTemplateComponent,
    DeleteTaskTemplateComponent,
    CodeComponent,
  ],
  imports: [
    AppRoutingModule, BrowserModule, FormsModule, HttpClientModule, MapModule, MessageModule
  ],
  providers: [AuthService, TaskService, TaskTemplateService, OpsService, ProfileService, AuthGuard, NotLoggedInGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
