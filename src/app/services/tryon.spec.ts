import { TestBed } from '@angular/core/testing';

import { Tryon } from './tryon';

describe('Tryon', () => {
  let service: Tryon;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Tryon);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
