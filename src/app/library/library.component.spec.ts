import { Component } from '@angular/core'
import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing'
import { FormsModule } from '@angular/forms'
import { HttpClientModule } from '@angular/common/http'

import { AuthService } from '../service/auth.service'
import { TaskService } from '../service/task.service'
import { TaskTemplateService } from '../service/task-template.service'
import { MockComponent, AuthServiceMock, TaskServiceMock, TaskTemplateServiceMock } from '../../tests/mocks.spec'

import { LibraryComponent } from './library.component'

describe('LibraryComponent', () => {
  let component: LibraryComponent
  let fixture: ComponentFixture<LibraryComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LibraryComponent, MockComponent ],
      imports: [
        FormsModule,
        HttpClientModule,
        RouterTestingModule.withRoutes([
          { path: 'map', component: MockComponent }
        ])
      ],
      providers: [
        { provide: AuthService, useClass: AuthServiceMock },
        { provide: TaskService, useClass: TaskServiceMock },
        { provide: TaskTemplateService, useClass: TaskTemplateServiceMock }
      ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(LibraryComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should be created', () => {
    expect(component).toBeTruthy()
  })
})
