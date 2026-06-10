import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('session_token');
    const authReq = token
      ? req.clone({ headers: req.headers.set('X-Session-Token', token) })
      : req;

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 || error.status === 403) {
          localStorage.removeItem('session_token');
          localStorage.removeItem('user_role');
          localStorage.removeItem('username');
          localStorage.removeItem('user_id');
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
}
