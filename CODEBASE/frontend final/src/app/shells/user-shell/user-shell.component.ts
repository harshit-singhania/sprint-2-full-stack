import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthService } from '../../core/services/auth.service';
import { FeedbackDialogComponent } from '../../shared/components/feedback-dialog/feedback-dialog.component';
import { CompareTrayComponent } from '../../features/compare/compare-tray.component';

@Component({
  selector: 'app-user-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatMenuModule,
    MatSidenavModule,
    MatDialogModule,
    CompareTrayComponent
  ],
  templateUrl: './user-shell.component.html',
  styleUrl: './user-shell.component.scss'
})
export class UserShellComponent implements OnInit {
  username = '';
  initials = '';
  mobileNavOpen = false;

  constructor(private auth: AuthService, private dialog: MatDialog) {}

  ngOnInit() {
    this.username = this.auth.getUsername() || '';
    this.initials = this.username
      .split(/\s+/)
      .map(w => w[0] ?? '')
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'U';
  }

  toggleMobileNav() {
    this.mobileNavOpen = !this.mobileNavOpen;
    document.body.style.overflow = this.mobileNavOpen ? 'hidden' : '';
  }

  closeMobileNav() {
    this.mobileNavOpen = false;
    document.body.style.overflow = '';
  }

  logout() {
    this.closeMobileNav();
    this.auth.logout();
  }

  openFeedback() {
    this.dialog.open(FeedbackDialogComponent, { width: '480px' });
  }
}
