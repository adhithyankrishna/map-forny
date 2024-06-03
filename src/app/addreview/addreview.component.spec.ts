import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddreviewComponent } from './addreview.component';

describe('AddreviewComponent', () => {
  let component: AddreviewComponent;
  let fixture: ComponentFixture<AddreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddreviewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
