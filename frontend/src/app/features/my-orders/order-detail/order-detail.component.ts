import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { Order } from '../../../core/models/order.model';
import { OrderService } from '../../../core/services/order.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { StatusChipComponent } from '../../../shared/components/status-chip/status-chip.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { InrCurrencyPipe } from '../../../core/pipes/inr-currency.pipe';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { getCarPrimaryImage } from '../../../core/utils/car-images';

type StepState = 'done' | 'active' | 'upcoming' | 'danger';

export interface StepNode {
  label: string;
  sub?: string;
  state: StepState;
}

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatDialogModule,
    StatusChipComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    InrCurrencyPipe,
    ConfirmDialogComponent
  ],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.scss'
})
export class OrderDetailComponent implements OnInit {
  order: Order | null = null;
  isLoading = true;
  error = '';
  currentUsername = '';
  isApproving = false;
  isRejecting = false;

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private auth: AuthService,
    private toast: ToastService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.currentUsername = this.auth.getUsername() || '';
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.orderService.getOrderById(id).subscribe({
      next: (order) => { this.order = order; this.isLoading = false; },
      error: () => { this.error = 'Order not found.'; this.isLoading = false; }
    });
  }

  get isBuyer(): boolean { return this.order?.buyer?.username === this.currentUsername; }
  get isSeller(): boolean { return this.order?.seller?.username === this.currentUsername; }
  get canActAsSeller(): boolean { return this.isSeller && this.order?.status === 'PENDING_SELLER_APPROVAL'; }

  get steps(): StepNode[] {
    const status = this.order?.status;
    const nodes: StepNode[] = [
      { label: 'Order placed', sub: 'Payment processed', state: 'done' },
      { label: 'Admin approval', state: 'upcoming' },
      { label: 'Seller approval', state: 'upcoming' },
      { label: 'Completed', state: 'upcoming' },
    ];

    if (status === 'PENDING_ADMIN_APPROVAL') {
      nodes[1].state = 'active';
    } else if (status === 'PENDING_SELLER_APPROVAL') {
      nodes[1].state = 'done';
      nodes[2].state = 'active';
    } else if (status === 'APPROVED') {
      nodes[1].state = 'done';
      nodes[2].state = 'done';
      nodes[3].state = 'done';
    } else if (status === 'REJECTED') {
      nodes[1].state = 'done';
      nodes[2].state = 'danger';
      nodes[2].sub = 'Rejected';
    } else if (status === 'CANCELLED') {
      nodes[1].state = 'danger';
      nodes[1].sub = 'Cancelled';
    }

    return nodes;
  }

  get carThumb(): string {
    return this.order?.car ? getCarPrimaryImage(this.order.car) : '';
  }

  maskToken(token: string): string {
    if (!token || token.length <= 4) return token;
    return '****' + token.slice(-4);
  }

  approveSale() {
    if (!this.order) return;
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Approve sale',
        message: `Confirm you want to approve this sale. The car will be marked as sold.`,
        confirmLabel: 'Approve sale'
      }
    });
    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.isApproving = true;
      this.orderService.approveSale(this.order!.id).subscribe({
        next: () => { this.toast.success('Sale approved!'); this.isApproving = false; this.reloadOrder(); },
        error: () => { this.toast.error('Failed to approve sale'); this.isApproving = false; }
      });
    });
  }

  rejectSale() {
    if (!this.order) return;
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Reject sale',
        message: 'Are you sure you want to reject this sale?',
        confirmLabel: 'Reject sale',
        confirmColor: 'warn',
        destructive: true
      }
    });
    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.isRejecting = true;
      this.orderService.rejectSale(this.order!.id).subscribe({
        next: () => { this.toast.success('Sale rejected.'); this.isRejecting = false; this.reloadOrder(); },
        error: () => { this.toast.error('Failed to reject sale'); this.isRejecting = false; }
      });
    });
  }

  reloadOrder() {
    this.orderService.getOrderById(this.order!.id).subscribe({
      next: (order) => { this.order = order; }
    });
  }
}
