import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component'
import { LibraryComponent } from './library/library.component'
import { MapModule } from './map/map.module'

import { AppRoutingModule } from './app-routing.module';
import { HomeComponent } from './home/home.component';

import {AuthService} from './auth.service'

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
  providers: [AuthService],
  bootstrap: [AppComponent]
})
export class AppModule { }
