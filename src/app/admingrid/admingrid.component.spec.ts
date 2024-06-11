import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdmingridComponent } from './admingrid.component';

describe('AdmingridComponent', () => {
  let component: AdmingridComponent;
  let fixture: ComponentFixture<AdmingridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdmingridComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdmingridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
