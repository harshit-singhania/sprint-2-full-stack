import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Car } from '../models/car.model';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private base = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getWishlist(): Observable<Car[]> {
    return this.http.get<any[]>(`${this.base}/api/user/wishlist`).pipe(
      map(items => items.map(item => item.car as Car)),
      catchError(e => throwError(() => e))
    );
  }

  addToWishlist(carId: number): Observable<any> {
    return this.http.post(`${this.base}/api/user/wishlist/${carId}`, {}).pipe(catchError(e => throwError(() => e)));
  }

  removeFromWishlist(carId: number): Observable<any> {
    return this.http.delete(`${this.base}/api/user/wishlist/${carId}`).pipe(catchError(e => throwError(() => e)));
  }
}
