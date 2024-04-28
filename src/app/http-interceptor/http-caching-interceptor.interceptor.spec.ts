import { TestBed } from '@angular/core/testing';

import { HttpCachingInterceptorInterceptor } from './http-caching-interceptor.interceptor';

describe('HttpCachingInterceptorInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      HttpCachingInterceptorInterceptor
      ]
  }));

  it('should be created', () => {
    const interceptor: HttpCachingInterceptorInterceptor = TestBed.inject(HttpCachingInterceptorInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
