import { TestBed, inject } from '@angular/core/testing'

import { OskariPointService } from './oskari-point.service'

describe('OskariPointService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OskariPointService]
    })
  })

  it('should be created', inject([OskariPointService], (service: OskariPointService) => {
    expect(service).toBeTruthy()
  }))
})
