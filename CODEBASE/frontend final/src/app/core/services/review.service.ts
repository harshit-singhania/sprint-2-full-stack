import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { SellerReview, SellerAverageRating } from '../models/review.model';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private base = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  submitReview(sellerId: number, rating: number, comment?: string): Observable<SellerReview> {
    const body: any = { rating };
    if (comment) body.comment = comment;
    return this.http.post<SellerReview>(`${this.base}/api/reviews/sellers/${sellerId}`, body)
      .pipe(catchError(e => throwError(() => e)));
  }

  getSellerReviews(sellerId: number): Observable<SellerReview[]> {
    return this.http.get<any>(`${this.base}/api/reviews/sellers/${sellerId}`).pipe(
      map(res => Array.isArray(res) ? res : []),
      catchError(() => of([]))   // return empty array on any error — don't break the page
    );
  }

  getSellerAverageRating(sellerId: number): Observable<SellerAverageRating> {
    return this.http.get<SellerAverageRating>(`${this.base}/api/reviews/sellers/${sellerId}/average`)
      .pipe(catchError(e => throwError(() => e)));
  }
}
