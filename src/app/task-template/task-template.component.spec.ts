import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

import { TaskTemplateService } from '../service/task-template.service';
import { OpsService } from '../service/ops.service';
import { TaskTemplateComponent } from './task-template.component';
import { TruncatePipe } from '../pipe/truncate.pipe'

import { TestMethods, OpsServiceMock } from '../../tests/mocks.spec'

describe('TaskTemplateComponent', () => {
  let component: TaskTemplateComponent;
  let fixture: ComponentFixture<TaskTemplateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TruncatePipe, TaskTemplateComponent ],
      imports: [
        RouterTestingModule,
        FormsModule,
        HttpClientModule
      ],
      providers: [
        TaskTemplateService,
        { provide: OpsService, useClass: OpsServiceMock },
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
