import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing'
import { FormsModule } from '@angular/forms'
import { HttpClientModule } from '@angular/common/http'

import { AuthService } from '../service/auth.service'
import { TaskService } from '../service/task.service'
import { ProfileService } from '../service/profile.service'
import { ConversionService } from '../service/conversion.service'
import { CodeComponent } from '../code/code.component'
import { AuthServiceMock, TaskServiceMock } from '../../tests/mocks.spec'

import { DashboardComponent } from './dashboard.component'
import { MockComponent } from "../../tests/mock.component";
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from "@ngx-translate/core";
import { DeleteTaskComponent } from "../delete-task/delete-task.component";
import { LanguagePipe } from "../pipe/language.pipe";

describe('DashboardComponent', () => {
  let component: DashboardComponent
  let fixture: ComponentFixture<DashboardComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardComponent, CodeComponent, DeleteTaskComponent, LanguagePipe, MockComponent],
      imports: [
        FormsModule,
        HttpClientModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: () => new TranslateFakeLoader()
          }
        }),
        RouterTestingModule.withRoutes([
          { path: 'map/:id', component: MockComponent }
        ])
      ],
      providers: [
        { provide: AuthService, useClass: AuthServiceMock },
        { provide: TaskService, useClass: TaskServiceMock },
        ProfileService,
        ConversionService
      ]
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should be created', () => {
    expect(component).toBeTruthy()
  })
})
