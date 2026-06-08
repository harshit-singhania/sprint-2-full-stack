import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { Car } from '../../core/models/car.model';
import { CompareService } from './compare.service';
import { getCarPrimaryImage } from '../../core/utils/car-images';
import { InrCurrencyPipe } from '../../core/pipes/inr-currency.pipe';

interface SpecRow {
  label: string;
  key: keyof Car;
  better: 'lower' | 'higher';
  format?: (v: unknown) => string;
}

const SPEC_GROUPS: SpecRow[][] = [
  [
    { label: 'Price', key: 'price', better: 'lower', format: v => `₹${(Number(v) / 100000).toFixed(1)}L` },
    { label: 'Mileage', key: 'mileage', better: 'lower', format: v => `${Number(v).toLocaleString('en-IN')} km` },
  ],
  [
    { label: 'Year', key: 'year', better: 'higher' },
    { label: 'Color', key: 'color', better: 'higher' },
    { label: 'Views', key: 'viewCount', better: 'higher' },
  ]
];

@Component({
  selector: 'app-compare',
  standalone: true,
  imports: [CommonModule, RouterModule, InrCurrencyPipe],
  template: `
    <div class="compare-page">
      <a routerLink="/browse" class="back-link">
        <i class="ph ph-arrow-left"></i> Back to browse
      </a>
      <h1 class="h2" style="margin-bottom: 32px;">Compare cars</h1>

      <div class="compare-empty" *ngIf="cars.length === 0">
        <i class="ph ph-scales compare-icon"></i>
        <p class="h3">Add two cars to compare.</p>
        <a routerLink="/browse" class="btn btn-primary">Browse cars</a>
      </div>

      <div class="compare-empty" *ngIf="cars.length === 1">
        <i class="ph ph-plus-circle compare-icon"></i>
        <p class="h3">Add a second car to compare.</p>
        <p class="body" style="color: var(--text-secondary);">
          <span class="mono">{{cars[0].make}} {{cars[0].model}}</span> is waiting.
        </p>
        <a routerLink="/browse" class="btn btn-primary">Add another</a>
      </div>

      <div class="compare-layout" *ngIf="cars.length === 2">
        <!-- Car headers -->
        <div class="compare-grid compare-header-row">
          <div class="spec-label-col"></div>
          <div class="car-col surface-card" *ngFor="let car of cars">
            <img class="compare-img" [src]="carImage(car)" [alt]="car.make + ' ' + car.model">
            <h3 class="compare-car-title">
              <span class="mono">{{car.year}}</span> {{car.make}} {{car.model}}
            </h3>
            <p class="compare-price mono">{{car.price | inrCurrency}}</p>
            <button class="btn btn-ghost btn-sm" type="button" (click)="compareService.remove(car.id)">
              <i class="ph ph-x"></i> Remove
            </button>
          </div>
        </div>

        <!-- Spec groups -->
        <ng-container *ngFor="let group of specGroups; let gi = index">
          <div class="spec-group-sep" *ngIf="gi > 0"></div>
          <div class="compare-grid spec-row" *ngFor="let spec of group">
            <div class="spec-label-col">{{spec.label}}</div>
            <div class="spec-val-col mono"
                 *ngFor="let car of cars; let ci = index"
                 [class.spec-better]="isBetter(ci, spec)">
              <i class="ph ph-caret-up" *ngIf="isBetter(ci, spec)"></i>
              {{formatSpec(car, spec)}}
            </div>
          </div>
        </ng-container>
      </div>
    </div>
  `,
  styles: [`
    .compare-page { max-width: 900px; margin: 0 auto; padding: 32px 24px 120px; }
    .back-link {
      display: inline-flex; align-items: center; gap: 6px;
      color: var(--text-secondary); text-decoration: none; font-size: 14px; margin-bottom: 12px;
      &:hover { color: var(--text-primary); }
    }
    .compare-empty {
      text-align: center; padding: 80px 24px;
      display: flex; flex-direction: column; align-items: center; gap: 16px;
    }
    .compare-icon { font-size: 48px; color: var(--text-tertiary); }
    .compare-grid {
      display: grid;
      grid-template-columns: 160px 1fr 1fr;
      gap: 16px;
      @media (max-width: 600px) { grid-template-columns: 100px 1fr 1fr; }
    }
    .compare-header-row { margin-bottom: 24px; }
    .car-col {
      padding: 20px; border-radius: var(--radius-card);
      display: flex; flex-direction: column; align-items: center; gap: 8px; text-align: center;
    }
    .compare-img { width: 100%; aspect-ratio: 16/9; object-fit: cover; border-radius: 8px; }
    .compare-car-title { font-size: 15px; font-weight: 600; margin: 0; }
    .compare-price { font-size: 18px; font-weight: 700; color: var(--accent); margin: 0; }
    .spec-row { padding: 10px 0; align-items: center; }
    .spec-label-col { font-size: 13px; color: var(--text-secondary); }
    .spec-val-col {
      font-size: 15px; color: var(--text-primary);
      display: flex; align-items: center; gap: 4px;
      i { font-size: 11px; }
    }
    .spec-better { color: var(--accent); }
    .spec-group-sep { height: 1px; background: var(--hairline); margin: 8px 0; }
    .btn-sm { font-size: 12px; padding: 6px 12px; }
    .compare-layout { display: flex; flex-direction: column; }
  `]
})
export class CompareComponent implements OnInit, OnDestroy {
  readonly specGroups = SPEC_GROUPS;
  cars: Car[] = [];
  private sub!: Subscription;

  constructor(public compareService: CompareService) {}

  ngOnInit() {
    this.sub = this.compareService.cars$.subscribe(cars => this.cars = cars);
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  carImage(car: Car): string {
    return getCarPrimaryImage(car);
  }

  isBetter(carIndex: number, spec: SpecRow): boolean {
    if (this.cars.length < 2) return false;
    const a = this.cars[0][spec.key] as number;
    const b = this.cars[1][spec.key] as number;
    if (typeof a !== 'number' || typeof b !== 'number') return false;
    if (spec.better === 'lower') return carIndex === 0 ? a < b : b < a;
    return carIndex === 0 ? a > b : b > a;
  }

  formatSpec(car: Car, spec: SpecRow): string {
    const val = car[spec.key];
    return spec.format ? spec.format(val) : String(val ?? '—');
  }
}
