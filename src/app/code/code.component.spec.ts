import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing'
import { FormsModule } from '@angular/forms'
import { HttpClientModule } from '@angular/common/http'

import { TaskService } from '../service/task.service'
import { TaskServiceMock } from '../../tests/mocks.spec'

import { CodeComponent } from './code.component';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from "@ngx-translate/core";

describe('CodeComponent', () => {
  let component: CodeComponent;
  let fixture: ComponentFixture<CodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CodeComponent],
      imports: [
        FormsModule,
        HttpClientModule,
        RouterTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: () => new TranslateFakeLoader()
          }
        })
      ],
      providers: [
        { provide: TaskService, useClass: TaskServiceMock },
      ]
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(CodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
