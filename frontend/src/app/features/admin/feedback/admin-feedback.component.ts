import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Feedback } from '../../../core/models/feedback.model';
import { AdminService } from '../../../core/services/admin.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-admin-feedback',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    EmptyStateComponent
  ],
  template: `
    <div class="feedback-page">
      <div class="page-head">
        <div>
          <div class="eyebrow mono">Customer voice</div>
          <h1 class="page-heading">Feedback</h1>
          <p class="body page-intro">A quiet read on how the marketplace feels from the other side.</p>
        </div>
      </div>

      <ng-container *ngIf="isLoading">
        <div class="summary-skeleton surface-card">
          <app-loading-spinner variant="row"></app-loading-spinner>
          <app-loading-spinner variant="row"></app-loading-spinner>
        </div>
        <div class="feedback-grid">
          <div class="feedback-card surface-card" *ngFor="let _ of skeletonRows">
            <app-loading-spinner variant="row"></app-loading-spinner>
          </div>
        </div>
      </ng-container>

      <ng-container *ngIf="!isLoading">
        <app-empty-state
          *ngIf="error"
          icon="ph ph-warning-circle"
          title="Could not load feedback"
          message="Try again in a moment."
        ></app-empty-state>

        <ng-container *ngIf="!error">
          <app-empty-state
            *ngIf="feedbacks.length === 0"
            icon="ph ph-star"
            title="No feedback yet"
            message="Feedback from users will appear here."
          ></app-empty-state>

          <ng-container *ngIf="feedbacks.length > 0">
            <div class="feedback-grid">
              <article class="feedback-card surface-card" *ngFor="let feedback of feedbacks">
                <div class="feedback-card__head">
                  <span class="feedback-date mono">{{ feedback.createdAt | date:'dd MMM yyyy' }}</span>
                </div>

                <p class="feedback-comment">{{ feedback.message }}</p>

                <div class="feedback-author mono">
                  {{ feedback.user.name }}
                </div>
              </article>
            </div>
          </ng-container>
        </ng-container>
      </ng-container>
    </div>
  `,
  styles: [`
    .feedback-page {
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding-bottom: 24px;
    }

    .page-head {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      align-items: flex-end;
      flex-wrap: wrap;
    }

    .page-intro {
      margin: 0;
    }

    .summary {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 18px;
      padding: 20px;
    }

    .summary-value {
      font-size: clamp(32px, 5vw, 52px);
      color: var(--text-primary);
      letter-spacing: -0.04em;
      line-height: 1;
    }

    .summary-label {
      margin-top: 8px;
      color: var(--text-tertiary);
      font-size: 13px;
    }

    .summary-copy {
      text-align: right;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 8px;
    }

    .summary-stars,
    .feedback-rating {
      display: inline-flex;
      gap: 4px;
      color: var(--warning);
    }

    .summary-stars i,
    .feedback-rating i {
      font-size: 18px;
    }

    .summary-count {
      color: var(--text-tertiary);
    }

    .summary-skeleton {
      padding: 20px;
      display: flex;
      gap: 20px;
    }

    .feedback-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 16px;
    }

    .feedback-card {
      padding: 18px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      min-height: 180px;
    }

    .feedback-card__head {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: center;
    }

    .feedback-date,
    .feedback-author {
      color: var(--text-tertiary);
      font-size: 12px;
    }

    .feedback-comment {
      margin: 0;
      line-height: 1.7;
      color: var(--text-secondary);
      display: -webkit-box;
      -webkit-line-clamp: 5;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    @media (max-width: 720px) {
      .summary {
        flex-direction: column;
        align-items: flex-start;
      }

      .summary-copy {
        text-align: left;
        align-items: flex-start;
      }
    }
  `]
})
export class AdminFeedbackComponent implements OnInit {
  feedbacks: Feedback[] = [];
  isLoading = true;
  error = '';
  skeletonRows = [0, 1, 2, 3];

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.adminService.getFeedback().subscribe({
      next: (data) => {
        this.feedbacks = data;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Failed to load feedback.';
        this.isLoading = false;
      }
    });
  }
}
