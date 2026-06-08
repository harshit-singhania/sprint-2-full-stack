import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';

/** Map route segments to display titles */
const ROUTE_TITLES: Record<string, string> = {
  'dashboard':        'Dashboard',
  'pending':          'Pending',
  'cars':             'Pending Cars',
  'orders':           'Pending Orders',
  'users':            'Users',
  'feedback':         'Feedback',
  'tickets':          'Support',
};

function routeToTitle(url: string): string {
  const segments = url.replace(/\?.*$/, '').split('/').filter(Boolean);
  // e.g. ['admin','cars','pending'] → look for 'pending' in cars context
  if (segments.includes('cars') && segments.includes('pending')) return 'Pending Cars';
  if (segments.includes('orders') && segments.includes('pending')) return 'Pending Orders';
  const last = segments[segments.length - 1] ?? 'dashboard';
  return ROUTE_TITLES[last] ?? 'Dashboard';
}

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatMenuModule,
    MatSidenavModule,
  ],
  templateUrl: './admin-shell.component.html',
  styleUrl: './admin-shell.component.scss'
})
export class AdminShellComponent implements OnInit, OnDestroy {
  isMobile = false;
  pageTitle = 'Dashboard';
  initials = 'A';

  private routeSub?: Subscription;

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.checkMobile();

    const username = this.auth.getUsername() || '';
    this.initials = username
      .split(/\s+/)
      .map(w => w[0] ?? '')
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'A';

    // Set title for current route on init
    this.pageTitle = routeToTitle(this.router.url);

    // Update title on navigation
    this.routeSub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        this.pageTitle = routeToTitle(e.urlAfterRedirects ?? e.url);
      });
  }

  ngOnDestroy() {
    this.routeSub?.unsubscribe();
  }

  @HostListener('window:resize')
  checkMobile() {
    this.isMobile = window.innerWidth < 960;
  }

  logout() {
    this.auth.logout();
  }
}
