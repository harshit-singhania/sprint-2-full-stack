import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  isLoading = false;
  showPassword = false;
  submitted = false;
  errorMessage = '';

  // picsum.photos/seed/dark-coupe-night used in template
  readonly heroImage = 'https://picsum.photos/seed/dark-coupe-night/1200/1600';

  form = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private toast: ToastService
  ) {}

  get f() { return this.form.controls; }

  onSubmit() {
    this.submitted = true;
    this.errorMessage = '';
    if (this.form.invalid) return;
    this.isLoading = true;
    const { username, password } = this.form.value;
    this.auth.login(username!, password!).subscribe({
      next: (res) => {
        this.auth.storeAuth(res.sessionToken, res.role, username!);
        this.toast.success('Welcome back!');
        if (res.role === 'ADMIN') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/browse']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        // Inline error — not a toast per design spec
        this.errorMessage = err.error?.message || 'Invalid username or password';
      }
    });
  }
}
