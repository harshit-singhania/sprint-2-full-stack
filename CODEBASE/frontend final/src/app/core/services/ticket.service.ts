import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Ticket } from '../models/ticket.model';

@Injectable({ providedIn: 'root' })
export class TicketService {
  private base = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getMyTickets(): Observable<Ticket[]> {
    return this.http.get<any>(`${this.base}/api/user/support-tickets`).pipe(
      map(res => Array.isArray(res) ? res : []),
      catchError(e => throwError(() => e))
    );
  }

  createTicket(data: { subject: string; description: string }): Observable<Ticket> {
    return this.http.post<Ticket>(`${this.base}/api/user/support-tickets`, data)
      .pipe(catchError(e => throwError(() => e)));
  }

  getTicketById(id: number): Observable<Ticket> {
    return this.getMyTickets().pipe(
      map(tickets => {
        const ticket = tickets.find(t => t.id === id);
        if (!ticket) throw { error: { message: 'Ticket not found' } };
        return ticket;
      }),
      catchError(e => throwError(() => e))
    );
  }

  // Correct endpoint: POST /api/user/support-tickets/{ticketId}/messages
  replyToTicket(id: number, message: string): Observable<Ticket> {
    return this.http.post<Ticket>(
      `${this.base}/api/user/support-tickets/${id}/messages`,
      { message }
    ).pipe(catchError(e => throwError(() => e)));
  }
}
