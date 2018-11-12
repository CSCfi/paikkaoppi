import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

import { TaskTemplateService } from '../service/task-template.service';
import { OpsService } from '../service/ops.service';
import { TaskTemplateComponent } from './task-template.component';
import { TruncatePipe } from '../pipe/truncate.pipe'

import { AuthServiceMock, OpsServiceMock, TaskTemplateServiceMock, TestMethods } from '../../tests/mocks.spec'
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from "@ngx-translate/core";
import { QuillModule } from "ngx-quill";
import { LineBreakPipe } from "../pipe/line-break.pipe";
import { AuthService } from "../service/auth.service";
import { MockComponent } from "../../tests/mock.component";

describe('TaskTemplateComponent', () => {
  let component: TaskTemplateComponent;
  let fixture: ComponentFixture<TaskTemplateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TruncatePipe, TaskTemplateComponent, LineBreakPipe, MockComponent],
      imports: [
        RouterTestingModule,
        FormsModule,
        HttpClientModule,
        QuillModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: () => new TranslateFakeLoader()
          }
        })
      ],
      providers: [
        TaskTemplateService,
        { provide: OpsService, useClass: OpsServiceMock },
        { provide: AuthService, useClass: AuthServiceMock },
        { provide: TaskTemplateService, useClass: TaskTemplateServiceMock }
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
