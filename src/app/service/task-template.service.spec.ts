import { TestBed, inject } from '@angular/core/testing'
import { HttpClientModule } from '@angular/common/http'

import { TaskTemplateService } from './task-template.service'

describe('TaskTemplateService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule
      ],
      providers: [TaskTemplateService]
    })
  })

  it('should be created', inject([TaskTemplateService], (service: TaskTemplateService) => {
    expect(service).toBeTruthy()
  }))
})
