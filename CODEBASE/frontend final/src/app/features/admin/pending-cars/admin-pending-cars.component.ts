import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { Car } from '../../../core/models/car.model';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { InrCurrencyPipe } from '../../../core/pipes/inr-currency.pipe';

@Component({
  selector: 'app-admin-pending-cars',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, EmptyStateComponent, ConfirmDialogComponent, InrCurrencyPipe],
  template: `
    <div class="pending-page">
      <div class="page-head">
        <div>
          <div class="eyebrow mono">Review queue</div>
          <h1 class="page-heading">Pending cars</h1>
          <p class="body page-intro">Review new listings before they appear on the marketplace.</p>
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
          title="Could not load pending cars"
          message="Try again in a moment."
        ></app-empty-state>

        <ng-container *ngIf="!error">
          <app-empty-state
            *ngIf="cars.length === 0"
            icon="ph ph-check-circle"
            title="No cars awaiting approval"
            message="Everything in the queue has been handled."
          ></app-empty-state>

          <div *ngIf="cars.length > 0" class="queue-list">
            <article
              class="surface-card queue-row"
              *ngFor="let car of cars"
              (click)="toggleExpanded(car.id)"
            >
              <div class="queue-copy">
                <div class="queue-title h3">{{ car.year }} {{ car.make }} {{ car.model }}</div>
                <div class="queue-meta">
                  <span class="mono">{{ car.price | inrCurrency }}</span>
                  <span class="mono">{{ car.mileage | number }} km</span>
                  <span class="mono">{{ car.color }}</span>
                </div>
                <div class="queue-meta queue-meta--secondary">
                  <span class="mono">Seller: {{ car.seller?.username }}</span>
                </div>
              </div>

              <div class="queue-actions" (click)="$event.stopPropagation()">
                <button class="btn btn-primary queue-action" type="button" (click)="approve(car, $event)">Approve</button>
                <button class="btn btn-ghost queue-action queue-action--danger" type="button" (click)="reject(car, $event)">Reject</button>
              </div>

              <div class="queue-preview" *ngIf="expandedId === car.id">
                <div class="queue-preview__grid">
                  <div>
                    <div class="eyebrow mono">Seller</div>
                    <div class="queue-preview__value mono">{{ car.seller?.username }}</div>
                    <div class="queue-preview__sub mono">{{ car.seller?.phoneNumber }}</div>
                  </div>
                  <div>
                    <div class="eyebrow mono">Price</div>
                    <div class="queue-preview__value mono">{{ car.price | inrCurrency }}</div>
                  </div>
                  <div>
                    <div class="eyebrow mono">Mileage</div>
                    <div class="queue-preview__value mono">{{ car.mileage | number }} km</div>
                  </div>
                  <div>
                    <div class="eyebrow mono">Color</div>
                    <div class="queue-preview__value">{{ car.color }}</div>
                  </div>
                  <div *ngIf="car.description">
                    <div class="eyebrow mono">Description</div>
                    <div class="queue-preview__value">{{ car.description }}</div>
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
    .pending-page { display: flex; flex-direction: column; gap: 20px; padding-bottom: 24px; }
    .page-head { display: flex; justify-content: space-between; gap: 16px; align-items: flex-end; flex-wrap: wrap; }
    .page-intro { margin: 0; }
    .queue-skeletons { display: flex; flex-direction: column; gap: 12px; }
    .queue-skeleton { padding: 4px 16px; }
    .queue-list { display: flex; flex-direction: column; gap: 12px; }
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
    .queue-row:hover { background: var(--surface-2); transform: translateY(-1px); }
    .queue-copy { min-width: 0; }
    .queue-title { margin: 0; }
    .queue-meta { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 8px; color: var(--text-secondary); }
    .queue-meta--secondary { color: var(--text-tertiary); }
    .queue-actions { display: flex; gap: 10px; flex-wrap: wrap; justify-content: flex-end; flex-shrink: 0; }
    .queue-action { min-width: 96px; }
    .queue-action--danger { color: var(--danger); }
    .queue-action--danger:hover { background: rgba(255,69,58,0.08); border-color: rgba(255,69,58,0.22); }
    .queue-preview { grid-column: 1 / -1; margin-top: 6px; padding-top: 18px; border-top: 1px solid var(--hairline); }
    .queue-preview__grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
    .queue-preview__value { margin-top: 6px; color: var(--text-primary); }
    .queue-preview__sub { margin-top: 4px; color: var(--text-tertiary); font-size: 12px; }
    @media (max-width: 980px) {
      .queue-row { grid-template-columns: 1fr; }
      .queue-actions { justify-content: flex-start; }
      .queue-preview__grid { grid-template-columns: 1fr 1fr; }
    }
    @media (max-width: 640px) { .queue-preview__grid { grid-template-columns: 1fr; } }
  `]
})
export class AdminPendingCarsComponent implements OnInit {
  cars: Car[] = [];
  isLoading = true;
  error = '';
  expandedId: number | null = null;
  skeletonRows = [0, 1, 2, 3];

  constructor(
    private adminService: AdminService,
    private toast: ToastService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.adminService.getPendingCars().subscribe({
      next: (cars) => { this.cars = cars; this.isLoading = false; },
      error: () => { this.error = 'Failed to load pending cars.'; this.isLoading = false; }
    });
  }

  toggleExpanded(id: number) {
    this.expandedId = this.expandedId === id ? null : id;
  }

  approve(car: Car, event?: MouseEvent) {
    event?.stopPropagation();
    this.adminService.approveCar(car.id).subscribe({
      next: () => {
        this.cars = this.cars.filter(c => c.id !== car.id);
        this.expandedId = null;
        this.toast.success('Car approved.');
      },
      error: () => this.toast.error('Failed to approve car')
    });
  }

  reject(car: Car, event?: MouseEvent) {
    event?.stopPropagation();
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Reject listing',
        message: `Reject ${car.year} ${car.make} ${car.model}?`,
        confirmLabel: 'Reject',
        confirmColor: 'warn',
        destructive: true
      }
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.adminService.rejectCar(car.id).subscribe({
        next: () => {
          this.cars = this.cars.filter(c => c.id !== car.id);
          this.expandedId = null;
          this.toast.success('Car rejected.');
        },
        error: () => this.toast.error('Failed to reject car')
      });
    });
  }
}
