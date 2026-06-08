import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  private base = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  submitFeedback(data: { rating: number; comment?: string }): Observable<any> {
    return this.http.post(`${this.base}/api/feedback`, data).pipe(catchError(e => throwError(() => e)));
  }
}
