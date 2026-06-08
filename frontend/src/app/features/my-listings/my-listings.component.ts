import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Car } from '../../core/models/car.model';
import { CarService } from '../../core/services/car.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { StatusChipComponent } from '../../shared/components/status-chip/status-chip.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { InrCurrencyPipe } from '../../core/pipes/inr-currency.pipe';
import { getCarPrimaryImage } from '../../core/utils/car-images';

@Component({
  selector: 'app-my-listings',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatDialogModule,
    StatusChipComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ConfirmDialogComponent,
    InrCurrencyPipe
  ],
  templateUrl: './my-listings.component.html',
  styleUrl: './my-listings.component.scss'
})
export class MyListingsComponent implements OnInit {
  cars: Car[] = [];
  isLoading = true;
  error = '';
  activeFilter: 'all' | 'pending' | 'approved' | 'rejected' = 'all';
  readonly skeletonRows = Array.from({ length: 4 });

  constructor(
    private carService: CarService,
    private toast: ToastService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadCars();
  }

  loadCars() {
    this.isLoading = true;
    this.carService.getMyCars().subscribe({
      next: (cars) => { this.cars = cars; this.isLoading = false; },
      error: () => { this.error = 'Failed to load your listings.'; this.isLoading = false; }
    });
  }

  get pendingCars() { return this.cars.filter(c => c.approvalStatus === 'PENDING_ADMIN_APPROVAL'); }
  get approvedCars() { return this.cars.filter(c => c.approvalStatus === 'APPROVED'); }
  get rejectedCars() { return this.cars.filter(c => c.approvalStatus === 'REJECTED'); }

  private statusOrder(car: Car): number {
    if (car.approvalStatus === 'PENDING_ADMIN_APPROVAL') return 0;
    if (car.approvalStatus === 'REJECTED') return 2;
    return 1;
  }

  get filteredCars() {
    if (this.activeFilter === 'pending') return this.pendingCars;
    if (this.activeFilter === 'approved') return this.approvedCars;
    if (this.activeFilter === 'rejected') return this.rejectedCars;
    return [...this.cars].sort((a, b) => this.statusOrder(a) - this.statusOrder(b));
  }

  setFilter(filter: 'all' | 'pending' | 'approved' | 'rejected') {
    this.activeFilter = filter;
  }

  trackByCarId(_: number, car: Car) {
    return car.id;
  }

  carThumbnail(car: Car) {
    return getCarPrimaryImage(car);
  }

  deleteCar(car: Car) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete listing',
        message: `Delete ${car.make} ${car.model} ${car.year}? This cannot be undone.`,
        confirmLabel: 'Delete',
        confirmColor: 'warn',
        destructive: true
      }
    });
    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.cars = this.cars.filter(c => c.id !== car.id);
      this.carService.deleteCar(car.id).subscribe({
        next: () => this.toast.success('Listing deleted successfully'),
        error: () => {
          this.loadCars();
          this.toast.error('Failed to delete listing');
        }
      });
    });
  }
}
