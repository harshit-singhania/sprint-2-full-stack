import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusLabelPipe } from '../../../core/pipes/status-label.pipe';

const STATUS_STYLES: Record<string, { color: string; bg: string }> = {
  PENDING_ADMIN_APPROVAL: { color: 'var(--warning)',      bg: 'rgba(255,159,10,0.12)' },
  PENDING_SELLER_APPROVAL:{ color: 'var(--warning)',      bg: 'rgba(255,159,10,0.12)' },
  APPROVED:               { color: 'var(--success)',      bg: 'rgba(48,209,88,0.12)' },
  SUCCESS:                { color: 'var(--success)',      bg: 'rgba(48,209,88,0.12)' },
  REJECTED:               { color: 'var(--danger)',       bg: 'rgba(255,69,58,0.12)' },
  FAILED:                 { color: 'var(--danger)',       bg: 'rgba(255,69,58,0.12)' },
  OPEN:                   { color: 'var(--accent)',       bg: 'var(--accent-wash)' },
  CANCELLED:              { color: 'var(--neutral-chip)', bg: 'rgba(142,142,147,0.14)' },
  CLOSED:                 { color: 'var(--neutral-chip)', bg: 'rgba(142,142,147,0.14)' },
};

@Component({
  selector: 'app-status-chip',
  standalone: true,
  imports: [CommonModule, StatusLabelPipe],
  template: `
    <span class="status-chip" [style.color]="chipColor" [style.background]="chipBg">
      {{ status | statusLabel }}
    </span>
  `,
  styles: [`
    .status-chip {
      display: inline-block;
      font-family: var(--font-mono);
      font-size: 12px;
      font-weight: 500;
      letter-spacing: 0;
      padding: 4px 10px;
      border-radius: var(--radius-input);
      line-height: 1.4;
      white-space: nowrap;
    }
  `]
})
export class StatusChipComponent {
  @Input() status = '';

  get chipColor(): string {
    return STATUS_STYLES[this.status]?.color ?? 'var(--text-tertiary)';
  }

  get chipBg(): string {
    return STATUS_STYLES[this.status]?.bg ?? 'rgba(142,142,147,0.14)';
  }
}
