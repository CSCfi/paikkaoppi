import { BrowserModule } from '@angular/platform-browser'
import { NgModule, LOCALE_ID } from '@angular/core'
import { RouterModule } from '@angular/router'
import { FormsModule } from '@angular/forms'
import { HttpClientModule, HttpClient } from '@angular/common/http'
import { registerLocaleData } from '@angular/common';
import localeFi from '@angular/common/locales/fi';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { MissingTranslationHandler, MissingTranslationHandlerParams } from '@ngx-translate/core';

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
import { ConversionService } from './service/conversion.service'

import { TruncatePipe } from './pipe/truncate.pipe'
import { MessageModule } from './message/message.module'
import { TaskTemplateComponent } from './task-template/task-template.component'
import { DeleteTaskTemplateComponent } from './delete-task-template/delete-task-template.component';
import { CodeComponent } from './code/code.component'

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export class MyMissingTranslationHandler implements MissingTranslationHandler {
  handle(params: MissingTranslationHandlerParams) {
      return 'Translation missing!';
  }
}

registerLocaleData(localeFi, 'fi');

@NgModule({
  declarations: [
    TruncatePipe,
    AppComponent,
    HomeComponent,
    DashboardComponent,
    LibraryComponent,
    TaskTemplateComponent,
    DeleteTaskTemplateComponent,
    CodeComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    MapModule,
    MessageModule,
    TranslateModule.forRoot({
      loader: {
          provide: TranslateLoader,
          useFactory: (createTranslateLoader),
          deps: [HttpClient]
      },
      missingTranslationHandler: {provide: MissingTranslationHandler, useClass: MyMissingTranslationHandler}
    })
  ],
  providers: [
    AuthService,
    TaskService,
    TaskTemplateService,
    OpsService,
    ProfileService,
    ConversionService,
    AuthGuard,
    NotLoggedInGuard,
    { provide: LOCALE_ID, useValue: 'fi-FI' },
    TranslateService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
