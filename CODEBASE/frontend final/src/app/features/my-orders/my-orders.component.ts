import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Order } from '../../core/models/order.model';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { StatusChipComponent } from '../../shared/components/status-chip/status-chip.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { InrCurrencyPipe } from '../../core/pipes/inr-currency.pipe';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    StatusChipComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    InrCurrencyPipe
  ],
  templateUrl: './my-orders.component.html',
  styleUrl: './my-orders.component.scss'
})
export class MyOrdersComponent implements OnInit {
  orders: Order[] = [];
  isLoading = true;
  error = '';
  currentUsername = '';
  activeTab: 'all' | 'buying' | 'selling' = 'all';
  readonly skeletonRows = Array.from({ length: 4 });

  constructor(
    private orderService: OrderService,
    private auth: AuthService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.currentUsername = this.auth.getUsername() || '';
    this.loadOrders();
  }

  loadOrders() {
    this.isLoading = true;
    this.orderService.getMyOrders().subscribe({
      next: (orders) => { this.orders = orders; this.isLoading = false; },
      error: () => { this.error = 'Failed to load orders.'; this.isLoading = false; }
    });
  }

  get buyerOrders() { return this.orders.filter(o => o.buyer?.username === this.currentUsername); }
  get sellerOrders() { return this.orders.filter(o => o.seller?.username === this.currentUsername); }

  get filteredOrders() {
    if (this.activeTab === 'buying') return this.buyerOrders;
    if (this.activeTab === 'selling') return this.sellerOrders;
    return this.orders;
  }

  setTab(tab: 'all' | 'buying' | 'selling') { this.activeTab = tab; }

  orderThumb(order: Order): string {
    const car = order.car;
    return `https://picsum.photos/seed/${encodeURIComponent(`${car?.make || 'car'}-${car?.model || ''}-${order.id}`)}/96/96`;
  }

  trackByOrderId(_: number, order: Order) { return order.id; }
}
