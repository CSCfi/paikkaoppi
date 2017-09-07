import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { DashboardModule } from './dashboard/dashboard.module'
import { LibraryModule } from './library/library.module'
import { MapModule } from './map/map.module'

import { AppRoutingModule } from './app-routing.module';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    AppRoutingModule, BrowserModule, DashboardModule, MapModule, LibraryModule, 
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
