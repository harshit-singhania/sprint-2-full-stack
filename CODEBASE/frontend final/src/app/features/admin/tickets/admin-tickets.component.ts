import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Ticket } from '../../../core/models/ticket.model';
import { AdminService } from '../../../core/services/admin.service';
import { StatusChipComponent } from '../../../shared/components/status-chip/status-chip.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

type FilterMode = 'open' | 'closed' | 'all';

@Component({
  selector: 'app-admin-tickets',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    StatusChipComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent
  ],
  template: `
    <div class="tickets-page">
      <div class="page-head">
        <div>
          <div class="eyebrow mono">Support queue</div>
          <h1 class="page-heading">Support tickets</h1>
          <p class="body page-intro">Review open requests, closed conversations, and the full queue in one place.</p>
        </div>
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
          icon="ph ph-warning-circle"
          title="Could not load tickets"
          message="Try again in a moment."
        ></app-empty-state>

        <ng-container *ngIf="!error">
          <div class="segmented">
            <button
              type="button"
              class="segmented__button"
              [class.segmented__button--active]="activeFilter === 'open'"
              (click)="activeFilter = 'open'"
            >
              Open <span class="mono">{{ openTickets.length }}</span>
            </button>
            <button
              type="button"
              class="segmented__button"
              [class.segmented__button--active]="activeFilter === 'closed'"
              (click)="activeFilter = 'closed'"
            >
              Closed <span class="mono">{{ closedTickets.length }}</span>
            </button>
            <button
              type="button"
              class="segmented__button"
              [class.segmented__button--active]="activeFilter === 'all'"
              (click)="activeFilter = 'all'"
            >
              All <span class="mono">{{ tickets.length }}</span>
            </button>
          </div>

          <app-empty-state
            *ngIf="visibleTickets.length === 0"
            icon="ph ph-lifebuoy"
            title="No tickets in this view"
            message="Switch tabs or wait for a new request."
          ></app-empty-state>

          <div *ngIf="visibleTickets.length > 0" class="surface-card ticket-list">
            <a
              *ngFor="let ticket of visibleTickets"
              class="ticket-row"
              [routerLink]="['/admin/tickets', ticket.id]"
            >
              <div class="ticket-main">
                <div class="ticket-subject h3">{{ ticket.subject }}</div>
                <div class="ticket-meta">
                  <span class="mono">{{ ticket.buyer.name }}</span>
                  <span class="mono">{{ getLastActivity(ticket) | date:'dd MMM yyyy, hh:mm a' }}</span>
                </div>
              </div>

              <div class="ticket-side">
                <app-status-chip [status]="ticket.status"></app-status-chip>
                <span class="ticket-side__count mono">{{ ticket.responses.length }} update{{ ticket.responses.length === 1 ? '' : 's' }}</span>
              </div>
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
      gap: 20px;
      padding-bottom: 24px;
    }

    .page-head {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      align-items: flex-end;
      flex-wrap: wrap;
    }

    .page-intro {
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

    .segmented {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: var(--surface-1);
      border: 1px solid var(--hairline);
      border-radius: var(--radius-pill);
      padding: 4px;
      width: fit-content;
    }

    .segmented__button {
      appearance: none;
      border: 0;
      background: transparent;
      color: var(--text-secondary);
      font-family: var(--font-sans);
      font-size: 14px;
      font-weight: 500;
      border-radius: var(--radius-pill);
      padding: 10px 16px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: background var(--dur) var(--ease), color var(--dur) var(--ease);
    }

    .segmented__button:hover {
      color: var(--text-primary);
    }

    .segmented__button--active {
      background: var(--accent-wash);
      color: var(--text-primary);
    }

    .ticket-list {
      overflow: hidden;
    }

    .ticket-row {
      display: flex;
      justify-content: space-between;
      gap: 18px;
      align-items: center;
      padding: 18px 20px;
      text-decoration: none;
      color: inherit;
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
    }

    .ticket-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 8px;
      color: var(--text-tertiary);
    }

    .ticket-side {
      display: flex;
      flex-direction: column;
      gap: 8px;
      align-items: flex-end;
      flex-shrink: 0;
    }

    .ticket-side__count {
      color: var(--text-tertiary);
      font-size: 12px;
    }

    @media (max-width: 720px) {
      .ticket-row {
        flex-direction: column;
        align-items: flex-start;
      }

      .ticket-side {
        align-items: flex-start;
      }

      .segmented {
        width: 100%;
      }

      .segmented__button {
        flex: 1 1 0;
        justify-content: center;
      }
    }
  `]
})
export class AdminTicketsComponent implements OnInit {
  tickets: Ticket[] = [];
  isLoading = true;
  error = '';
  activeFilter: FilterMode = 'open';
  skeletonRows = [0, 1, 2, 3];

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.adminService.getTickets().subscribe({
      next: (tickets) => {
        this.tickets = tickets;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Failed to load tickets.';
        this.isLoading = false;
      }
    });
  }

  get openTickets() {
    return this.tickets.filter(ticket => ticket.status === 'OPEN');
  }

  get closedTickets() {
    return this.tickets.filter(ticket => ticket.status === 'CLOSED');
  }

  get visibleTickets() {
    if (this.activeFilter === 'all') return this.tickets;
    if (this.activeFilter === 'closed') return this.closedTickets;
    return this.openTickets;
  }

  getLastActivity(ticket: Ticket): string {
    const lastReply = ticket.responses?.[ticket.responses.length - 1];
    return lastReply?.respondedAt || ticket.createdAt;
  }
}
