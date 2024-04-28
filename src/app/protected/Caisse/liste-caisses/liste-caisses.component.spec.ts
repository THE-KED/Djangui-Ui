import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeCaissesComponent } from './liste-caisses.component';

describe('ListeCaissesComponent', () => {
  let component: ListeCaissesComponent;
  let fixture: ComponentFixture<ListeCaissesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListeCaissesComponent]
    });
    fixture = TestBed.createComponent(ListeCaissesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
