import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { FeedbackService } from '../../../core/services/feedback.service';
import { ToastService } from '../toast/toast.service';

@Component({
  selector: 'app-feedback-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule],
  template: `
    <div class="feedback-dialog">
      <div class="feedback-dialog__title h3">Share Your Feedback</div>

      <form [formGroup]="form" (ngSubmit)="submit()" class="feedback-form">
        <label class="field">
          <span class="field-label">Message</span>
          <textarea
            class="field-input field-textarea"
            formControlName="message"
            rows="5"
            maxlength="500"
            placeholder="Tell us about your experience..."
          ></textarea>
          <span class="field-note mono">{{ form.get('message')?.value?.length || 0 }}/500</span>
          <span class="field-error" *ngIf="submitted && form.get('message')?.errors?.['required']">Message is required.</span>
        </label>

        <div class="feedback-dialog__actions">
          <button type="button" class="btn btn-ghost" mat-dialog-close>Cancel</button>
          <button type="submit" class="btn btn-primary" [disabled]="isLoading">
            {{ isLoading ? 'Submitting...' : 'Submit Feedback' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .feedback-dialog {
      background: var(--surface-3);
      border-radius: var(--radius-dialog);
      border: 1px solid var(--hairline);
      padding: 28px 28px 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 340px;
      max-width: 460px;
    }
    .feedback-dialog__title { color: var(--text-primary); }
    .feedback-form { display: flex; flex-direction: column; gap: 12px; }
    .field { display: flex; flex-direction: column; gap: 6px; }
    .field-label { color: var(--text-secondary); font-size: 13px; font-weight: 500; }
    .field-note { color: var(--text-tertiary); font-size: 12px; }
    .field-error { color: var(--danger); font-size: 12px; }
    .field-input {
      width: 100%;
      background: var(--surface-2);
      border: 1px solid var(--hairline);
      border-radius: var(--radius-input);
      color: var(--text-primary);
      padding: 12px 14px;
      outline: none;
      font: inherit;
      box-sizing: border-box;
    }
    .field-input:focus { border-color: var(--hairline-strong); box-shadow: 0 0 0 3px var(--accent-wash); }
    .field-textarea { resize: vertical; min-height: 120px; }
    .feedback-dialog__actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 4px; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
  `]
})
export class FeedbackDialogComponent {
  isLoading = false;
  submitted = false;

  form = this.fb.group({
    message: ['', [Validators.required, Validators.maxLength(500)]]
  });

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<FeedbackDialogComponent>,
    private feedbackService: FeedbackService,
    private toast: ToastService
  ) {}

  submit() {
    this.submitted = true;
    if (this.form.invalid) return;
    this.isLoading = true;
    this.feedbackService.submitFeedback({ message: this.form.value.message! }).subscribe({
      next: () => {
        this.toast.success('Thank you for your feedback!');
        this.dialogRef.close(true);
      },
      error: () => {
        this.toast.error('Failed to submit feedback. Please try again.');
        this.isLoading = false;
      }
    });
  }
}
