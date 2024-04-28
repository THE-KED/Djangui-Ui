import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MembreBilanComponent } from './membre-bilan.component';

describe('MembreBilanComponent', () => {
  let component: MembreBilanComponent;
  let fixture: ComponentFixture<MembreBilanComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MembreBilanComponent]
    });
    fixture = TestBed.createComponent(MembreBilanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
