import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing'
import { HttpClientModule } from '@angular/common/http'

import { AuthService } from '../service/auth.service'
import { AuthServiceMock } from '../../tests/mocks.spec'

import { HomeComponent } from './home.component'
import { MockComponent } from "../../tests/mock.component";

describe('HomeComponent', () => {
  let component: HomeComponent
  let fixture: ComponentFixture<HomeComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [HomeComponent, MockComponent],
      imports: [
        HttpClientModule,
        RouterTestingModule.withRoutes([
          { path: 'map', component: MockComponent }
        ])
      ],
      providers: [
        { provide: AuthService, useClass: AuthServiceMock }
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
