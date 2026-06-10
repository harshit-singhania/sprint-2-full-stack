import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { User } from '../../../core/models/user.model';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-edit-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule],
  template: `
    <div class="edit-dialog">
      <div class="dialog-header">
        <h2 class="dialog-title">Edit user</h2>
        <p class="dialog-sub">{{ data.username }}</p>
      </div>

      <form [formGroup]="form" (ngSubmit)="save()" novalidate>
        <!-- Name -->
        <div class="field">
          <label class="field-label" for="eu-name">Full name</label>
          <input id="eu-name" class="field-input" type="text" formControlName="name"
            [class.field-input--error]="submitted && f['name'].errors">
          <span class="field-error" *ngIf="submitted && f['name'].errors?.['pattern']">
            Use Title Case, e.g. "Rahul Sharma".
          </span>
        </div>

        <!-- Phone -->
        <div class="field">
          <label class="field-label" for="eu-phone">Phone number</label>
          <input id="eu-phone" class="field-input mono" type="tel" formControlName="phoneNumber"
            inputmode="numeric" maxlength="10"
            [class.field-input--error]="submitted && f['phoneNumber'].errors">
          <span class="field-error" *ngIf="submitted && f['phoneNumber'].errors?.['pattern']">
            Enter a valid 10-digit Indian mobile number.
          </span>
        </div>

        <!-- Email -->
        <div class="field">
          <label class="field-label" for="eu-email">Email</label>
          <input id="eu-email" class="field-input" type="email" formControlName="email"
            [class.field-input--error]="submitted && f['email'].errors">
          <span class="field-error" *ngIf="submitted && f['email'].errors?.['email']">
            Enter a valid email address.
          </span>
        </div>

        <!-- New password -->
        <div class="field">
          <label class="field-label" for="eu-pw">New password <span class="optional">(optional)</span></label>
          <div class="field-input-wrap">
            <input id="eu-pw" class="field-input" [type]="showPw ? 'text' : 'password'"
              formControlName="newPassword"
              [class.field-input--error]="submitted && f['newPassword'].errors"
              autocomplete="new-password">
            <button type="button" class="eye-toggle" (click)="showPw = !showPw"
              [attr.aria-label]="showPw ? 'Hide password' : 'Show password'">
              <i class="ph" [ngClass]="showPw ? 'ph-eye-slash' : 'ph-eye'"></i>
            </button>
          </div>
          <span class="field-note">Min 10 characters. Setting a new password will log this user out.</span>
          <span class="field-error" *ngIf="submitted && f['newPassword'].errors?.['minlength']">
            Minimum 10 characters.
          </span>
        </div>

        <!-- Server error -->
        <div class="inline-error" *ngIf="serverError" role="alert">
          <i class="ph ph-warning-circle"></i>
          {{ serverError }}
        </div>

        <div class="dialog-actions">
          <button type="button" class="btn btn-ghost" (click)="dialogRef.close(null)" [disabled]="isSaving">Cancel</button>
          <button type="submit" class="btn btn-primary" [disabled]="isSaving">
            <span *ngIf="isSaving" class="spinner-inline"></span>
            {{ isSaving ? 'Saving…' : 'Save changes' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .edit-dialog { padding: 28px; width: 400px; max-width: 100%; box-sizing: border-box; }

    .dialog-header { margin-bottom: 24px; }
    .dialog-title { font-size: 20px; font-weight: 600; margin: 0; }
    .dialog-sub { color: var(--text-tertiary); font-size: 13px; font-family: var(--font-mono); margin: 4px 0 0; }

    .field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
    .field-label { font-size: 13px; font-weight: 500; color: var(--text-secondary); }
    .optional { font-weight: 400; color: var(--text-tertiary); font-size: 11px; }
    .field-note { font-size: 11px; color: var(--text-tertiary); }

    .field-input-wrap { position: relative; }

    .field-input {
      width: 100%;
      box-sizing: border-box;
      background: var(--surface-2);
      border: 1px solid var(--hairline);
      border-radius: var(--radius-input);
      color: var(--text-primary);
      font: inherit;
      font-size: 14px;
      padding: 11px 14px;
      outline: none;
      transition: border-color 180ms, box-shadow 180ms;
      &:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-wash); }
      &--error { border-color: var(--danger) !important; }
      .field-input-wrap & { padding-right: 44px; }
    }

    .eye-toggle {
      position: absolute;
      right: 0; top: 50%;
      transform: translateY(-50%);
      background: none; border: none; cursor: pointer;
      padding: 0 12px; height: 100%;
      display: flex; align-items: center;
      color: var(--text-tertiary);
      &:hover { color: var(--text-secondary); }
      i.ph { font-size: 18px; }
    }

    .field-error { font-size: 12px; color: var(--danger); }

    .inline-error {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 14px;
      background: rgba(255,69,58,0.08);
      border: 1px solid rgba(255,69,58,0.2);
      border-radius: 10px;
      font-size: 13px; color: var(--danger);
      margin-bottom: 16px;
      i { font-size: 16px; flex-shrink: 0; }
    }

    .dialog-actions {
      display: flex; gap: 10px; justify-content: flex-end;
      margin-top: 20px;
    }

    .spinner-inline {
      width: 14px; height: 14px; border-radius: 50%;
      border: 2px solid rgba(255,255,255,.2);
      border-top-color: currentColor;
      display: inline-block;
      animation: spin .75s linear infinite;
      margin-right: 4px; vertical-align: middle;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class AdminEditUserComponent {
  submitted = false;
  isSaving = false;
  serverError = '';
  showPw = false;

  form = this.fb.group({
    name:        [this.data.name,        [Validators.pattern('^[A-Z][a-z]+(?: [A-Z][a-z]+)*$')]],
    phoneNumber: [this.data.phoneNumber, [Validators.pattern('^[6-9]\\d{9}$')]],
    email:       [this.data.email,       [Validators.email]],
    newPassword: ['',                    [Validators.minLength(10)]]
  });

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AdminEditUserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: User,
    private adminService: AdminService
  ) {}

  get f() { return this.form.controls; }

  save() {
    this.submitted = true;
    this.serverError = '';
    if (this.form.invalid) return;

    // Build payload — only send changed, non-empty fields
    const raw = this.form.getRawValue();
    const payload: Record<string, string> = {};
    if (raw.name && raw.name !== this.data.name) payload['name'] = raw.name;
    if (raw.phoneNumber && raw.phoneNumber !== this.data.phoneNumber) payload['phoneNumber'] = raw.phoneNumber;
    if (raw.email && raw.email !== this.data.email) payload['email'] = raw.email;
    if (raw.newPassword) payload['newPassword'] = raw.newPassword;

    if (Object.keys(payload).length === 0) { this.dialogRef.close(null); return; }

    this.isSaving = true;
    this.adminService.editUser(this.data.id, payload).subscribe({
      next: (user) => { this.isSaving = false; this.dialogRef.close(user); },
      error: (err) => { this.isSaving = false; this.serverError = err.error?.message || 'Failed to save changes.'; }
    });
  }
}
