import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaisseEtatComponent } from './caisse-etat.component';

describe('EtatComponent', () => {
  let component: CaisseEtatComponent;
  let fixture: ComponentFixture<CaisseEtatComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CaisseEtatComponent]
    });
    fixture = TestBed.createComponent(CaisseEtatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
