import { HttpClientModule } from '@angular/common/http';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

import { AuthServiceMock, MockComponent, TaskServiceMock, TaskTemplateServiceMock } from '../../tests/mocks.spec';
import { AuthService } from '../service/auth.service';
import { TaskTemplateService } from '../service/task-template.service';
import { TaskService } from '../service/task.service';
import { TaskTemplateComponent } from '../task-template/task-template.component';
import { LibraryComponent } from './library.component';

describe('LibraryComponent', () => {
  let component: LibraryComponent
  let fixture: ComponentFixture<LibraryComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LibraryComponent, MockComponent, TaskTemplateComponent ],
      imports: [
        FormsModule,
        HttpClientModule,
        RouterTestingModule.withRoutes([
          { path: 'map', component: MockComponent }
        ])
      ],
      providers: [
        { provide: AuthService, useClass: AuthServiceMock },
        { provide: TaskService, useClass: TaskServiceMock },
        { provide: TaskTemplateService, useClass: TaskTemplateServiceMock }
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
