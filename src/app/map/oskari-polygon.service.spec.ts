import { TestBed, inject } from '@angular/core/testing';

import { OskariPolygonService } from './oskari-polygon.service';

describe('OskariPolygonService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OskariPolygonService]
    });
  });

  it('should be created', inject([OskariPolygonService], (service: OskariPolygonService) => {
    expect(service).toBeTruthy();
  }));
});
