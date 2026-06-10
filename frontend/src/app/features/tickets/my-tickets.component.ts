import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Ticket } from '../../core/models/ticket.model';
import { TicketService } from '../../core/services/ticket.service';
import { StatusChipComponent } from '../../shared/components/status-chip/status-chip.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-my-tickets',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    RouterModule,
    StatusChipComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent
  ],
  template: `
    <div class="page tickets-page">
      <div class="page-head">
        <div>
          <div class="eyebrow mono">Support</div>
          <h2 class="h2 tickets-title">Support</h2>
          <p class="body tickets-copy">Open a request and our team will reply in the thread.</p>
        </div>

        <a class="btn btn-primary" routerLink="/tickets/new">New request</a>
      </div>

      <ng-container *ngIf="isLoading">
        <div class="ticket-skeletons">
          <div class="ticket-skeleton surface-card" *ngFor="let _ of skeletonRows">
            <app-loading-spinner variant="row"></app-loading-spinner>
          </div>
        </div>
      </ng-container>

      <ng-container *ngIf="!isLoading">
        <app-empty-state
          *ngIf="error"
          icon="ph ph-lifebuoy"
          title="Could not load support requests"
          message="Try again in a moment."
        >
          <a class="btn btn-primary" routerLink="/tickets/new">New request</a>
        </app-empty-state>

        <ng-container *ngIf="!error">
          <app-empty-state
            *ngIf="tickets.length === 0"
            icon="ph ph-lifebuoy"
            title="No requests yet"
            message="Open a request and our team will reply in the thread."
          >
            <a class="btn btn-primary" routerLink="/tickets/new">New request</a>
          </app-empty-state>

          <div *ngIf="tickets.length > 0" class="surface-card ticket-list">
            <a
              *ngFor="let ticket of tickets"
              class="ticket-row"
              [routerLink]="['/tickets', ticket.id]"
            >
              <div class="ticket-main">
                <div class="ticket-subject h3">{{ ticket.subject }}</div>
                <div class="ticket-meta">
                  <span class="mono ticket-meta__time">{{ getLastActivity(ticket) | date:'dd MMM yyyy, hh:mm a' }}</span>
                  <span class="ticket-meta__dot"></span>
                  <span class="ticket-meta__hint">{{ getRepliesCount(ticket) }} update{{ getRepliesCount(ticket) === 1 ? '' : 's' }}</span>
                </div>
              </div>

              <app-status-chip [status]="ticket.status"></app-status-chip>
            </a>
          </div>
        </ng-container>
      </ng-container>
    </div>
  `,
  styles: [`
    .tickets-page {
      display: flex;
      flex-direction: column;
      gap: 24px;
      padding-bottom: 24px;
    }

    .page-head {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
    }

    .tickets-title {
      margin: 0 0 8px;
    }

    .tickets-copy {
      margin: 0;
    }

    .ticket-skeletons {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .ticket-skeleton {
      padding: 4px 16px;
    }

    .ticket-list {
      overflow: hidden;
    }

    .ticket-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      padding: 18px 20px;
      color: inherit;
      text-decoration: none;
      border-top: 1px solid var(--hairline);
      transition: background var(--dur) var(--ease), transform var(--dur) var(--ease);
    }

    .ticket-row:first-child {
      border-top: 0;
    }

    .ticket-row:hover {
      background: var(--surface-2);
      transform: translateY(-1px);
    }

    .ticket-main {
      min-width: 0;
      flex: 1 1 auto;
    }

    .ticket-subject {
      margin: 0;
      color: var(--text-primary);
    }

    .ticket-meta {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 8px;
      color: var(--text-tertiary);
      flex-wrap: wrap;
    }

    .ticket-meta__time {
      color: var(--text-secondary);
    }

    .ticket-meta__dot {
      width: 4px;
      height: 4px;
      border-radius: 999px;
      background: var(--hairline-strong);
    }

    .ticket-meta__hint {
      color: var(--text-tertiary);
      font-size: 13px;
    }

    @media (max-width: 720px) {
      .ticket-row {
        align-items: flex-start;
        flex-direction: column;
      }
    }
  `]
})
export class MyTicketsComponent implements OnInit {
  tickets: Ticket[] = [];
  isLoading = true;
  error = '';
  skeletonRows = [0, 1, 2, 3];

  constructor(private ticketService: TicketService) {}

  ngOnInit() {
    this.ticketService.getMyTickets().subscribe({
      next: (tickets) => {
        this.tickets = tickets;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Failed to load support requests.';
        this.isLoading = false;
      }
    });
  }

  getLastActivity(ticket: Ticket): string {
    const lastReply = ticket.responses?.[ticket.responses.length - 1];
    return lastReply?.respondedAt || ticket.createdAt;
  }

  getRepliesCount(ticket: Ticket): number {
    return ticket.responses?.length || 0;
  }
}
