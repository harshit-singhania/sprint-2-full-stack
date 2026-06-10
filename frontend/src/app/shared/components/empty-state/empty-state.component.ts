import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="empty-state">
      <!-- Phosphor icon; icon input should be a full class string like "ph ph-car"
           or a bare name like "car" (we auto-prefix if needed) -->
      <i [class]="resolvedIcon" style="font-size: 48px; color: var(--text-tertiary);"></i>
      <div class="h3 empty-title">{{ heading || title }}</div>
      <p class="body empty-message" *ngIf="body || message">{{ body || message }}</p>

      <!-- Legacy CTA via inputs -->
      <a
        *ngIf="ctaLabel && ctaRoute"
        class="btn btn-primary"
        [routerLink]="ctaRoute"
      >{{ ctaLabel }}</a>

      <!-- Projected CTA slot (new preferred way) -->
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 96px 24px;
      text-align: center;
      gap: 12px;
    }

    .empty-title {
      color: var(--text-primary);
      margin: 4px 0 0;
    }

    .empty-message {
      margin: 0;
      text-align: center;
    }
  `]
})
export class EmptyStateComponent {
  /** Phosphor icon class string (e.g. "ph ph-car") or bare name. Defaults to car. */
  @Input() icon = 'ph ph-car';

  /** New preferred input name */
  @Input() title = '';

  /** New preferred input name */
  @Input() message = '';

  /** Legacy alias – callers that pass [heading] still work */
  @Input() heading = '';

  /** Legacy alias – callers that pass [body] still work */
  @Input() body = '';

  /** Optional legacy CTA: route string */
  @Input() ctaRoute?: string;

  /** Optional legacy CTA: label */
  @Input() ctaLabel?: string;

  get resolvedIcon(): string {
    const v = this.icon || '';
    // If it already has "ph" in it, use as-is
    if (v.startsWith('ph ') || v === 'ph') return v;
    // Otherwise treat as a bare phosphor name
    if (v) return `ph ph-${v}`;
    return 'ph ph-car';
  }
}
