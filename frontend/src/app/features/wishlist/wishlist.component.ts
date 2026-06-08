import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Car } from '../../core/models/car.model';
import { WishlistService } from '../../core/services/wishlist.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { CarCardComponent } from '../../shared/components/car-card/car-card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CarCardComponent,
    EmptyStateComponent,
    LoadingSpinnerComponent
  ],
  template: `
    <div class="wishlist-page">
      <div class="wishlist-header">
        <h2 class="h2">Saved cars</h2>
        <span class="mono count-pill" *ngIf="!isLoading && cars.length > 0">{{cars.length}}</span>
      </div>

      <app-loading-spinner *ngIf="isLoading" variant="card"></app-loading-spinner>

      <ng-container *ngIf="!isLoading">
        <app-empty-state
          *ngIf="error"
          icon="ph ph-warning-circle"
          [heading]="'Error'"
          [body]="error"
        ></app-empty-state>

        <ng-container *ngIf="!error">
          <app-empty-state
            *ngIf="cars.length === 0"
            icon="ph ph-heart"
            heading="Nothing saved yet"
            body="Tap the heart on a car and it lands here."
            ctaLabel="Browse cars"
            ctaRoute="/browse"
          ></app-empty-state>

          <div class="car-grid" *ngIf="cars.length > 0">
            <div class="car-card-wrap"
                 *ngFor="let car of cars"
                 [class.removing]="removingIds.has(car.id)">
              <app-car-card
                [car]="car"
                [inWishlist]="true"
                (wishlistToggle)="removeFromWishlist($event)"
              ></app-car-card>
            </div>
          </div>
        </ng-container>
      </ng-container>
    </div>
  `,
  styles: [`
    .wishlist-page {
      max-width: 1400px;
      margin: 0 auto;
      padding: 28px 24px 80px;
      @media (max-width: 600px) { padding: 16px 16px 60px; }
    }
    .wishlist-header {
      display: flex;
      align-items: baseline;
      gap: 12px;
      margin-bottom: 28px;
    }
    .count-pill {
      font-size: 13px;
      color: var(--accent);
      background: var(--accent-wash);
      padding: 2px 10px;
      border-radius: 20px;
    }
    .car-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 24px;
    }
    .car-card-wrap { transition: opacity 300ms, transform 300ms; }
    .car-card-wrap.removing { opacity: 0; transform: scale(0.95); }
  `]
})
export class WishlistComponent implements OnInit {
  cars: Car[] = [];
  removingIds = new Set<number>();
  isLoading = true;
  error = '';

  constructor(private wishlistService: WishlistService, private toast: ToastService) {}

  ngOnInit() {
    this.wishlistService.getWishlist().subscribe({
      next: (cars) => { this.cars = cars; this.isLoading = false; },
      error: () => { this.error = 'Failed to load wishlist.'; this.isLoading = false; }
    });
  }

  removeFromWishlist(car: Car) {
    this.removingIds.add(car.id);
    setTimeout(() => {
      this.cars = this.cars.filter(c => c.id !== car.id);
      this.removingIds.delete(car.id);
    }, 280);

    this.wishlistService.removeFromWishlist(car.id).subscribe({
      next: () => this.toast.success('Removed from wishlist'),
      error: () => {
        this.removingIds.delete(car.id);
        this.cars = [...this.cars, car];
        this.toast.error('Failed to remove from wishlist');
      }
    });
  }
}
