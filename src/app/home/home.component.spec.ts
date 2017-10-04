import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { HttpClient, HttpHandler } from '@angular/common/http'
import { Router } from '@angular/router'

import { HomeComponent } from './home.component'
import { AuthService } from '../service/auth.service'

describe('HomeComponent', () => {
  let component: HomeComponent
  let fixture: ComponentFixture<HomeComponent>

  const mockRouter = {
    navigate: jasmine.createSpy('navigate')
  }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HomeComponent ],
      providers: [
        { provide: Router, useValue: mockRouter },
        AuthService, HttpClient, HttpHandler
      ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should be created', () => {
    expect(component).toBeTruthy()
  })
})
