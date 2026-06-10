import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CarService } from '../../../core/services/car.service';
import { ToastService } from '../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-list-car',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './list-car.component.html',
  styleUrl: './list-car.component.scss'
})
export class ListCarComponent {
  isLoading = false;
  submitted = false;

  readonly conditions   = ['EXCELLENT', 'GOOD', 'FAIR', 'POOR'];
  readonly fuelTypes    = ['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID', 'CNG', 'LPG'];
  readonly transmissions = ['MANUAL', 'AUTOMATIC', 'CVT', 'AMT'];
  readonly bodyTypes    = ['SEDAN', 'HATCHBACK', 'SUV', 'MUV', 'COUPE', 'CONVERTIBLE', 'PICKUP', 'VAN', 'OTHER'];

  form = this.fb.group({
    // Basics
    make:           ['', [Validators.required]],
    model:          ['', [Validators.required]],
    year:           [null as number | null, [Validators.required, Validators.min(1900), Validators.max(2100)]],
    color:          ['', [Validators.required]],
    // Condition & price
    condition:      ['GOOD', [Validators.required]],
    fuelType:       ['PETROL', [Validators.required]],
    transmission:   ['MANUAL', [Validators.required]],
    bodyType:       ['SEDAN', [Validators.required]],
    numberOfOwners: [1, [Validators.required, Validators.min(1)]],
    mileage:        [null as number | null, [Validators.required, Validators.min(0)]],
    price:          [null as number | null, [Validators.required, Validators.min(1)]],
    engineCc:       [null as number | null, [Validators.min(50)]],
    insured:        [true],
    pucValid:       [true],
    // Description
    description:    ['', [Validators.maxLength(2000)]]
  });

  constructor(
    private fb: FormBuilder,
    private carService: CarService,
    private toast: ToastService,
    private router: Router
  ) {}

  get f() { return this.form.controls; }
  get colorPreview() { return this.f['color'].value || 'var(--surface-3)'; }
  get descriptionLength() { return (this.f['description'].value || '').length; }

  toggle(field: 'insured' | 'pucValid') {
    this.f[field].setValue(!this.f[field].value);
  }

  onSubmit() {
    this.submitted = true;
    if (this.form.invalid) return;
    this.isLoading = true;

    // Strip empty optional fields
    const raw = this.form.getRawValue() as any;
    if (!raw.engineCc) delete raw.engineCc;
    if (!raw.description) delete raw.description;

    this.carService.createCar(raw).subscribe({
      next: () => {
        this.toast.success('Listing submitted! Pending admin approval before going live.');
        this.router.navigate(['/my-listings']);
      },
      error: (err) => {
        this.isLoading = false;
        this.toast.error(err.error?.message || 'Failed to submit listing.');
      }
    });
  }
}
