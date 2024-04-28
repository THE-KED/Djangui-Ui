import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor, HttpResponse
} from '@angular/common/http';
import {Observable, of, tap} from 'rxjs';
import {CacheResolverService} from "../Services/CacheResolverService";

const TIME_TO_LIVE= 100;

@Injectable()
export class HttpCachingInterceptorInterceptor implements HttpInterceptor {

  constructor(private cache: CacheResolverService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    console.log("request",request);
    if (request.method !='GET'||request.url.includes("/auth")){
      return next.handle(request);

    }

    const cachedResponse = this.cache.get(request.url);

    return cachedResponse ? of(cachedResponse):this.sendRequest(request,next);
  }

  sendRequest(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>>{

    let ttl = this.cache.map(request.url);

    return next.handle(request).pipe(
      tap((event)=>{
        if(event instanceof HttpResponse){
          this.cache.set(request.urlWithParams,event,ttl);
        }
      })
    )
  };
}
