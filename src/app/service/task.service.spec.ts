import { TestBed, inject } from '@angular/core/testing'
import { HttpClientModule } from '@angular/common/http'

import { TaskTemplateService } from './task-template.service'
import { AuthService } from './auth.service'

import { TaskService } from './task.service'

describe('TaskService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule
      ],
      providers: [AuthService, TaskService, TaskTemplateService ]
    })
  })

  it('should be created', inject([TaskService], (service: TaskService) => {
    expect(service).toBeTruthy()
  }))
})
