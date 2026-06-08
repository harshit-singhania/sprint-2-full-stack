import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { Ticket } from '../../../core/models/ticket.model';
import { AdminService } from '../../../core/services/admin.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { StatusChipComponent } from '../../../shared/components/status-chip/status-chip.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-admin-ticket-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    StatusChipComponent,
    LoadingSpinnerComponent,
    ConfirmDialogComponent,
    EmptyStateComponent
  ],
  template: `
    <div class="page ticket-detail-page">
      <a routerLink="/admin/tickets" class="back-link">
        <i class="ph ph-arrow-left" aria-hidden="true"></i>
        <span>Back to Tickets</span>
      </a>

      <app-loading-spinner *ngIf="isLoading" variant="detail"></app-loading-spinner>

      <app-empty-state
        *ngIf="!isLoading && error"
        icon="ph ph-warning-circle"
        title="Could not load this ticket"
        message="Try again in a moment."
      >
        <a class="btn btn-primary" routerLink="/admin/tickets">Back to Tickets</a>
      </app-empty-state>

      <ng-container *ngIf="!isLoading && ticket && !error">
        <section class="ticket-hero surface-card">
          <div class="ticket-hero__copy">
            <div class="eyebrow mono">Admin support</div>
            <h1 class="display ticket-title">{{ ticket.subject }}</h1>
            <p class="body ticket-meta">
              Opened {{ ticket.createdAt | date:'dd MMM yyyy, hh:mm a' }} by {{ ticket.buyer.name }}
            </p>
          </div>

          <div class="ticket-hero__status">
            <div class="status-toggle" aria-label="Ticket status">
              <button class="status-toggle__button" [class.status-toggle__button--active]="ticket.status === 'OPEN'" type="button">
                Open
              </button>
              <button
                class="status-toggle__button"
                [class.status-toggle__button--active]="ticket.status === 'CLOSED'"
                type="button"
                (click)="ticket.status === 'OPEN' && closeTicket()"
              >
                Closed
              </button>
            </div>
            <app-status-chip [status]="ticket.status"></app-status-chip>
          </div>
        </section>

        <div class="ticket-layout">
          <section class="surface-card thread-panel">
            <div class="thread-list">
              <article class="thread-bubble thread-bubble--mine">
                <div class="thread-bubble__meta mono">
                  <span>{{ ticket.buyer.name }}</span>
                  <span>{{ ticket.createdAt | date:'dd MMM yyyy, hh:mm a' }}</span>
                </div>
                <p>{{ ticket.description }}</p>
              </article>

              <article
                *ngFor="let reply of ticket.responses"
                class="thread-bubble"
                [class.thread-bubble--admin]="reply.sender.role === 'ADMIN'"
                [class.thread-bubble--mine]="reply.sender.role !== 'ADMIN'"
              >
                <div class="thread-bubble__meta mono">
                  <span>{{ reply.sender.name }}</span>
                  <span>{{ reply.respondedAt | date:'dd MMM yyyy, hh:mm a' }}</span>
                </div>
                <p>{{ reply.message }}</p>
              </article>

              <div *ngIf="!ticket.responses || ticket.responses.length === 0" class="thread-empty">
                No replies yet. The thread starts with the request above.
              </div>
            </div>
          </section>

          <aside class="surface-card composer-panel">
            <div class="composer-panel__head">
              <div class="h3">Reply as admin</div>
              <p class="body composer-note">Keep the thread moving with a short, clear update.</p>
            </div>

            <form [formGroup]="replyForm" (ngSubmit)="sendReply()" class="composer-form">
              <div class="field-group">
                <label class="field-label" for="admin-reply-message">Message</label>
                <mat-form-field appearance="outline" class="form-field">
                  <textarea
                    id="admin-reply-message"
                    matInput
                    formControlName="message"
                    rows="7"
                    placeholder="Type your reply"
                    [disabled]="ticket.status === 'CLOSED'"
                  ></textarea>
                </mat-form-field>
                <div class="field-help" *ngIf="ticket.status !== 'CLOSED'">This reply appears in the support thread immediately after send.</div>
                <div class="field-help" *ngIf="ticket.status === 'CLOSED'">This ticket is closed. Reopen support with a new request if needed.</div>
              </div>

              <div class="composer-error" *ngIf="replyError">{{ replyError }}</div>

              <div class="composer-actions">
                <button
                  class="btn btn-primary send-btn"
                  type="submit"
                  [disabled]="replyForm.invalid || isSending || ticket.status === 'CLOSED'"
                >
                  <ng-container *ngIf="!isSending">Send reply</ng-container>
                  <ng-container *ngIf="isSending">
                    <app-loading-spinner variant="spinner"></app-loading-spinner>
                    <span>Sending</span>
                  </ng-container>
                </button>
              </div>
            </form>
          </aside>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .ticket-detail-page {
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding-bottom: 24px;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      width: fit-content;
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 14px;
    }

    .back-link:hover {
      color: var(--text-primary);
    }

    .ticket-hero {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 20px;
      padding: 24px;
    }

    .ticket-hero__copy {
      min-width: 0;
    }

    .ticket-title {
      margin: 0 0 12px;
      font-size: clamp(28px, 4vw, 44px);
    }

    .ticket-meta {
      margin: 0;
      max-width: 60ch;
    }

    .ticket-hero__status {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 10px;
      flex-shrink: 0;
    }

    .status-toggle {
      display: inline-flex;
      align-items: center;
      padding: 4px;
      gap: 4px;
      border-radius: var(--radius-pill);
      background: var(--surface-1);
      border: 1px solid var(--hairline);
    }

    .status-toggle__button {
      appearance: none;
      border: 0;
      background: transparent;
      color: var(--text-secondary);
      font-family: var(--font-sans);
      font-size: 13px;
      font-weight: 500;
      padding: 9px 14px;
      border-radius: var(--radius-pill);
      cursor: pointer;
      transition: background var(--dur) var(--ease), color var(--dur) var(--ease);
    }

    .status-toggle__button--active {
      background: var(--accent-wash);
      color: var(--text-primary);
    }

    .ticket-layout {
      display: grid;
      grid-template-columns: minmax(0, 1.5fr) minmax(300px, 420px);
      gap: 20px;
      align-items: start;
    }

    .thread-panel,
    .composer-panel {
      border-radius: var(--radius-card);
      border: 1px solid var(--hairline);
      background: var(--surface-1);
      box-shadow: var(--elev-card);
    }

    .thread-panel {
      padding: 20px;
    }

    .thread-list {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .thread-bubble {
      width: min(100%, 84%);
      margin-right: auto;
      border-radius: 18px 18px 18px 6px;
      background: var(--surface-2);
      border: 1px solid var(--hairline);
      padding: 16px 18px;
      color: var(--text-primary);
    }

    .thread-bubble--mine {
      margin-left: auto;
      margin-right: 0;
      border-radius: 18px 18px 6px 18px;
      background: rgba(10, 132, 255, 0.12);
      border-color: rgba(10, 132, 255, 0.18);
    }

    .thread-bubble--admin {
      background: var(--surface-2);
    }

    .thread-bubble__meta {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      color: var(--text-tertiary);
      font-size: 11px;
      text-transform: none;
      margin-bottom: 10px;
    }

    .thread-bubble p {
      margin: 0;
      line-height: 1.65;
      color: var(--text-primary);
    }

    .thread-empty {
      padding: 20px 0 8px;
      color: var(--text-tertiary);
      font-size: 14px;
      text-align: center;
    }

    .composer-panel {
      position: sticky;
      top: 88px;
      padding: 20px;
    }

    .composer-panel__head {
      margin-bottom: 16px;
    }

    .composer-note {
      margin: 6px 0 0;
    }

    .composer-form {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .field-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .field-label {
      font-size: 13px;
      font-weight: 500;
      color: var(--text-secondary);
    }

    .field-help {
      font-size: 13px;
      line-height: 1.5;
      color: var(--text-tertiary);
    }

    .form-field {
      width: 100%;
    }

    .composer-error {
      color: var(--danger);
      font-size: 13px;
      line-height: 1.5;
    }

    .composer-actions {
      display: flex;
      justify-content: flex-end;
    }

    .send-btn {
      min-width: 140px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }

    @media (max-width: 1024px) {
      .ticket-layout {
        grid-template-columns: 1fr;
      }

      .composer-panel {
        position: static;
      }
    }

    @media (max-width: 720px) {
      .ticket-hero {
        flex-direction: column;
      }

      .ticket-hero__status {
        align-items: flex-start;
      }

      .thread-bubble {
        width: 100%;
      }

      .composer-actions .btn {
        width: 100%;
      }
    }
  `]
})
export class AdminTicketDetailComponent implements OnInit {
  ticket: Ticket | null = null;
  isLoading = true;
  isSending = false;
  currentUsername = '';
  error = '';
  replyError = '';

  replyForm = this.fb.group({
    message: ['', [Validators.required]]
  });

  constructor(
    private route: ActivatedRoute,
    private adminService: AdminService,
    private auth: AuthService,
    private toast: ToastService,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.currentUsername = this.auth.getUsername() || '';
    this.loadTicket();
  }

  loadTicket() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.adminService.getTicketById(id).subscribe({
      next: (ticket) => {
        this.ticket = ticket;
        this.error = '';
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Ticket not found.';
        this.isLoading = false;
      }
    });
  }

  closeTicket() {
    if (!this.ticket) return;

    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Close ticket',
        message: 'Close this ticket? The user will no longer be able to reply.',
        confirmLabel: 'Close ticket',
        confirmColor: 'warn',
        destructive: true
      }
    });

    ref.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.adminService.closeTicket(this.ticket!.id).subscribe({
        next: () => {
          this.toast.success('Ticket closed.');
          this.loadTicket();
        },
        error: () => this.toast.error('Failed to close ticket')
      });
    });
  }

  sendReply() {
    if (this.replyForm.invalid || !this.ticket) return;
    this.isSending = true;
    this.replyError = '';
    const message = this.replyForm.get('message')?.value!;
    this.adminService.replyToTicket(this.ticket.id, message).subscribe({
      next: () => {
        this.replyForm.reset();
        this.isSending = false;
        this.loadTicket();
        this.toast.success('Reply sent.');
      },
      error: () => {
        this.isSending = false;
        this.replyError = 'Failed to send reply.';
        this.toast.error('Failed to send reply');
      }
    });
  }

  isOwnReply(reply: any): boolean {
    return reply?.sender?.username === this.currentUsername;
  }
}
