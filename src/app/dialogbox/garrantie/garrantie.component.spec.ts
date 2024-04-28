import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GarrantieComponent } from './garrantie.component';

describe('GarrantieComponent', () => {
  let component: GarrantieComponent;
  let fixture: ComponentFixture<GarrantieComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GarrantieComponent]
    });
    fixture = TestBed.createComponent(GarrantieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
