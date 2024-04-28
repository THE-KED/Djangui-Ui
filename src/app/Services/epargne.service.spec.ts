import { TestBed } from '@angular/core/testing';

import { EpargneService } from './epargne.service';

describe('EpargneService', () => {
  let service: EpargneService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EpargneService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
