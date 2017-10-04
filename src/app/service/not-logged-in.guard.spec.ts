import { TestBed, async, inject } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing'
import { HttpClientModule } from '@angular/common/http'

import { AuthService } from '../service/auth.service'
import { MockComponent } from '../test/mocks'

import { NotLoggedInGuard } from './not-logged-in.guard'

describe('NotLoggedInGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ MockComponent ],
      imports: [
        HttpClientModule,
        RouterTestingModule.withRoutes([
          { path: 'map', component: MockComponent }
        ])
      ],
      providers: [NotLoggedInGuard, AuthService]
    })
  })

  it('should ...', inject([NotLoggedInGuard], (guard: NotLoggedInGuard) => {
    expect(guard).toBeTruthy()
  }))
})
