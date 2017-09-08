import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component'
import { LibraryComponent } from './library/library.component'
import { MapModule } from './map/map.module'

import { AppRoutingModule } from './app-routing.module';
import { HomeComponent } from './home/home.component';

import { AuthService } from './service/auth.service'
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
    AppRoutingModule, BrowserModule, MapModule
  ],
  providers: [AuthService, TaskService, TaskTemplateService],
  bootstrap: [AppComponent]
})
export class AppModule { }
