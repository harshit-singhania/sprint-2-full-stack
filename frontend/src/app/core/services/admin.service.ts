import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Car } from '../models/car.model';
import { Order } from '../models/order.model';
import { User } from '../models/user.model';
import { Feedback } from '../models/feedback.model';
import { Ticket } from '../models/ticket.model';

export interface AdminDashboardSummary {
  totalUsers: number;
  admins: number;
  users: number;
  totalCars: number;
  availableCars: number;
  soldCars: number;
  pendingCarApprovals: number;
  rejectedCars: number;
  totalOrders: number;
  pendingAdminOrders: number;
  pendingOrders: number;
  approvedOrders: number;
  rejectedOrders: number;
  cancelledOrders: number;
  fraudAlerts: number;
  openTickets: number;
  closedTickets: number;
  totalRevenue: number | string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private base = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<AdminDashboardSummary> {
    return this.http.get<AdminDashboardSummary>(`${this.base}/api/admin/dashboard`).pipe(catchError(e => throwError(() => e)));
  }

  getPendingCars(): Observable<Car[]> {
    return this.http.get<Car[]>(`${this.base}/api/admin/cars/pending`).pipe(catchError(e => throwError(() => e)));
  }

  approveCar(id: number): Observable<any> {
    return this.http.post(`${this.base}/api/admin/cars/${id}/approve`, {}).pipe(catchError(e => throwError(() => e)));
  }

  rejectCar(id: number): Observable<any> {
    return this.http.post(`${this.base}/api/admin/cars/${id}/reject`, {}).pipe(catchError(e => throwError(() => e)));
  }

  getPendingOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.base}/api/admin/orders/pending`).pipe(catchError(e => throwError(() => e)));
  }

  approveOrder(id: number): Observable<any> {
    return this.http.post(`${this.base}/api/admin/orders/${id}/approve`, {}).pipe(catchError(e => throwError(() => e)));
  }

  rejectOrder(id: number): Observable<any> {
    return this.http.post(`${this.base}/api/admin/orders/${id}/reject`, {}).pipe(catchError(e => throwError(() => e)));
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.base}/api/admin/users`).pipe(catchError(e => throwError(() => e)));
  }

  getFeedback(): Observable<Feedback[]> {
    return this.http.get<Feedback[]>(`${this.base}/api/feedback/admin`).pipe(catchError(e => throwError(() => e)));
  }

  getTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.base}/api/admin/support-tickets`).pipe(catchError(e => throwError(() => e)));
  }

  closeTicket(id: number): Observable<any> {
    return this.http.patch(`${this.base}/api/admin/support-tickets/${id}`, { status: 'CLOSED' }).pipe(catchError(e => throwError(() => e)));
  }

  replyToTicket(id: number, message: string): Observable<any> {
    return this.http.post(`${this.base}/api/support-tickets/${id}/messages`, { message }).pipe(catchError(e => throwError(() => e)));
  }

  getTicketById(id: number): Observable<Ticket> {
    return this.getTickets().pipe(
      map(tickets => {
        const ticket = tickets.find(t => t.id === id);
        if (!ticket) throw { error: { message: 'Ticket not found' } };
        return ticket;
      }),
      catchError(e => throwError(() => e))
    );
  }
}
