import { Component, OnDestroy, OnInit } from '@angular/core';
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
export class LoginComponent implements OnInit, OnDestroy {
  isLoading = false;
  showPassword = false;
  submitted = false;
  errorMessage = '';
  private slideInterval: number | null = null;

  readonly carouselImages = [
    '/assets/car_images/harrier1.jpeg',
    '/assets/car_images/harrier2.jpeg',
    '/assets/car_images/harrier3.jpeg',
    '/assets/car_images/harrier4.jpeg'
  ];
  currentSlide = 0;

  get currentImage() {
    return this.carouselImages[this.currentSlide];
  }

  form = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(10)]]
  });

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private toast: ToastService
  ) {}

  get f() { return this.form.controls; }

  ngOnInit() {
    this.slideInterval = window.setInterval(() => this.nextSlide(), 4000);
  }

  ngOnDestroy() {
    if (this.slideInterval != null) {
      window.clearInterval(this.slideInterval);
      this.slideInterval = null;
    }
  }

  prevSlide() {
    this.currentSlide = (this.currentSlide - 1 + this.carouselImages.length) % this.carouselImages.length;
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.carouselImages.length;
  }

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
