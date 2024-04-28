import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaisseOperationComponent } from './caisse-operation.component';

describe('CaisseOperationComponent', () => {
  let component: CaisseOperationComponent;
  let fixture: ComponentFixture<CaisseOperationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CaisseOperationComponent]
    });
    fixture = TestBed.createComponent(CaisseOperationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
