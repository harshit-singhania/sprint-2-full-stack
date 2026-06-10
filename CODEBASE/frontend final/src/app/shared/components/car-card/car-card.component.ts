import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Car } from '../../../core/models/car.model';
import { InrCurrencyPipe } from '../../../core/pipes/inr-currency.pipe';
import { StatusChipComponent } from '../status-chip/status-chip.component';
import { getCarPrimaryImage } from '../../../core/utils/car-images';

@Component({
  selector: 'app-car-card',
  standalone: true,
  imports: [CommonModule, RouterModule, InrCurrencyPipe, StatusChipComponent],
  template: `
    <a class="surface-card car-card" [routerLink]="['/cars', car.id]">
      <!-- Image wrapper with hover zoom -->
      <div class="car-card__img-wrap">
        <img
          class="car-card__img"
          [src]="carImage"
          [alt]="car.make + ' ' + car.model"
          loading="lazy"
        />

        <!-- Wishlist heart (Phosphor) -->
        <button
          class="car-card__heart"
          [class.saved]="inWishlist"
          (click)="toggleWishlistClick($event)"
          aria-label="Save to wishlist"
          type="button"
        >
          <i class="ph ph-heart"></i>
        </button>
      </div>

      <!-- Card body -->
      <div class="car-card__body">
        <div class="h3 car-card__title">{{ car.make }} {{ car.model }}</div>
        <div class="car-card__meta">
          <span class="mono">{{ car.year }}</span>
          &middot;
          <span class="mono">{{ car.mileage | number }} km</span>
        </div>
        <div class="car-card__footer">
          <div class="mono car-card__price">{{ car.price | inrCurrency }}</div>
          <app-status-chip *ngIf="showStatus" [status]="car.approvalStatus"></app-status-chip>
        </div>
      </div>
    </a>
  `,
  styles: [`
    /* Root: anchor, entire card is a link */
    .car-card {
      display: flex;
      flex-direction: column;
      height: 100%;
      text-decoration: none;
      color: inherit;
      overflow: hidden;
      transition: transform var(--dur) var(--ease), background var(--dur) var(--ease);

      &:hover {
        transform: translateY(-2px);
        background: var(--surface-2);

        .car-card__img {
          transform: scale(1.03);
        }
      }
    }

    /* Image area */
    .car-card__img-wrap {
      position: relative;
      overflow: hidden;
      width: 100%;
    }

    .car-card__img {
      display: block;
      width: 100%;
      aspect-ratio: 16/11;
      object-fit: cover;
      object-position: center;
      transition: transform var(--dur) var(--ease);
      image-rendering: -webkit-optimize-contrast;
    }

    /* Wishlist heart */
    .car-card__heart {
      position: absolute;
      top: 10px;
      right: 10px;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(11,11,15,0.55);
      backdrop-filter: blur(8px);
      border: 1px solid var(--hairline);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      transition: transform 150ms var(--ease), background 150ms var(--ease);

      i {
        font-size: 18px;
        color: var(--text-secondary);
        line-height: 1;
      }

      &.saved i {
        color: var(--danger);
      }

      &:hover {
        transform: scale(1.12);
        background: rgba(11,11,15,0.75);
      }

      &:active {
        transform: scale(0.92);
      }
    }

    /* Body */
    .car-card__body {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      flex: 1;
    }

    .car-card__title {
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .car-card__meta {
      color: var(--text-secondary);
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .car-card__footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 4px;
    }

    .car-card__price {
      font-size: 20px;
      color: var(--text-primary);
    }
  `]
})
export class CarCardComponent {
  @Input() car!: Car;
  @Input() inWishlist = false;
  @Input() showStatus = false;
  @Output() wishlistToggle = new EventEmitter<Car>();

  get carImage(): string {
    return getCarPrimaryImage(this.car);
  }

  toggleWishlistClick(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.wishlistToggle.emit(this.car);
  }
}
