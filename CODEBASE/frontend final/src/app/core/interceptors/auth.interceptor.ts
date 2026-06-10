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
        // Only force logout on 401 (session expired/invalid token).
        // 403 can be a legitimate permission denial (e.g. review endpoint)
        // and must NOT clear the session.
        if (error.status === 401) {
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
