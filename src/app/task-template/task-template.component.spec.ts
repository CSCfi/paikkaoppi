import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskTemplateComponent } from './task-template.component';

describe('TaskTemplateComponent', () => {
  let component: TaskTemplateComponent;
  let fixture: ComponentFixture<TaskTemplateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaskTemplateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
