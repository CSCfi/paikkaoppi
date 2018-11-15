import { HttpClientModule } from '@angular/common/http'
import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { FormsModule } from '@angular/forms'
import { RouterTestingModule } from '@angular/router/testing'

import { AuthServiceMock, TaskServiceMock, TaskTemplateServiceMock } from '../../tests/mocks.spec'
import { AuthService } from '../service/auth.service'
import { TaskTemplateService } from '../service/task-template.service'
import { TaskService } from '../service/task.service'
import { ConversionService } from '../service/conversion.service'
import { TruncatePipe } from '../pipe/truncate.pipe'
import { TaskTemplateComponent } from '../task-template/task-template.component'
import { DeleteTaskTemplateComponent } from '../delete-task-template/delete-task-template.component'
import { LibraryComponent } from './library.component'
import { MockComponent } from "../../tests/mock.component";
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from "@ngx-translate/core";
import { LineBreakPipe } from "../pipe/line-break.pipe";
import { QuillModule } from "ngx-quill";

describe('LibraryComponent', () => {
  let component: LibraryComponent
  let fixture: ComponentFixture<LibraryComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TruncatePipe, LineBreakPipe, LibraryComponent, MockComponent,
        TaskTemplateComponent, DeleteTaskTemplateComponent],
      imports: [
        FormsModule,
        HttpClientModule,
        QuillModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: () => new TranslateFakeLoader()
          }
        }),
        RouterTestingModule.withRoutes([
          { path: 'map', component: MockComponent }
        ])
      ],
      providers: [
        { provide: AuthService, useClass: AuthServiceMock },
        { provide: TaskService, useClass: TaskServiceMock },
        { provide: TaskTemplateService, useClass: TaskTemplateServiceMock },
        ConversionService
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
