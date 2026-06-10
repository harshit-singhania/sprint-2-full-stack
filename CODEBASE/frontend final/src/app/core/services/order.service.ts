import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Order } from '../models/order.model';

export interface ReceiptResponse {
  orderId: number;
  receiptNumber: string;
  buyerName: string;
  buyerUsername: string;
  buyerEmail: string;
  buyerPhone: string;
  sellerName: string;
  sellerUsername: string;
  sellerEmail: string;
  carId: number;
  carMake: string;
  carModel: string;
  carYear: number;
  carColor: string;
  carMileage: number;
  paymentId: string;
  amount: number;
  paymentMethod: string;
  gatewayTransactionId: string;
  paymentStatus: string;
  orderStatus: string;
  orderDate: string;
  generatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private base = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getMyOrders(): Observable<Order[]> {
    return this.http.get<any>(`${this.base}/api/orders/my`).pipe(
      map(res => Array.isArray(res) ? res : []),
      catchError(e => throwError(() => e))
    );
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
    // Try direct endpoint first, fall back to list filtering
    return this.http.get<Order[]>(`${this.base}/api/orders/my`).pipe(
      map(orders => {
        if (!Array.isArray(orders)) {
          throw new Error('Order not found');
        }
        const order = orders.find(o => o.id === id);
        if (!order) throw new Error('Order not found');
        return order;
      }),
      catchError(e => throwError(() => e))
    );
  }

  getReceipt(orderId: number): Observable<ReceiptResponse> {
    return this.http.get<ReceiptResponse>(`${this.base}/api/orders/${orderId}/receipt`)
      .pipe(catchError(e => throwError(() => e)));
  }
}
