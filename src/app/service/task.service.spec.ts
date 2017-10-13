import { TestBed, inject } from '@angular/core/testing'
import { HttpClientModule } from '@angular/common/http'
import { RouterTestingModule } from '@angular/router/testing'

import { MockComponent } from '../../tests/mocks.spec'
import { TaskTemplateService } from './task-template.service'
import { AuthService } from './auth.service'

import { TaskService } from './task.service'

describe('TaskService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        RouterTestingModule.withRoutes([
          { path: 'map', component: MockComponent }
        ])
      ],
      providers: [AuthService, TaskService, TaskTemplateService],
      declarations: [
        MockComponent
      ],
    })
  })

  it('should be created', inject([TaskService], (service: TaskService) => {
    expect(service).toBeTruthy()
  }))
})
