import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Order } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private base = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getMyOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.base}/api/orders/my`).pipe(catchError(e => throwError(() => e)));
  }

  purchaseCar(carId: number, data: { paymentMethod: string; paymentToken: string }): Observable<Order> {
    return this.http.post<Order>(`${this.base}/api/user/cars/${carId}/purchase`, data).pipe(catchError(e => throwError(() => e)));
  }

  getPendingSales(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.base}/api/user/sales/pending`).pipe(catchError(e => throwError(() => e)));
  }

  approveSale(orderId: number): Observable<any> {
    return this.http.post(`${this.base}/api/user/sales/${orderId}/approve`, {}).pipe(catchError(e => throwError(() => e)));
  }

  rejectSale(orderId: number): Observable<any> {
    return this.http.post(`${this.base}/api/user/sales/${orderId}/reject`, {}).pipe(catchError(e => throwError(() => e)));
  }

  getOrderById(id: number): Observable<Order> {
    return this.getMyOrders().pipe(
      map(orders => {
        const order = orders.find(o => o.id === id);
        if (!order) throw new Error('Order not found');
        return order;
      }),
      catchError(e => throwError(() => e))
    );
  }
}
