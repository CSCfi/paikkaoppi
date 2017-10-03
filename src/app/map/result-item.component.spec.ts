import { Component } from '@angular/core'
import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing'
import { FormsModule } from '@angular/forms'
import { HttpClientModule } from '@angular/common/http'

import { AuthService } from '../service/auth.service'
import { GeoService } from './geo.service'
import { MockComponent } from '../test/mocks'

import { ResultItemComponent } from './result-item.component'

describe('ResultItemComponent', () => {
  let component: ResultItemComponent
  let fixture: ComponentFixture<ResultItemComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResultItemComponent, MockComponent ],
      imports: [
        FormsModule,
        HttpClientModule,
        RouterTestingModule.withRoutes([
          { path: 'map', component: MockComponent }
        ])
      ],
      providers: [ AuthService, GeoService ]
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
