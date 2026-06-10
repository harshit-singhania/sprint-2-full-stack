import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Card skeleton: 4:3 image block + two text bars -->
    <ng-container *ngIf="variant === 'card'">
      <div class="skel-card">
        <div class="skeleton skel-card__img"></div>
        <div class="skel-card__body">
          <div class="skeleton skel-bar skel-bar--title"></div>
          <div class="skeleton skel-bar skel-bar--sub"></div>
        </div>
      </div>
    </ng-container>

    <!-- Row skeleton: 48px square + two bars -->
    <ng-container *ngIf="variant === 'row'">
      <div class="skel-row">
        <div class="skeleton skel-row__thumb"></div>
        <div class="skel-row__lines">
          <div class="skeleton skel-bar skel-bar--title"></div>
          <div class="skeleton skel-bar skel-bar--sub"></div>
        </div>
      </div>
    </ng-container>

    <!-- Detail skeleton: large image block + side column of bars -->
    <ng-container *ngIf="variant === 'detail'">
      <div class="skel-detail">
        <div class="skeleton skel-detail__img"></div>
        <div class="skel-detail__rail">
          <div class="skeleton skel-bar skel-bar--title"></div>
          <div class="skeleton skel-bar skel-bar--price"></div>
          <div class="skeleton skel-bar skel-bar--sub"></div>
          <div class="skeleton skel-bar skel-bar--sub"></div>
          <div class="skeleton skel-bar skel-bar--cta"></div>
        </div>
      </div>
    </ng-container>

    <!-- Spinner: inline, for button-busy states only -->
    <ng-container *ngIf="variant === 'spinner'">
      <div class="spinner-wrap">
        <div class="spinner"></div>
      </div>
    </ng-container>
  `,
  styles: [`
    /* ---- Card ---- */
    .skel-card {
      background: var(--surface-1);
      border: 1px solid var(--hairline);
      border-radius: var(--radius-card);
      overflow: hidden;
    }

    .skel-card__img {
      width: 100%;
      aspect-ratio: 4/3;
      border-radius: 0;
    }

    .skel-card__body {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    /* ---- Row ---- */
    .skel-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 0;
    }

    .skel-row__thumb {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      flex-shrink: 0;
    }

    .skel-row__lines {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    /* ---- Detail ---- */
    .skel-detail {
      display: grid;
      grid-template-columns: 1fr 360px;
      gap: 32px;
      align-items: start;
    }

    @media (max-width: 768px) {
      .skel-detail { grid-template-columns: 1fr; }
    }

    .skel-detail__img {
      width: 100%;
      aspect-ratio: 16/10;
      border-radius: var(--radius-card);
    }

    .skel-detail__rail {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    /* ---- Shared bars ---- */
    .skel-bar { border-radius: 6px; height: 14px; }
    .skel-bar--title  { width: 60%; height: 20px; }
    .skel-bar--price  { width: 40%; height: 28px; }
    .skel-bar--sub    { width: 80%; }
    .skel-bar--cta    { width: 100%; height: 44px; border-radius: var(--radius-pill); }

    /* ---- Inline spinner ---- */
    .spinner-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255,255,255,0.2);
      border-top-color: var(--text-primary);
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class LoadingSpinnerComponent {
  @Input() variant: 'card' | 'row' | 'detail' | 'spinner' = 'card';
}
