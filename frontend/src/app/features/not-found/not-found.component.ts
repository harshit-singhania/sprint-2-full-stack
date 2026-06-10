import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="not-found-page">
      <div class="not-found-glow" aria-hidden="true"></div>
      <div class="not-found-shell surface-card">
        <div class="code mono">404</div>
        <h1 class="display not-found-title">This page took a wrong turn.</h1>
        <p class="body not-found-copy">The page you were looking for does not exist or has moved elsewhere.</p>
        <a class="btn btn-primary" routerLink="/browse">Back to Browse</a>
      </div>
    </div>
  `,
  styles: [`
    .not-found-page {
      min-height: calc(100dvh - 64px);
      display: grid;
      place-items: center;
      padding: 32px 16px;
      position: relative;
      overflow: hidden;
    }

    .not-found-glow {
      position: absolute;
      inset: auto;
      width: 520px;
      height: 520px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(10, 132, 255, 0.18), rgba(10, 132, 255, 0.02) 45%, transparent 70%);
      filter: blur(8px);
      opacity: 0.75;
      transform: translateY(-20%);
    }

    .not-found-shell {
      position: relative;
      width: min(100%, 640px);
      padding: 36px 28px;
      text-align: center;
      overflow: hidden;
    }

    .not-found-shell::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(255,255,255,0.02), transparent 42%);
      pointer-events: none;
    }

    .code {
      font-size: clamp(72px, 14vw, 120px);
      line-height: 1;
      color: var(--accent);
      margin-bottom: 16px;
      letter-spacing: -0.06em;
    }

    .not-found-title {
      margin: 0 auto 12px;
      max-width: 12ch;
    }

    .not-found-copy {
      margin: 0 auto 24px;
      max-width: 42ch;
    }
  `]
})
export class NotFoundComponent {}
