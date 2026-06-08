import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FeedbackService } from '../../../core/services/feedback.service';
import { ToastService } from '../toast/toast.service';

@Component({
  selector: 'app-feedback-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule
  ],
  template: `
    <div class="feedback-dialog">
      <div class="feedback-dialog__title h3">Share Your Feedback</div>

      <form [formGroup]="form" class="feedback-form">
        <!-- Phosphor star rating -->
        <div class="star-rating">
          <button
            type="button"
            *ngFor="let star of [1,2,3,4,5]"
            class="star-btn"
            (click)="setRating(star)"
            [attr.aria-label]="'Rate ' + star + ' stars'"
          >
            <i
              class="ph ph-star"
              [style.color]="star <= currentRating ? 'var(--warning)' : 'var(--text-tertiary)'"
            ></i>
          </button>
        </div>

        <mat-form-field appearance="outline">
          <mat-label>Comment (optional)</mat-label>
          <textarea
            matInput
            formControlName="comment"
            rows="4"
            maxlength="500"
            placeholder="Tell us about your experience..."
          ></textarea>
          <mat-hint>{{ form.get('comment')?.value?.length || 0 }}/500</mat-hint>
        </mat-form-field>
      </form>

      <div class="feedback-dialog__actions">
        <button class="btn btn-ghost" mat-dialog-close>Cancel</button>
        <button
          class="btn btn-primary"
          (click)="submit()"
          [disabled]="currentRating === 0 || isLoading"
        >
          {{ isLoading ? 'Submitting...' : 'Submit Feedback' }}
        </button>
      </div>
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

    .feedback-dialog__title {
      color: var(--text-primary);
    }

    .feedback-form {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .star-rating {
      display: flex;
      justify-content: center;
      gap: 4px;
      margin-bottom: 8px;
    }

    .star-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      transition: transform 150ms var(--ease);

      i { font-size: 28px; }

      &:hover { transform: scale(1.15); }
      &:active { transform: scale(0.93); }
    }

    mat-form-field { width: 100%; }

    .feedback-dialog__actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 4px;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class FeedbackDialogComponent {
  currentRating = 0;
  isLoading = false;

  form = this.fb.group({
    comment: ['', [Validators.maxLength(500)]]
  });

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<FeedbackDialogComponent>,
    private feedbackService: FeedbackService,
    private toast: ToastService
  ) {}

  setRating(rating: number) {
    this.currentRating = rating;
  }

  submit() {
    if (this.currentRating === 0) return;
    this.isLoading = true;
    const payload = {
      rating: this.currentRating,
      comment: this.form.get('comment')?.value || undefined
    };
    this.feedbackService.submitFeedback(payload).subscribe({
      next: () => {
        this.toast.success('Thank you for your feedback!');
        this.dialogRef.close();
      },
      error: () => {
        this.toast.error('Failed to submit feedback. Please try again.');
        this.isLoading = false;
      }
    });
  }
}
