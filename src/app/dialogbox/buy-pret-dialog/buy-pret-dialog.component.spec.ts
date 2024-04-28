import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuyPretDialogComponent } from './buy-pret-dialog.component';

describe('BuyPretDialogComponent', () => {
  let component: BuyPretDialogComponent;
  let fixture: ComponentFixture<BuyPretDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BuyPretDialogComponent]
    });
    fixture = TestBed.createComponent(BuyPretDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
