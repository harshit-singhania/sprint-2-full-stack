import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  isLoading = false;
  submitted = false;
  hidePassword = true;
  serverError = '';

  // picsum.photos/seed/car-lineup-studio used in template
  readonly heroImage = 'https://picsum.photos/seed/car-lineup-studio/1200/1600';

  // Role options — USER | ADMIN segmented control
  readonly roles: Array<{ label: string; value: 'USER' | 'ADMIN' }> = [
    { label: 'USER', value: 'USER' },
    { label: 'ADMIN', value: 'ADMIN' },
  ];

  form = this.fb.group({
    name: ['', [Validators.required, Validators.pattern('^[A-Z][a-z]+(?: [A-Z][a-z]+)*$')]],
    username: ['', [Validators.required, Validators.minLength(3)]],
    phoneNumber: ['', [Validators.required, Validators.pattern('^[6-9]\\d{9}$')]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['USER', [Validators.required]]
  });

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private toast: ToastService
  ) {}

  get f() { return this.form.controls; }

  /** 0-4 strength score based on password value */
  get passwordStrength(): number {
    const pw = this.f['password'].value || '';
    if (pw.length === 0) return 0;
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^a-zA-Z0-9]/.test(pw)) score++;
    return Math.min(score, 4);
  }

  get phoneValid(): boolean {
    return /^[6-9]\d{9}$/.test(this.f['phoneNumber'].value || '');
  }

  onSubmit() {
    this.submitted = true;
    this.serverError = '';
    if (this.form.invalid) return;
    this.isLoading = true;
    this.auth.register(this.form.getRawValue()).subscribe({
      next: () => {
        this.toast.success('Account created. Please sign in.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading = false;
        this.serverError = err.error?.message || 'Registration failed. Please try again.';
      }
    });
  }
}
