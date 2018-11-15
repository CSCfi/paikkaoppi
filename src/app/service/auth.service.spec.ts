import { inject, TestBed } from '@angular/core/testing'
import { HttpClientModule } from '@angular/common/http'
import { RouterTestingModule } from '@angular/router/testing'

import { MockComponent } from '../../tests/mock.component'
import { AuthService } from './auth.service'

describe('AuthService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        RouterTestingModule.withRoutes([
          { path: 'map', component: MockComponent }
        ])
      ],
      providers: [AuthService],
      declarations: [
        MockComponent
      ],
    })
  })

  it('should be created', inject([AuthService], (service: AuthService) => {
    expect(service).toBeTruthy()
  }))
})
