import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddshapeComponent } from './addshape.component';

describe('AddshapeComponent', () => {
  let component: AddshapeComponent;
  let fixture: ComponentFixture<AddshapeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddshapeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddshapeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
