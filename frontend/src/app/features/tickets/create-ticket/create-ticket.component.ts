import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TicketService } from '../../../core/services/ticket.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-create-ticket',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    LoadingSpinnerComponent
  ],
  template: `
    <div class="page ticket-create-page">
      <div class="ticket-shell surface-card">
        <div class="ticket-shell__header">
          <div class="icon-badge" aria-hidden="true">
            <i class="ph ph-lifebuoy"></i>
          </div>

          <div class="ticket-shell__copy">
            <div class="eyebrow mono">Support</div>
            <h1 class="display ticket-title">Create support ticket</h1>
            <p class="body ticket-subtitle">Describe the issue and our team will reply in the thread.</p>
          </div>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="ticket-form">
          <div class="field-group">
            <label class="field-label" for="subject">Subject</label>
            <mat-form-field appearance="outline" class="form-field">
              <input
                id="subject"
                matInput
                formControlName="subject"
                placeholder="Short summary of the problem"
              >
            </mat-form-field>
            <div class="field-help">Keep it short. Our team will use the subject to triage the request.</div>
            <div class="field-error" *ngIf="f['subject'].touched && f['subject'].errors?.['required']">Subject is required.</div>
          </div>

          <div class="field-group">
            <div class="field-row">
              <label class="field-label" for="description">Description</label>
              <span class="field-count mono">{{ descriptionLength }}/600</span>
            </div>

            <mat-form-field appearance="outline" class="form-field">
              <textarea
                id="description"
                matInput
                formControlName="description"
                rows="7"
                maxlength="600"
                placeholder="Describe what happened, what you expected, and any order or listing details."
              ></textarea>
            </mat-form-field>

            <div class="field-help">Our team replies in the thread. You will be notified when there is an update.</div>
            <div class="field-error" *ngIf="f['description'].touched && f['description'].errors?.['required']">Description is required.</div>
          </div>

          <div class="submit-error" *ngIf="errorMessage">{{ errorMessage }}</div>

          <div class="form-actions">
            <a class="btn btn-ghost" routerLink="/tickets">Cancel</a>
            <button class="btn btn-primary submit-btn" type="submit" [disabled]="form.invalid || isLoading">
              <ng-container *ngIf="!isLoading">Submit request</ng-container>
              <ng-container *ngIf="isLoading">
                <app-loading-spinner variant="spinner"></app-loading-spinner>
                <span>Submitting</span>
              </ng-container>
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .ticket-create-page {
      min-height: calc(100dvh - 64px);
      display: grid;
      place-items: center;
      padding-top: 32px;
      padding-bottom: 32px;
    }

    .ticket-shell {
      width: 100%;
      max-width: 640px;
      padding: 32px;
    }

    .ticket-shell__header {
      display: flex;
      gap: 18px;
      align-items: flex-start;
      margin-bottom: 28px;
    }

    .icon-badge {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      display: grid;
      place-items: center;
      background: rgba(10, 132, 255, 0.12);
      color: var(--accent);
      flex: 0 0 auto;
    }

    .icon-badge i {
      font-size: 28px;
    }

    .ticket-shell__copy {
      min-width: 0;
    }

    .ticket-title {
      margin: 0 0 10px;
      font-size: clamp(34px, 5vw, 56px);
      line-height: 1.05;
    }

    .ticket-subtitle {
      margin: 0;
    }

    .ticket-form {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .field-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .field-row {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: baseline;
    }

    .field-label {
      font-size: 13px;
      font-weight: 500;
      color: var(--text-secondary);
    }

    .field-help {
      font-size: 13px;
      line-height: 1.5;
      color: var(--text-tertiary);
    }

    .field-count {
      font-size: 12px;
      color: var(--text-tertiary);
    }

    .field-error,
    .submit-error {
      font-size: 13px;
      color: var(--danger);
      line-height: 1.5;
    }

    .form-field {
      width: 100%;
    }

    .submit-btn {
      min-width: 180px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 6px;
      flex-wrap: wrap;
    }

    @media (max-width: 640px) {
      .ticket-shell {
        padding: 20px;
      }

      .ticket-shell__header {
        flex-direction: column;
      }

      .form-actions {
        flex-direction: column-reverse;
      }

      .form-actions .btn {
        width: 100%;
      }

      .submit-btn {
        min-width: 0;
      }
    }
  `]
})
export class CreateTicketComponent {
  isLoading = false;
  errorMessage = '';

  form = this.fb.group({
    subject: ['', Validators.required],
    description: ['', Validators.required]
  });

  constructor(
    private fb: FormBuilder,
    private ticketService: TicketService,
    private toast: ToastService,
    private router: Router
  ) {}

  get f() {
    return this.form.controls;
  }

  get descriptionLength(): number {
    return (this.form.value.description || '').toString().length;
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.ticketService.createTicket(this.form.value as any).subscribe({
      next: (ticket) => {
        this.toast.success('Request created.');
        this.router.navigate(['/tickets', ticket.id]);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Failed to create support request.';
      }
    });
  }
}
