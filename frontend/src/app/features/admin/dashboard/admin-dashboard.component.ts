import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AdminDashboardSummary, AdminService } from '../../../core/services/admin.service';
import { Car } from '../../../core/models/car.model';
import { Order } from '../../../core/models/order.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { MatDialog } from '@angular/material/dialog';
import { StatusChipComponent } from '../../../shared/components/status-chip/status-chip.component';
import { InrCurrencyPipe } from '../../../core/pipes/inr-currency.pipe';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ConfirmDialogComponent,
    StatusChipComponent,
    InrCurrencyPipe
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  dashboard: AdminDashboardSummary | null = null;
  pendingCars: Car[] = [];
  pendingOrders: Order[] = [];
  isLoading = true;
  error = '';
  private readonly revenueFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  });

  constructor(
    private adminService: AdminService,
    private toast: ToastService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    this.isLoading = true;
    this.error = '';

    forkJoin({
      dashboard: this.adminService.getDashboard(),
      cars: this.adminService.getPendingCars(),
      orders: this.adminService.getPendingOrders()
    }).subscribe({
      next: ({ dashboard, cars, orders }) => {
        this.dashboard = dashboard;
        this.pendingCars = cars.slice(0, 3);
        this.pendingOrders = orders.slice(0, 3);
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Failed to load dashboard data.';
        this.isLoading = false;
      }
    });
  }

  approveCar(car: Car) {
    this.adminService.approveCar(car.id).subscribe({
      next: () => {
        this.pendingCars = this.pendingCars.filter(item => item.id !== car.id);
        this.toast.success('Car approved.');
        this.loadDashboard();
      },
      error: () => this.toast.error('Failed to approve car')
    });
  }

  rejectCar(car: Car) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Reject listing',
        message: `Reject ${car.make} ${car.model} ${car.year}?`,
        confirmLabel: 'Reject',
        confirmColor: 'warn',
        destructive: true
      }
    });

    ref.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.adminService.rejectCar(car.id).subscribe({
        next: () => {
          this.pendingCars = this.pendingCars.filter(item => item.id !== car.id);
          this.toast.success('Car rejected.');
          this.loadDashboard();
        },
        error: () => this.toast.error('Failed to reject car')
      });
    });
  }

  approveOrder(order: Order) {
    this.adminService.approveOrder(order.id).subscribe({
      next: () => {
        this.pendingOrders = this.pendingOrders.filter(item => item.id !== order.id);
        this.toast.success('Order approved.');
        this.loadDashboard();
      },
      error: () => this.toast.error('Failed to approve order')
    });
  }

  rejectOrder(order: Order) {
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
          this.pendingOrders = this.pendingOrders.filter(item => item.id !== order.id);
          this.toast.success('Order rejected.');
          this.loadDashboard();
        },
        error: () => this.toast.error('Failed to reject order')
      });
    });
  }

  formatRevenue(value: number | string | undefined | null): string {
    const amount = typeof value === 'string' ? Number(value) : value ?? 0;
    if (!Number.isFinite(amount)) return '₹0';
    return this.revenueFormatter.format(amount);
  }

  carPhotoSeed(car: Car): string {
    return `https://picsum.photos/seed/${encodeURIComponent(`${car.make}-${car.model}-${car.id}`)}/240/180`;
  }
}
