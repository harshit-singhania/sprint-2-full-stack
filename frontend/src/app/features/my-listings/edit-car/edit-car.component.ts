import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { CarService } from '../../../core/services/car.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-edit-car',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LoadingSpinnerComponent],
  template: `
    <div class="page-container form-page">
      <div class="form-shell">
        <div class="form-top">
          <h2 class="h2">Edit listing</h2>
          <p class="body">Edits go back to admin review before going live.</p>
        </div>

        <app-loading-spinner *ngIf="isLoadingCar"></app-loading-spinner>

        <form *ngIf="!isLoadingCar" [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
          <section class="form-section">
            <h3 class="h3">The basics</h3>
            <div class="grid-two">
              <label class="field">
                <span class="field-label">Make</span>
                <input class="field-input" formControlName="make" [class.field-input--error]="(submitted || f['make'].touched) && f['make'].errors">
                <span class="field-error" *ngIf="(submitted || f['make'].touched) && f['make'].errors?.['required']">Make is required.</span>
              </label>

              <label class="field">
                <span class="field-label">Model</span>
                <input class="field-input" formControlName="model" [class.field-input--error]="(submitted || f['model'].touched) && f['model'].errors">
                <span class="field-error" *ngIf="(submitted || f['model'].touched) && f['model'].errors?.['required']">Model is required.</span>
              </label>

              <label class="field">
                <span class="field-label">Year</span>
                <input class="field-input mono" type="number" formControlName="year" [class.field-input--error]="(submitted || f['year'].touched) && f['year'].errors">
                <span class="field-error" *ngIf="(submitted || f['year'].touched) && f['year'].errors?.['required']">Year is required.</span>
                <span class="field-error" *ngIf="(submitted || f['year'].touched) && f['year'].errors?.['min']">Year must be 1900 or later.</span>
              </label>

              <label class="field">
                <span class="field-label">Color</span>
                <div class="field-with-swatch">
                  <span class="swatch" [style.background]="colorPreview"></span>
                  <input class="field-input" formControlName="color" [class.field-input--error]="(submitted || f['color'].touched) && f['color'].errors">
                </div>
                <span class="field-error" *ngIf="(submitted || f['color'].touched) && f['color'].errors?.['required']">Color is required.</span>
              </label>
            </div>
          </section>

          <section class="form-section">
            <h3 class="h3">Condition and price</h3>
            <div class="grid-two">
              <label class="field">
                <span class="field-label">Mileage</span>
                <input class="field-input mono" type="number" formControlName="mileage" [class.field-input--error]="(submitted || f['mileage'].touched) && f['mileage'].errors">
                <span class="field-error" *ngIf="(submitted || f['mileage'].touched) && f['mileage'].errors?.['required']">Mileage is required.</span>
                <span class="field-error" *ngIf="(submitted || f['mileage'].touched) && f['mileage'].errors?.['min']">Mileage cannot be negative.</span>
              </label>

              <label class="field">
                <span class="field-label">Price</span>
                <input class="field-input mono" type="number" formControlName="price" [class.field-input--error]="(submitted || f['price'].touched) && f['price'].errors">
                <span class="field-error" *ngIf="(submitted || f['price'].touched) && f['price'].errors?.['required']">Price is required.</span>
                <span class="field-error" *ngIf="(submitted || f['price'].touched) && f['price'].errors?.['min']">Price cannot be negative.</span>
              </label>
            </div>

            <div class="toggle-row">
              <div>
                <div class="field-label">Available</div>
                <div class="field-note">Turn off if this car is temporarily unavailable.</div>
              </div>
              <button type="button" class="toggle" [class.toggle--on]="f['available'].value" (click)="toggleAvailable()" role="switch" [attr.aria-checked]="!!f['available'].value">
                <span class="toggle-track"></span>
                <span class="toggle-thumb"></span>
              </button>
            </div>
          </section>

          <section class="form-section">
            <h3 class="h3">Details</h3>
            <label class="field">
              <span class="field-label">Description</span>
              <textarea class="field-input field-textarea" rows="5" formControlName="description"></textarea>
              <span class="field-note mono">{{ descriptionLength }} characters</span>
            </label>
          </section>

          <div class="sticky-actions">
            <a class="btn btn-ghost" routerLink="/my-listings">Cancel</a>
            <button class="btn btn-primary" type="submit" [disabled]="isSaving">
              <span *ngIf="isSaving" class="spinner-inline"></span>
              <span>{{ isSaving ? 'Saving' : 'Save changes' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .form-page { padding: 28px 0 40px; }
    .form-shell { max-width: 640px; margin: 0 auto; }
    .form-top { margin-bottom: 24px; }
    .form-top .body { margin: 6px 0 0; }
    .form-section {
      background: var(--surface-1);
      border: 1px solid var(--hairline);
      border-radius: var(--radius-card);
      padding: 20px;
      margin-bottom: 16px;
    }
    .grid-two {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-top: 14px;
    }
    .field { display: flex; flex-direction: column; gap: 6px; }
    .field-label { color: var(--text-secondary); font-size: 13px; font-weight: 500; }
    .field-note { color: var(--text-tertiary); font-size: 12px; }
    .field-input {
      width: 100%;
      background: var(--surface-2);
      border: 1px solid var(--hairline);
      border-radius: var(--radius-input);
      color: var(--text-primary);
      padding: 12px 14px;
      outline: none;
      font: inherit;
    }
    .field-input:focus {
      border-color: var(--hairline-strong);
      box-shadow: 0 0 0 3px var(--accent-wash);
    }
    .field-input--error { border-color: var(--danger); }
    .field-textarea { resize: vertical; min-height: 120px; }
    .field-error { color: var(--danger); font-size: 12px; }
    .field-with-swatch { display: flex; align-items: center; gap: 10px; }
    .swatch {
      width: 14px;
      height: 14px;
      border-radius: 999px;
      border: 1px solid var(--hairline);
      flex-shrink: 0;
      background: var(--surface-3);
    }
    .toggle-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      margin-top: 16px;
    }
    .toggle {
      position: relative;
      width: 56px;
      height: 32px;
      border: 0;
      background: transparent;
      padding: 0;
      cursor: pointer;
    }
    .toggle-track {
      position: absolute;
      inset: 0;
      border-radius: 999px;
      background: var(--surface-2);
      border: 1px solid var(--hairline);
    }
    .toggle--on .toggle-track { background: var(--accent-wash); border-color: rgba(10,132,255,0.25); }
    .toggle-thumb {
      position: absolute;
      top: 50%;
      left: 4px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--text-primary);
      transform: translateY(-50%);
      transition: left 180ms ease;
    }
    .toggle--on .toggle-thumb { left: 28px; }
    .sticky-actions {
      position: sticky;
      bottom: 0;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 0 0;
      background: linear-gradient(to top, var(--bg-base), rgba(11,11,15,0));
    }
    .spinner-inline {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 2px solid rgba(255,255,255,0.2);
      border-top-color: var(--text-primary);
      display: inline-block;
      animation: spin 0.75s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    @media (max-width: 768px) {
      .grid-two { grid-template-columns: 1fr; }
      .sticky-actions { flex-direction: column-reverse; }
      .sticky-actions .btn { width: 100%; }
    }
  `]
})
export class EditCarComponent implements OnInit {
  isLoadingCar = true;
  isSaving = false;
  submitted = false;
  carId!: number;

  form = this.fb.group({
    make: ['', [Validators.required]],
    model: ['', [Validators.required]],
    year: [null as number | null, [Validators.required, Validators.min(1900)]],
    color: ['', [Validators.required]],
    mileage: [null as number | null, [Validators.required, Validators.min(0)]],
    price: [null as number | null, [Validators.required, Validators.min(0)]],
    available: [true],
    description: ['']
  });

  constructor(
    private fb: FormBuilder,
    private carService: CarService,
    private toast: ToastService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  get f() { return this.form.controls; }
  get colorPreview() { return this.f['color'].value || 'var(--surface-3)'; }
  get descriptionLength() { return (this.f['description'].value || '').length; }

  ngOnInit() {
    this.carId = Number(this.route.snapshot.paramMap.get('id'));
    this.carService.getCarById(this.carId).subscribe({
      next: (car) => {
        this.form.patchValue({
          make: car.make,
          model: car.model,
          year: car.year,
          color: car.color,
          mileage: car.mileage,
          price: car.price,
          available: car.available,
          description: car.description || ''
        });
        this.isLoadingCar = false;
      },
      error: () => {
        this.toast.error('Failed to load car details');
        this.router.navigate(['/my-listings']);
      }
    });
  }

  toggleAvailable() {
    this.f['available'].setValue(!this.f['available'].value);
  }

  onSubmit() {
    this.submitted = true;
    if (this.form.invalid) return;
    this.isSaving = true;
    this.carService.updateCar(this.carId, this.form.getRawValue() as any).subscribe({
      next: () => {
        this.toast.success('Listing updated and submitted for re-approval');
        this.router.navigate(['/my-listings']);
      },
      error: (err) => {
        this.isSaving = false;
        this.toast.error(err.error?.message || 'Failed to update listing');
      }
    });
  }
}
