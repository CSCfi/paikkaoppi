import { TestBed, inject } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing'

import { MockComponent } from '../../tests/mocks.spec'
import { MessageService } from './message.service'

describe('MessageService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MessageService],
      imports: [
        RouterTestingModule.withRoutes([
          { path: 'map', component: MockComponent }
        ])
      ],
      declarations: [
        MockComponent
      ],
    })
  })

  it('should be created', inject([MessageService], (service: MessageService) => {
    expect(service).toBeTruthy()
  }))
})
