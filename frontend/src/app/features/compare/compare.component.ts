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
  isColor?: boolean;
}

interface SpecGroup {
  title: string;
  icon: string;
  rows: SpecRow[];
}

const SPEC_GROUPS: SpecGroup[] = [
  {
    title: 'Value',
    icon: 'ph-tag',
    rows: [
      { label: 'Asking Price', key: 'price', better: 'lower', format: v => `₹${(Number(v) / 100000).toFixed(1)}L` },
    ]
  },
  {
    title: 'Condition',
    icon: 'ph-speedometer',
    rows: [
      { label: 'Odometer', key: 'mileage', better: 'lower', format: v => `${Number(v).toLocaleString('en-IN')} km` },
      { label: 'Model Year', key: 'year', better: 'higher' },
    ]
  },
  {
    title: 'Details',
    icon: 'ph-info',
    rows: [
      { label: 'Colour', key: 'color', better: 'higher', isColor: true },
      { label: 'Listing Views', key: 'viewCount', better: 'higher' },
    ]
  }
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

      <!-- Empty states -->
      <div class="compare-empty" *ngIf="cars.length === 0">
        <div class="empty-icon-wrap"><i class="ph ph-scales"></i></div>
        <h2 class="empty-title">Pick two cars to compare</h2>
        <p class="empty-sub">Browse listings and tap "Compare" on any car to add it here.</p>
        <a routerLink="/browse" class="btn btn-primary">Browse cars</a>
      </div>

      <div class="compare-empty" *ngIf="cars.length === 1">
        <div class="empty-icon-wrap"><i class="ph ph-plus-circle"></i></div>
        <h2 class="empty-title">Add one more car</h2>
        <p class="empty-sub">
          <strong>{{cars[0].year}} {{cars[0].make}} {{cars[0].model}}</strong> is ready to compare.
        </p>
        <a routerLink="/browse" class="btn btn-primary">Find a second car</a>
      </div>

      <!-- Main comparison layout -->
      <div class="compare-layout" *ngIf="cars.length === 2">

        <!-- Hero cards row -->
        <div class="hero-row">
          <div class="hero-card" *ngFor="let car of cars; let ci = index">
            <div class="hero-img-wrap">
              <img class="hero-img" [src]="carImage(car)" [alt]="car.make + ' ' + car.model">
              <div class="hero-img-gradient"></div>
              <div class="hero-badge" [class.hero-badge--left]="ci === 0" [class.hero-badge--right]="ci === 1">
                {{ci === 0 ? 'Car A' : 'Car B'}}
              </div>
            </div>
            <div class="hero-info">
              <div class="hero-meta">{{car.year}} · {{car.make}}</div>
              <h2 class="hero-name">{{car.model}}</h2>
              <div class="hero-price">{{car.price | inrCurrency}}</div>
              <div class="hero-actions">
                <a class="btn btn-primary btn-sm" [routerLink]="['/cars', car.id]">View listing</a>
                <button class="btn btn-ghost btn-sm remove-btn" type="button" (click)="compareService.remove(car.id)">
                  <i class="ph ph-trash"></i> Remove
                </button>
              </div>
            </div>
          </div>

          <!-- VS badge -->
          <div class="vs-badge">VS</div>
        </div>

        <!-- Spec groups -->
        <div class="spec-table">
          <ng-container *ngFor="let group of specGroups">
            <div class="spec-section-header">
              <i class="ph {{group.icon}}"></i>
              {{group.title}}
            </div>

            <div class="spec-row" *ngFor="let spec of group.rows; let ri = index"
                 [class.spec-row--alt]="ri % 2 === 1">
              <div class="spec-label">{{spec.label}}</div>

              <div class="spec-cells">
                <div class="spec-cell"
                     *ngFor="let car of cars; let ci = index"
                     [class.spec-cell--winner]="isBetter(ci, spec)"
                     [class.spec-cell--loser]="isWorse(ci, spec)">

                  <!-- Color swatch -->
                  <ng-container *ngIf="spec.isColor; else numericCell">
                    <span class="color-swatch" [style.background]="colorToHex(car[spec.key])"></span>
                    <span class="spec-val">{{formatSpec(car, spec)}}</span>
                  </ng-container>

                  <ng-template #numericCell>
                    <div class="spec-val-wrap">
                      <span class="spec-val" [class.spec-val--winner]="isBetter(ci, spec)">
                        {{formatSpec(car, spec)}}
                      </span>
                      <span class="winner-chip" *ngIf="isBetter(ci, spec)">
                        <i class="ph ph-check-circle-fill"></i> Better
                      </span>
                    </div>
                    <!-- Progress bar for numeric fields -->
                    <div class="spec-bar-wrap" *ngIf="isNumericSpec(spec)">
                      <div class="spec-bar"
                           [style.width.%]="getBarWidth(ci, spec)"
                           [class.spec-bar--winner]="isBetter(ci, spec)"
                           [class.spec-bar--loser]="isWorse(ci, spec)">
                      </div>
                    </div>
                  </ng-template>

                </div>
              </div>
            </div>
          </ng-container>
        </div>

        <!-- Summary verdict -->
        <div class="verdict-row">
          <div class="verdict-label">Overall score</div>
          <div class="verdict-cells">
            <div class="verdict-cell" *ngFor="let car of cars; let ci = index">
              <div class="verdict-score">{{getWinCount(ci)}}<span>/{{totalRows}}</span></div>
              <div class="verdict-tag" [class.verdict-tag--lead]="getWinCount(ci) > getWinCount(1 - ci)">
                {{getWinCount(ci) > getWinCount(1 - ci) ? 'Recommended' : getWinCount(ci) === getWinCount(1 - ci) ? 'Tied' : 'Runner-up'}}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .compare-page {
      max-width: 960px;
      margin: 0 auto;
      padding: 28px 20px 140px;
    }

    .back-link {
      display: inline-flex; align-items: center; gap: 6px;
      color: var(--text-secondary); text-decoration: none; font-size: 13px;
      margin-bottom: 28px; letter-spacing: 0.02em;
      transition: color 0.15s;
      &:hover { color: var(--text-primary); }
    }

    /* ── Empty states ── */
    .compare-empty {
      text-align: center; padding: 100px 24px;
      display: flex; flex-direction: column; align-items: center; gap: 16px;
    }
    .empty-icon-wrap {
      width: 72px; height: 72px; border-radius: 50%;
      background: var(--surface-1);
      display: flex; align-items: center; justify-content: center;
      font-size: 32px; color: var(--text-tertiary);
      margin-bottom: 8px;
    }
    .empty-title { font-size: 22px; font-weight: 700; margin: 0; }
    .empty-sub { font-size: 14px; color: var(--text-secondary); margin: 0; max-width: 320px; line-height: 1.6; }

    /* ── Hero cards ── */
    .hero-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      position: relative;
      margin-bottom: 8px;
    }

    .hero-card {
      border-radius: 16px;
      overflow: hidden;
      background: var(--surface-card);
      border: 1px solid var(--hairline);
      transition: transform 0.2s;
      &:hover { transform: translateY(-2px); }
    }

    .hero-img-wrap {
      position: relative;
      aspect-ratio: 4/3;
      overflow: hidden;
    }

    .hero-img {
      width: 100%; height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 0.4s ease;
      .hero-card:hover & { transform: scale(1.03); }
    }

    .hero-img-gradient {
      position: absolute; inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%);
      pointer-events: none;
    }

    .hero-badge {
      position: absolute; top: 12px;
      background: rgba(0,0,0,0.6);
      backdrop-filter: blur(8px);
      color: #fff;
      font-size: 11px; font-weight: 700; letter-spacing: 0.08em;
      padding: 4px 10px; border-radius: 100px;
      text-transform: uppercase;
    }
    .hero-badge--left { left: 12px; }
    .hero-badge--right { right: 12px; }

    .hero-info {
      padding: 16px 20px 20px;
      display: flex; flex-direction: column; gap: 4px;
    }

    .hero-meta {
      font-size: 12px; color: var(--text-tertiary);
      letter-spacing: 0.04em; text-transform: uppercase; font-weight: 500;
    }

    .hero-name {
      font-size: 20px; font-weight: 700; margin: 0;
      line-height: 1.2;
    }

    .hero-price {
      font-size: 22px; font-weight: 800;
      color: var(--accent);
      letter-spacing: -0.02em;
      margin: 4px 0 12px;
    }

    .hero-actions {
      display: flex; gap: 8px; flex-wrap: wrap;
    }

    .btn-sm { font-size: 12px; padding: 7px 14px; }

    .remove-btn {
      color: var(--text-tertiary);
      &:hover { color: #ff4444; }
    }

    /* VS badge */
    .vs-badge {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 40px; height: 40px;
      background: var(--surface-card);
      border: 2px solid var(--hairline);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 900;
      color: var(--text-secondary);
      letter-spacing: 0.05em;
      z-index: 2;
      box-shadow: 0 2px 12px rgba(0,0,0,0.3);
    }

    /* ── Spec table ── */
    .spec-table {
      border: 1px solid var(--hairline);
      border-radius: 16px;
      overflow: hidden;
      margin-top: 20px;
    }

    .spec-section-header {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 20px;
      background: var(--surface-1);
      font-size: 11px; font-weight: 700;
      letter-spacing: 0.1em; text-transform: uppercase;
      color: var(--text-secondary);
      border-bottom: 1px solid var(--hairline);
      i { font-size: 14px; }
    }

    .spec-row {
      display: grid;
      grid-template-columns: 140px 1fr;
      border-bottom: 1px solid var(--hairline);
      &:last-child { border-bottom: none; }
      &.spec-row--alt { background: rgba(255,255,255,0.015); }
    }

    .spec-label {
      display: flex; align-items: center;
      padding: 16px 20px;
      font-size: 13px; color: var(--text-secondary);
      font-weight: 500;
      border-right: 1px solid var(--hairline);
    }

    .spec-cells {
      display: grid;
      grid-template-columns: 1fr 1fr;
    }

    .spec-cell {
      padding: 16px 20px;
      display: flex; flex-direction: column; gap: 8px;
      border-right: 1px solid var(--hairline);
      transition: background 0.2s;
      &:last-child { border-right: none; }
      &.spec-cell--winner { background: rgba(14, 165, 90, 0.06); }
      &.spec-cell--loser { background: transparent; }
    }

    .spec-val-wrap {
      display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
    }

    .spec-val {
      font-size: 16px; font-weight: 600; color: var(--text-primary);
      &.spec-val--winner { color: #0ea55a; }
    }

    .winner-chip {
      display: inline-flex; align-items: center; gap: 4px;
      font-size: 11px; font-weight: 700;
      color: #0ea55a;
      background: rgba(14, 165, 90, 0.12);
      padding: 3px 8px; border-radius: 100px;
      letter-spacing: 0.02em;
      i { font-size: 12px; }
    }

    /* Progress bar */
    .spec-bar-wrap {
      height: 4px;
      background: var(--hairline);
      border-radius: 100px;
      overflow: hidden;
    }

    .spec-bar {
      height: 100%; border-radius: 100px;
      transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      background: var(--text-tertiary);
      &.spec-bar--winner { background: #0ea55a; }
      &.spec-bar--loser { background: var(--text-tertiary); opacity: 0.5; }
    }

    /* Color swatch */
    .color-swatch {
      width: 18px; height: 18px; border-radius: 50%;
      border: 2px solid var(--hairline);
      flex-shrink: 0;
      display: inline-block;
    }

    /* ── Verdict ── */
    .verdict-row {
      display: grid;
      grid-template-columns: 140px 1fr;
      margin-top: 20px;
      border: 1px solid var(--hairline);
      border-radius: 16px;
      overflow: hidden;
    }

    .verdict-label {
      display: flex; align-items: center;
      padding: 20px;
      font-size: 12px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.08em;
      color: var(--text-secondary);
      background: var(--surface-1);
      border-right: 1px solid var(--hairline);
    }

    .verdict-cells {
      display: grid;
      grid-template-columns: 1fr 1fr;
    }

    .verdict-cell {
      padding: 20px;
      display: flex; flex-direction: column; gap: 6px;
      border-right: 1px solid var(--hairline);
      &:last-child { border-right: none; }
    }

    .verdict-score {
      font-size: 28px; font-weight: 800; line-height: 1;
      color: var(--text-primary);
      span { font-size: 14px; font-weight: 400; color: var(--text-tertiary); }
    }

    .verdict-tag {
      font-size: 12px; font-weight: 600;
      color: var(--text-secondary);
      &.verdict-tag--lead {
        color: #0ea55a;
      }
    }

    /* ── Responsive ── */
    @media (max-width: 600px) {
      .hero-row { grid-template-columns: 1fr 1fr; gap: 10px; }
      .hero-name { font-size: 15px; }
      .hero-price { font-size: 16px; }
      .spec-row { grid-template-columns: 90px 1fr; }
      .spec-label { padding: 12px; font-size: 11px; }
      .spec-cell { padding: 12px; }
      .spec-val { font-size: 13px; }
      .verdict-score { font-size: 22px; }
    }
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

  get totalRows(): number {
    return SPEC_GROUPS.reduce((sum, g) => sum + g.rows.length, 0);
  }

  carImage(car: Car): string {
    return getCarPrimaryImage(car);
  }

  isBetter(carIndex: number, spec: SpecRow): boolean {
    if (this.cars.length < 2) return false;
    const a = this.cars[0][spec.key] as number;
    const b = this.cars[1][spec.key] as number;
    if (typeof a !== 'number' || typeof b !== 'number') return false;
    if (a === b) return false;
    if (spec.better === 'lower') return carIndex === 0 ? a < b : b < a;
    return carIndex === 0 ? a > b : b > a;
  }

  isWorse(carIndex: number, spec: SpecRow): boolean {
    if (this.cars.length < 2) return false;
    const other = 1 - carIndex;
    return this.isBetter(other, spec);
  }

  isNumericSpec(spec: SpecRow): boolean {
    if (this.cars.length < 2) return false;
    return typeof this.cars[0][spec.key] === 'number';
  }

  getBarWidth(carIndex: number, spec: SpecRow): number {
    if (this.cars.length < 2) return 50;
    const a = Number(this.cars[0][spec.key]);
    const b = Number(this.cars[1][spec.key]);
    if (isNaN(a) || isNaN(b) || (a === 0 && b === 0)) return 50;
    const total = a + b;
    const val = carIndex === 0 ? a : b;
    // For 'lower is better', invert so the winner bar is wider
    if (spec.better === 'lower') {
      return Math.round(((total - val) / total) * 100);
    }
    return Math.round((val / total) * 100);
  }

  getWinCount(carIndex: number): number {
    return SPEC_GROUPS.reduce((sum, g) =>
      sum + g.rows.filter(spec => this.isBetter(carIndex, spec)).length, 0);
  }

  formatSpec(car: Car, spec: SpecRow): string {
    const val = car[spec.key];
    return spec.format ? spec.format(val) : String(val ?? '—');
  }

  colorToHex(color: unknown): string {
    const map: Record<string, string> = {
      white: '#f5f5f5', black: '#1a1a1a', silver: '#c0c0c0', grey: '#808080',
      gray: '#808080', red: '#c0392b', blue: '#2980b9', green: '#27ae60',
      yellow: '#f1c40f', orange: '#e67e22', brown: '#795548', gold: '#c9a227',
      beige: '#d4b896', maroon: '#800000', purple: '#8e44ad', pink: '#e91e63',
    };
    const key = String(color ?? '').toLowerCase().trim();
    return map[key] ?? '#888';
  }
}
