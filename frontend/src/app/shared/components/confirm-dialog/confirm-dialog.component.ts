import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel: string;
  /** Legacy: 'warn' maps to danger styling, 'primary' or 'accent' to accent */
  confirmColor?: 'primary' | 'warn' | 'accent';
  /** New: explicitly mark destructive actions */
  destructive?: boolean;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  template: `
    <div class="confirm-dialog">
      <div class="confirm-dialog__title h3">{{ data.title }}</div>
      <div class="confirm-dialog__body body">{{ data.message }}</div>
      <div class="confirm-dialog__actions">
        <button class="btn btn-ghost" mat-dialog-close>Cancel</button>
        <button
          class="btn"
          [class.btn-danger]="isDestructive"
          [class.btn-primary]="!isDestructive"
          (click)="confirm()"
        >
          {{ data.confirmLabel }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .confirm-dialog {
      background: var(--surface-3);
      border-radius: var(--radius-dialog);
      border: 1px solid var(--hairline);
      padding: 28px 28px 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 320px;
      max-width: 420px;
    }

    .confirm-dialog__title {
      color: var(--text-primary);
    }

    .confirm-dialog__body {
      color: var(--text-secondary);
      max-width: 100%;
    }

    .confirm-dialog__actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 4px;
    }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  get isDestructive(): boolean {
    return this.data.destructive === true || this.data.confirmColor === 'warn';
  }

  confirm() {
    this.dialogRef.close(true);
  }
}
