import { TestBed } from '@angular/core/testing';

import { FetchmapService } from './fetchmap.service';

describe('FetchmapService', () => {
  let service: FetchmapService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FetchmapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
