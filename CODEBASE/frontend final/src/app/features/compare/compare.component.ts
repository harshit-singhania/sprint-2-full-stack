import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { Car } from '../../core/models/car.model';
import { CompareService } from './compare.service';
import { getCarPrimaryImage } from '../../core/utils/car-images';
import { InrCurrencyPipe } from '../../core/pipes/inr-currency.pipe';

// ─── Spec row types ────────────────────────────────────────────
type BetterDir = 'lower' | 'higher' | 'none';

interface SpecRow {
  label: string;
  key: keyof Car;
  better: BetterDir;
  format?: (v: unknown) => string;
  isColor?: boolean;
  isBool?: boolean;
  isText?: boolean;         // text: no bar, no winner chip
}

interface SpecGroup {
  title: string;
  icon: string;
  rows: SpecRow[];
}

// ─── Spec groups — all Car fields ─────────────────────────────
const SPEC_GROUPS: SpecGroup[] = [
  {
    title: 'Pricing',
    icon: 'ph-tag',
    rows: [
      {
        label: 'Asking Price',
        key: 'price',
        better: 'lower',
        format: v => `₹${(Number(v) / 100000).toFixed(2)}L`
      },
    ]
  },
  {
    title: 'Identity',
    icon: 'ph-car',
    rows: [
      { label: 'Make',       key: 'make',     better: 'none', isText: true },
      { label: 'Model',      key: 'model',    better: 'none', isText: true },
      { label: 'Year',       key: 'year',     better: 'higher' },
      { label: 'Body Type',  key: 'bodyType', better: 'none', isText: true },
      { label: 'Colour',     key: 'color',    better: 'none', isColor: true },
    ]
  },
  {
    title: 'Engine & Drivetrain',
    icon: 'ph-gear',
    rows: [
      { label: 'Fuel Type',     key: 'fuelType',     better: 'none', isText: true },
      { label: 'Transmission',  key: 'transmission', better: 'none', isText: true },
      { label: 'Engine Displacement', key: 'engineCc', better: 'higher',
        format: v => v != null ? `${v} cc` : '—' },
    ]
  },
  {
    title: 'Condition',
    icon: 'ph-speedometer',
    rows: [
      { label: 'Condition',       key: 'condition',      better: 'none', isText: true,
        format: v => v ? String(v) : '—' },
      { label: 'Odometer',        key: 'mileage',        better: 'lower',
        format: v => `${Number(v).toLocaleString('en-IN')} km` },
      { label: 'Number of Owners', key: 'numberOfOwners', better: 'lower',
        format: v => v != null ? `${v} owner${Number(v) > 1 ? 's' : ''}` : '—' },
    ]
  },
  {
    title: 'Documentation',
    icon: 'ph-shield-check',
    rows: [
      { label: 'Insured',    key: 'insured',  better: 'none', isBool: true },
      { label: 'PUC Valid',  key: 'pucValid', better: 'none', isBool: true },
    ]
  },
  {
    title: 'Listing Stats',
    icon: 'ph-chart-bar',
    rows: [
      { label: 'Listing Views', key: 'viewCount', better: 'none', isText: true,
        format: v => Number(v).toLocaleString('en-IN') },
    ]
  }
];

// ─── Condition rank for comparison ───────────────────────────
const CONDITION_RANK: Record<string, number> = {
  EXCELLENT: 4, GOOD: 3, FAIR: 2, POOR: 1
};

// ─── Component ────────────────────────────────────────────────
@Component({
  selector: 'app-compare',
  standalone: true,
  imports: [CommonModule, RouterModule, InrCurrencyPipe],
  templateUrl: './compare.component.html',
  styleUrl: './compare.component.scss'
})
export class CompareComponent implements OnInit, OnDestroy {
  readonly specGroups = SPEC_GROUPS;
  cars: Car[] = [];
  private sub!: Subscription;

  constructor(public compareService: CompareService) {}

  ngOnInit() {
    this.sub = this.compareService.cars$.subscribe(c => this.cars = c);
  }

  ngOnDestroy() { this.sub.unsubscribe(); }

  // ── Helpers ─────────────────────────────────────────────────

  carImage(car: Car): string {
    return getCarPrimaryImage(car);
  }

  formatSpec(car: Car, spec: SpecRow): string {
    const val = car[spec.key];
    if (val == null || val === '') return '—';
    return spec.format ? spec.format(val) : String(val);
  }

  boolVal(car: Car, spec: SpecRow): boolean | null {
    const v = car[spec.key];
    if (v == null) return null;
    return Boolean(v);
  }

  colorToHex(color: unknown): string {
    const map: Record<string, string> = {
      white: '#f5f5f5', black: '#1a1a1a', silver: '#c0c0c0', grey: '#808080',
      gray: '#808080', red: '#c0392b', blue: '#2980b9', green: '#27ae60',
      yellow: '#f1c40f', orange: '#e67e22', brown: '#795548', gold: '#c9a227',
      beige: '#d4b896', maroon: '#800000', purple: '#8e44ad', pink: '#e91e63',
    };
    return map[String(color ?? '').toLowerCase().trim()] ?? '#888';
  }

  // ── Winner logic ─────────────────────────────────────────────

  private numericVal(car: Car, spec: SpecRow): number {
    if (spec.key === 'condition') return CONDITION_RANK[String(car[spec.key] ?? '')] ?? 0;
    return Number(car[spec.key] ?? 0);
  }

  isBetter(carIndex: number, spec: SpecRow): boolean {
    if (this.cars.length < 2 || spec.better === 'none' || spec.isText || spec.isBool || spec.isColor) return false;
    const a = this.numericVal(this.cars[0], spec);
    const b = this.numericVal(this.cars[1], spec);
    if (a === b) return false;
    if (spec.better === 'lower') return carIndex === 0 ? a < b : b < a;
    return carIndex === 0 ? a > b : b > a;
  }

  isWorse(carIndex: number, spec: SpecRow): boolean {
    return this.isBetter(1 - carIndex, spec);
  }

  isNumericSpec(spec: SpecRow): boolean {
    if (this.cars.length < 2 || spec.better === 'none') return false;
    const a = this.numericVal(this.cars[0], spec);
    const b = this.numericVal(this.cars[1], spec);
    return !isNaN(a) && !isNaN(b);
  }

  getBarWidth(carIndex: number, spec: SpecRow): number {
    if (this.cars.length < 2) return 50;
    const a = this.numericVal(this.cars[0], spec);
    const b = this.numericVal(this.cars[1], spec);
    if (isNaN(a) || isNaN(b) || (a === 0 && b === 0)) return 50;
    const total = a + b;
    const val = carIndex === 0 ? a : b;
    if (spec.better === 'lower') return Math.round(((total - val) / total) * 100);
    return Math.round((val / total) * 100);
  }

  // ── Scoring ──────────────────────────────────────────────────

  get scorableRows(): SpecRow[] {
    return SPEC_GROUPS.flatMap(g => g.rows).filter(r => r.better !== 'none' && !r.isText && !r.isBool && !r.isColor);
  }

  get totalRows(): number { return this.scorableRows.length; }

  getWinCount(carIndex: number): number {
    return this.scorableRows.filter(spec => this.isBetter(carIndex, spec)).length;
  }

  priceDiff(): string {
    if (this.cars.length < 2) return '';
    const diff = Math.abs(this.cars[0].price - this.cars[1].price);
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(diff);
  }
}
