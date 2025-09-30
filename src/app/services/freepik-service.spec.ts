import { TestBed } from '@angular/core/testing';

import { FreepikService } from './freepik-service';

describe('FreepikService', () => {
  let service: FreepikService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FreepikService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
