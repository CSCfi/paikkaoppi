import { Component } from '@angular/core'
import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing'
import { FormsModule } from '@angular/forms'
import { HttpClientModule } from '@angular/common/http'
import { FileUploadModule } from 'ng2-file-upload';
import { Ng2PicaModule } from 'ng2-pica'

import { AuthService } from '../../service/auth.service'
import { GeoService } from '../../map/geo.service'
import { MockComponent, AuthServiceMock } from '../../../tests/mocks.spec'
import { ResultItemComponent } from './result-item.component'
import { AttachmentService } from '../../service/attachment.service'
import { ResizeService } from '../../service/resize.service'

describe('ResultItemComponent', () => {
  let component: ResultItemComponent
  let fixture: ComponentFixture<ResultItemComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResultItemComponent, MockComponent ],
      imports: [
        FormsModule,
        HttpClientModule,
        FileUploadModule,
        Ng2PicaModule,
        RouterTestingModule.withRoutes([
          { path: 'map', component: MockComponent }
        ])
      ],
      providers: [
        { provide: AuthService, useClass: AuthServiceMock },
        GeoService,
        AttachmentService,
        ResizeService
      ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ResultItemComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
