import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuyPretComponent } from './buy-pret.component';

describe('BuyPretComponent', () => {
  let component: BuyPretComponent;
  let fixture: ComponentFixture<BuyPretComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BuyPretComponent]
    });
    fixture = TestBed.createComponent(BuyPretComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
