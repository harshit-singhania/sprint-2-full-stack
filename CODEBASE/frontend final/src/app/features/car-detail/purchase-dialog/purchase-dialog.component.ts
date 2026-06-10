import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Car } from '../../../core/models/car.model';
import { OrderService } from '../../../core/services/order.service';
import { InrCurrencyPipe } from '../../../core/pipes/inr-currency.pipe';
import { getCarPrimaryImage } from '../../../core/utils/car-images';

@Component({
  selector: 'app-purchase-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, InrCurrencyPipe],
  template: `
    <!-- Success screen -->
    <div class="dialog-screen" *ngIf="successState">
      <div class="success-icon">
        <i class="ph ph-check-circle"></i>
      </div>
      <h2 class="dialog-title">Order placed</h2>
      <p class="dialog-sub">Order <span class="mono">#{{orderId}}</span> has been submitted.</p>
      <p class="dialog-note">It now awaits admin and seller approval.</p>
      <div class="dialog-actions">
        <button class="btn btn-primary btn-full" (click)="viewOrder()">View order</button>
        <button class="btn btn-ghost btn-full" (click)="dialogRef.close()">Close</button>
      </div>
    </div>

    <!-- Error screen -->
    <div class="dialog-screen" *ngIf="errorState">
      <div class="error-icon">
        <i class="ph ph-x-circle"></i>
      </div>
      <h2 class="dialog-title">Payment failed</h2>
      <p class="dialog-sub">{{errorMsg}}</p>
      <div class="dialog-actions">
        <button class="btn btn-primary btn-full" (click)="retry()">Try again</button>
        <button class="btn btn-ghost btn-full" (click)="dialogRef.close()">Cancel</button>
      </div>
    </div>

    <!-- Step flow -->
    <ng-container *ngIf="!successState && !errorState">
      <!-- Step indicator -->
      <div class="step-bar">
        <div class="step-dot" [class.step-dot--active]="step >= 1" [class.step-dot--done]="step > 1"></div>
        <div class="step-line"></div>
        <div class="step-dot" [class.step-dot--active]="step >= 2" [class.step-dot--done]="step > 2"></div>
        <div class="step-line"></div>
        <div class="step-dot" [class.step-dot--active]="step >= 3"></div>
      </div>

      <!-- Step 1: Review -->
      <div class="dialog-screen" *ngIf="step === 1">
        <h2 class="dialog-title">Review</h2>
        <div class="car-summary surface-card">
          <img class="summary-img" [src]="carImage" [alt]="data.make">
          <div class="summary-info">
            <p class="summary-name"><span class="mono">{{data.year}}</span> {{data.make}} {{data.model}}</p>
            <p class="summary-price mono">{{data.price | inrCurrency}}</p>
          </div>
        </div>
        <p class="dialog-note">Once you place this order, it will be reviewed by our admin team and then by the seller before the sale is confirmed.</p>
        <div class="dialog-actions">
          <button class="btn btn-primary btn-full" (click)="step = 2">Continue</button>
          <button class="btn btn-ghost btn-full" (click)="dialogRef.close()">Cancel</button>
        </div>
      </div>

      <!-- Step 2: Payment -->
      <div class="dialog-screen" *ngIf="step === 2">
        <h2 class="dialog-title">Payment</h2>
        <form [formGroup]="form">
          <div class="segment-control">
            <button type="button" class="segment-btn"
                    [class.segment-btn--active]="form.get('paymentMethod')?.value === 'CREDIT_CARD'"
                    (click)="form.get('paymentMethod')?.setValue('CREDIT_CARD')">Card</button>
            <button type="button" class="segment-btn"
                    [class.segment-btn--active]="form.get('paymentMethod')?.value === 'UPI'"
                    (click)="form.get('paymentMethod')?.setValue('UPI')">UPI</button>
            <button type="button" class="segment-btn"
                    [class.segment-btn--active]="form.get('paymentMethod')?.value === 'NET_BANKING'"
                    (click)="form.get('paymentMethod')?.setValue('NET_BANKING')">Net banking</button>
          </div>

          <div class="token-field">
            <label class="token-label">Payment reference / token</label>
            <input class="token-input" formControlName="paymentToken" placeholder="Transaction ID or reference number">
            <span class="token-error" *ngIf="form.get('paymentToken')?.touched && form.get('paymentToken')?.invalid">
              Payment reference is required
            </span>
          </div>

          <div class="secure-badge">
            <i class="ph ph-lock-simple"></i>
            <span>Secure simulated checkout</span>
          </div>
        </form>
        <div class="dialog-actions">
          <button class="btn btn-primary btn-full" (click)="step = 3"
                  [disabled]="form.get('paymentMethod')?.invalid || form.get('paymentToken')?.invalid">
            Continue
          </button>
          <button class="btn btn-ghost btn-full" (click)="step = 1">Back</button>
        </div>
      </div>

      <!-- Step 3: Confirm -->
      <div class="dialog-screen" *ngIf="step === 3">
        <h2 class="dialog-title">Confirm order</h2>
        <div class="confirm-summary surface-card">
          <div class="confirm-row">
            <span style="color: var(--text-secondary); font-size: 13px;">Car</span>
            <span class="mono" style="font-weight: 600;">{{data.year}} {{data.make}} {{data.model}}</span>
          </div>
          <div class="confirm-row">
            <span style="color: var(--text-secondary); font-size: 13px;">Amount</span>
            <span class="mono" style="font-size: 18px; font-weight: 700; color: var(--accent);">{{data.price | inrCurrency}}</span>
          </div>
          <div class="confirm-row">
            <span style="color: var(--text-secondary); font-size: 13px;">Method</span>
            <span class="mono">{{form.value.paymentMethod}}</span>
          </div>
        </div>
        <p class="dialog-note">By placing this order you agree that this is a simulated payment for demo purposes.</p>
        <div class="dialog-actions">
          <button class="btn btn-primary btn-full" (click)="confirm()" [disabled]="isLoading">
            <i class="ph ph-spinner" *ngIf="isLoading" style="animation: spin 0.8s linear infinite;"></i>
            {{isLoading ? 'Placing order…' : 'Place order'}}
          </button>
          <button class="btn btn-ghost btn-full" (click)="step = 2" [disabled]="isLoading">Back</button>
        </div>
      </div>
    </ng-container>
  `,
  styles: [`
    :host { display: block; padding: 28px; max-width: 480px; }

    .step-bar {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0;
      margin-bottom: 28px;
    }
    .step-dot {
      width: 10px; height: 10px; border-radius: 50%;
      background: var(--hairline-strong);
      transition: background 200ms;
      &--active { background: var(--accent); }
      &--done { background: var(--accent); opacity: 0.5; }
    }
    .step-line { width: 48px; height: 1px; background: var(--hairline); }

    .dialog-screen { display: flex; flex-direction: column; gap: 16px; }
    .dialog-title { font-size: 20px; font-weight: 600; margin: 0; }
    .dialog-sub { color: var(--text-secondary); margin: 0; font-size: 15px; }
    .dialog-note { font-size: 12px; color: var(--text-tertiary); margin: 0; line-height: 1.5; }

    .car-summary {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      border-radius: var(--radius-card);
    }
    .summary-img { width: 80px; height: 56px; object-fit: cover; border-radius: 8px; flex-shrink: 0; }
    .summary-name { margin: 0; font-size: 14px; font-weight: 500; }
    .summary-price { margin: 4px 0 0; font-size: 18px; font-weight: 700; color: var(--accent); }
    .summary-info { display: flex; flex-direction: column; }

    .segment-control {
      display: flex;
      background: var(--surface-2);
      border-radius: 10px;
      padding: 4px;
      gap: 4px;
      margin-bottom: 16px;
    }
    .segment-btn {
      flex: 1;
      background: transparent;
      border: none;
      border-radius: 8px;
      padding: 8px 12px;
      font-family: var(--font-sans);
      font-size: 13px;
      font-weight: 500;
      color: var(--text-secondary);
      cursor: pointer;
      transition: background 150ms, color 150ms;
      &--active { background: var(--surface-3); color: var(--text-primary); }
    }

    .token-field { display: flex; flex-direction: column; gap: 6px; }
    .token-label { font-size: 12px; font-weight: 500; color: var(--text-secondary); }
    .token-input {
      background: var(--surface-2);
      border: 1px solid var(--hairline);
      border-radius: 10px;
      padding: 12px 14px;
      font-family: var(--font-sans);
      font-size: 14px;
      color: var(--text-primary);
      outline: none;
      width: 100%;
      box-sizing: border-box;
      &::placeholder { color: var(--text-tertiary); }
      &:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-wash); }
    }
    .token-error { font-size: 11px; color: var(--danger); }

    .secure-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: var(--text-tertiary);
      padding: 8px 0 0;
      i { font-size: 14px; }
    }

    .confirm-summary {
      border-radius: var(--radius-card);
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .confirm-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .success-icon {
      text-align: center;
      i { font-size: 56px; color: var(--success, #30D158); }
    }
    .error-icon {
      text-align: center;
      i { font-size: 56px; color: var(--danger); }
    }

    .dialog-actions { display: flex; flex-direction: column; gap: 8px; }
    .btn-full { width: 100%; justify-content: center; }

    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  `]
})
export class PurchaseDialogComponent {
  step = 1;
  isLoading = false;
  successState = false;
  errorState = false;
  errorMsg = '';
  orderId: number | null = null;

  readonly carImage: string;

  form = this.fb.group({
    paymentMethod: ['CREDIT_CARD', Validators.required],
    paymentToken: ['', Validators.required]
  });

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<PurchaseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Car,
    private orderService: OrderService,
    private router: Router
  ) {
    this.carImage = getCarPrimaryImage(data);
  }

  confirm() {
    if (this.form.invalid) return;
    this.isLoading = true;
    const { paymentMethod, paymentToken } = this.form.value;
    this.orderService.purchaseCar(this.data.id, {
      paymentMethod: paymentMethod!,
      paymentToken: paymentToken!
    }).subscribe({
      next: (order) => {
        this.isLoading = false;
        this.orderId = order.id;
        this.successState = true;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMsg = err.error?.message || 'Payment failed. Please try again.';
        this.errorState = true;
      }
    });
  }

  retry() {
    this.errorState = false;
    this.step = 2;
  }

  viewOrder() {
    this.dialogRef.close();
    this.router.navigate(['/my-orders', this.orderId]);
  }
}
