import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskTemplateService } from '../service/task-template.service';
import { TaskTemplateComponent } from './task-template.component';

import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

import { TestMethods } from '../../tests/mocks.spec'

describe('TaskTemplateComponent', () => {
  let component: TaskTemplateComponent;
  let fixture: ComponentFixture<TaskTemplateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaskTemplateComponent ],
      imports: [
        FormsModule,
        HttpClientModule
      ],
      providers: [
        TaskTemplateService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskTemplateComponent);
    component = fixture.componentInstance;
    component.model = TestMethods.getTaskTemplate()
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
