import { TestBed, inject } from '@angular/core/testing';

import { TaskTemplateService } from './task-template.service';

describe('TaskTemplateService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TaskTemplateService]
    });
  });

  it('should be created', inject([TaskTemplateService], (service: TaskTemplateService) => {
    expect(service).toBeTruthy();
  }));
});
