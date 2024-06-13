import { TestBed } from '@angular/core/testing';
import { CanActivate } from '@angular/router';

import { AdminGuard } from './admin.guard'; // Assuming AdminGuard is correctly named

describe('AdminGuard', () => {
  let guard: AdminGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(AdminGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
