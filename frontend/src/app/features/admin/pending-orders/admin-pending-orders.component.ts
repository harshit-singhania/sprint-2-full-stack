import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { Order } from '../../../core/models/order.model';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { StatusChipComponent } from '../../../shared/components/status-chip/status-chip.component';
import { InrCurrencyPipe } from '../../../core/pipes/inr-currency.pipe';

@Component({
  selector: 'app-admin-pending-orders',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ConfirmDialogComponent,
    StatusChipComponent,
    InrCurrencyPipe
  ],
  template: `
    <div class="pending-page">
      <div class="page-head">
        <div>
          <div class="eyebrow mono">Review queue</div>
          <h1 class="page-heading">Pending orders</h1>
          <p class="body page-intro">Review payment and fraud signals, then approve or reject the queue.</p>
        </div>
      </div>

      <ng-container *ngIf="isLoading">
        <div class="queue-skeletons">
          <div class="queue-skeleton surface-card" *ngFor="let _ of skeletonRows">
            <app-loading-spinner variant="row"></app-loading-spinner>
          </div>
        </div>
      </ng-container>

      <ng-container *ngIf="!isLoading">
        <app-empty-state
          *ngIf="error"
          icon="ph ph-warning-circle"
          title="Could not load pending orders"
          message="Try again in a moment."
        ></app-empty-state>

        <ng-container *ngIf="!error">
          <app-empty-state
            *ngIf="orders.length === 0"
            icon="ph ph-check-circle"
            title="No orders awaiting approval"
            message="Everything in the queue has been handled."
          ></app-empty-state>

          <div *ngIf="orders.length > 0" class="queue-list">
            <article
              class="surface-card queue-row"
              *ngFor="let order of orders"
              (click)="toggleExpanded(order.id)"
            >
              <div class="queue-copy">
                <div class="queue-title h3">Order #{{ order.id }}</div>
                <div class="queue-meta">
                  <span class="mono">{{ order.car.make }} {{ order.car.model }}</span>
                  <span class="mono">{{ (order.payment?.amount ?? 0) | inrCurrency }}</span>
                </div>
                <div class="queue-meta queue-meta--secondary">
                  <span class="mono">{{ order.buyer.name }}</span>
                  <span class="mono">{{ order.seller.name }}</span>
                  <app-status-chip [status]="order.payment?.status ?? ''"></app-status-chip>
                </div>
                <div class="fraud-badge" *ngIf="order.fraudAlert">
                  <i class="ph ph-warning-circle" aria-hidden="true"></i>
                  Fraud alert
                </div>
              </div>

              <div class="queue-actions" (click)="$event.stopPropagation()">
                <button class="btn btn-primary queue-action" type="button" (click)="approve(order, $event)">Approve</button>
                <button class="btn btn-ghost queue-action queue-action--danger" type="button" (click)="reject(order, $event)">Reject</button>
              </div>

              <div class="queue-preview" *ngIf="expandedOrderId === order.id">
                <div class="queue-preview__grid">
                  <div>
                    <div class="eyebrow mono">Buyer</div>
                    <div class="queue-preview__value mono">{{ order.buyer.name }}</div>
                    <div class="queue-preview__sub mono">{{ order.buyer.phoneNumber }}</div>
                  </div>
                  <div>
                    <div class="eyebrow mono">Seller</div>
                    <div class="queue-preview__value mono">{{ order.seller.name }}</div>
                    <div class="queue-preview__sub mono">{{ order.seller.phoneNumber }}</div>
                  </div>
                  <div>
                    <div class="eyebrow mono">Payment method</div>
                    <div class="queue-preview__value">{{ order.payment?.method }}</div>
                  </div>
                  <div>
                    <div class="eyebrow mono">Transaction ID</div>
                    <div class="queue-preview__value mono">{{ maskToken(order.payment?.gatewayTransactionId) }}</div>
                  </div>
                  <div>
                    <div class="eyebrow mono">Listed car</div>
                    <div class="queue-preview__value">{{ order.car.year }} {{ order.car.make }} {{ order.car.model }}</div>
                  </div>
                  <div>
                    <div class="eyebrow mono">Fraud flag</div>
                    <div class="queue-preview__value">{{ order.fraudAlert ? 'Yes' : 'No' }}</div>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </ng-container>
      </ng-container>
    </div>
  `,
  styles: [`
    .pending-page {
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

    .queue-skeletons {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .queue-skeleton {
      padding: 4px 16px;
    }

    .queue-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .queue-row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 14px;
      align-items: center;
      padding: 14px 18px;
      cursor: pointer;
      border-radius: var(--radius-card);
      transition: background var(--dur) var(--ease), transform var(--dur) var(--ease);
    }

    .queue-row:hover {
      background: var(--surface-2);
      transform: translateY(-1px);
    }

    .queue-copy {
      min-width: 0;
    }

    .queue-title {
      margin: 0;
    }

    .queue-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 8px;
      color: var(--text-secondary);
    }

    .queue-meta--secondary {
      color: var(--text-tertiary);
    }

    .queue-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      justify-content: flex-end;
      flex-shrink: 0;
    }

    .queue-action {
      min-width: 96px;
    }

    .queue-action--danger {
      color: var(--danger);
    }

    .queue-action--danger:hover {
      background: rgba(255, 69, 58, 0.08);
      border-color: rgba(255, 69, 58, 0.22);
    }

    .fraud-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin-top: 10px;
      color: var(--warning);
      font-size: 12px;
      font-family: var(--font-mono);
    }

    .queue-preview {
      grid-column: 1 / -1;
      margin-top: 6px;
      padding-top: 18px;
      border-top: 1px solid var(--hairline);
    }

    .queue-preview__grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 14px;
    }

    .queue-preview__value {
      margin-top: 6px;
      color: var(--text-primary);
    }

    .queue-preview__sub {
      margin-top: 4px;
      color: var(--text-tertiary);
      font-size: 12px;
    }

    @media (max-width: 980px) {
      .queue-row {
        grid-template-columns: 1fr;
      }

      .queue-actions {
        justify-content: flex-start;
      }

      .queue-preview__grid {
        grid-template-columns: 1fr 1fr;
      }
    }

    @media (max-width: 640px) {
      .queue-preview__grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AdminPendingOrdersComponent implements OnInit {
  orders: Order[] = [];
  isLoading = true;
  error = '';
  expandedOrderId: number | null = null;
  skeletonRows = [0, 1, 2, 3];

  constructor(
    private adminService: AdminService,
    private toast: ToastService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.adminService.getPendingOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Failed to load pending orders.';
        this.isLoading = false;
      }
    });
  }

  toggleExpanded(id: number) {
    this.expandedOrderId = this.expandedOrderId === id ? null : id;
  }

  approve(order: Order, event?: MouseEvent) {
    event?.stopPropagation();
    this.adminService.approveOrder(order.id).subscribe({
      next: () => {
        this.orders = this.orders.filter(item => item.id !== order.id);
        this.expandedOrderId = null;
        this.toast.success('Order approved.');
      },
      error: () => this.toast.error('Failed to approve order')
    });
  }

  reject(order: Order, event?: MouseEvent) {
    event?.stopPropagation();
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Reject order',
        message: `Reject order #${order.id}?`,
        confirmLabel: 'Reject',
        confirmColor: 'warn',
        destructive: true
      }
    });

    ref.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.adminService.rejectOrder(order.id).subscribe({
        next: () => {
          this.orders = this.orders.filter(item => item.id !== order.id);
          this.expandedOrderId = null;
          this.toast.success('Order rejected.');
        },
        error: () => this.toast.error('Failed to reject order')
      });
    });
  }

  maskToken(value: string | undefined): string {
    if (!value) return 'Hidden';
    return value.length <= 6 ? 'Hidden' : `${value.slice(0, 4)}...${value.slice(-4)}`;
  }
}
