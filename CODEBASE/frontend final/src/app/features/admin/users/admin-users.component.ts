import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { User } from '../../../core/models/user.model';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { AdminEditUserComponent } from '../edit-user/admin-edit-user.component';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, LoadingSpinnerComponent, EmptyStateComponent],
  template: `
    <div class="users-page">
      <div class="page-head">
        <div>
          <div class="eyebrow mono">Admin</div>
          <h1 class="page-heading">Users</h1>
          <p class="body page-intro">Search and manage user accounts.</p>
        </div>
        <label class="search-shell" aria-label="Search users">
          <i class="ph ph-magnifying-glass" aria-hidden="true"></i>
          <input type="search" [(ngModel)]="searchTerm" (ngModelChange)="applyFilter()" placeholder="Search users">
        </label>
      </div>

      <ng-container *ngIf="isLoading">
        <div class="table-shell surface-card">
          <app-loading-spinner variant="row" *ngFor="let _ of skeletonRows"></app-loading-spinner>
        </div>
      </ng-container>

      <ng-container *ngIf="!isLoading">
        <app-empty-state *ngIf="error" icon="ph ph-warning-circle" title="Could not load users" message="Try again."></app-empty-state>

        <ng-container *ngIf="!error">
          <app-empty-state *ngIf="filteredUsers.length === 0" icon="ph ph-users" title="No users found" message="Try a different search."></app-empty-state>

          <div *ngIf="filteredUsers.length > 0" class="surface-card table-shell">
            <table class="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let user of filteredUsers">
                  <td>
                    <div class="user-name">
                      <span class="avatar mono">{{ getInitials(user.name) }}</span>
                      <span>{{ user.name }}</span>
                    </div>
                  </td>
                  <td class="mono">{{ user.username }}</td>
                  <td>{{ user.email || '—' }}</td>
                  <td class="mono">{{ user.phoneNumber }}</td>
                  <td>
                    <span class="role-chip" [class.role-chip--admin]="user.role === 'ADMIN'">{{ user.role }}</span>
                  </td>
                  <td>
                    <button class="edit-btn" (click)="openEdit(user)" title="Edit user" aria-label="Edit user">
                      <i class="ph ph-pencil"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </ng-container>
      </ng-container>
    </div>
  `,
  styles: [`
    .users-page { display: flex; flex-direction: column; gap: 20px; padding-bottom: 24px; }
    .page-head { display: flex; justify-content: space-between; gap: 16px; align-items: flex-end; flex-wrap: wrap; }
    .page-intro { margin: 0; }
    .search-shell {
      display: flex; align-items: center; gap: 10px; min-width: min(100%, 320px);
      background: var(--surface-1); border: 1px solid var(--hairline);
      border-radius: var(--radius-pill); padding: 0 16px; color: var(--text-tertiary);
      i { font-size: 18px; flex-shrink: 0; }
      input { width: 100%; height: 44px; background: transparent; border: 0; outline: 0; color: var(--text-primary); font: inherit; }
      input::placeholder { color: var(--text-tertiary); }
    }
    .table-shell { overflow: hidden; }
    .users-table { width: 100%; border-collapse: collapse; }
    .users-table thead th {
      font-size: 11px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase;
      color: var(--text-tertiary); text-align: left; padding: 14px 20px;
      border-bottom: 1px solid var(--hairline); white-space: nowrap;
    }
    .users-table tbody td { padding: 14px 20px; border-top: 1px solid var(--hairline); color: var(--text-primary); vertical-align: middle; }
    .users-table tbody tr:first-child td { border-top: 0; }
    .users-table tbody tr:hover { background: var(--surface-2); }
    .user-name { display: inline-flex; align-items: center; gap: 12px; }
    .avatar {
      width: 34px; height: 34px; border-radius: 999px; display: grid; place-items: center;
      background: var(--surface-2); border: 1px solid var(--hairline); color: var(--text-primary); font-size: 12px; flex: 0 0 auto;
    }
    .role-chip {
      display: inline-flex; padding: 4px 10px; border-radius: var(--radius-pill);
      font-size: 12px; font-family: var(--font-mono); color: var(--neutral-chip); background: rgba(142,142,147,.14);
    }
    .role-chip--admin { color: var(--accent); background: var(--accent-wash); }
    .edit-btn {
      width: 34px; height: 34px; border-radius: 8px; border: 1px solid var(--hairline);
      background: transparent; color: var(--text-secondary); cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: background 150ms, color 150ms;
      i { font-size: 16px; }
    }
    .edit-btn:hover { background: var(--surface-2); color: var(--text-primary); }
    @media (max-width: 960px) { .users-table { min-width: 760px; } .table-shell { overflow-x: auto; } }
  `]
})
export class AdminUsersComponent implements OnInit {
  allUsers: User[] = [];
  filteredUsers: User[] = [];
  isLoading = true;
  error = '';
  searchTerm = '';
  skeletonRows = [0, 1, 2, 3, 4];

  constructor(
    private adminService: AdminService,
    private toast: ToastService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading = true;
    this.adminService.getUsers().subscribe({
      next: (users) => { this.allUsers = users; this.filteredUsers = users; this.isLoading = false; },
      error: () => { this.error = 'Failed to load users.'; this.isLoading = false; }
    });
  }

  applyFilter() {
    const term = this.searchTerm.trim().toLowerCase();
    this.filteredUsers = this.allUsers.filter(u =>
      [u.name, u.username, u.email, u.phoneNumber].filter(Boolean).some(v => v!.toLowerCase().includes(term))
    );
  }

  getInitials(name: string): string {
    return (name || '').split(/\s+/).filter(Boolean).map(p => p[0] ?? '').slice(0, 2).join('').toUpperCase() || 'U';
  }

  openEdit(user: User) {
    const ref = this.dialog.open(AdminEditUserComponent, { width: '460px', data: user });
    ref.afterClosed().subscribe((updated: User | null) => {
      if (!updated) return;
      const idx = this.allUsers.findIndex(u => u.id === updated.id);
      if (idx >= 0) this.allUsers[idx] = updated;
      this.applyFilter();
      this.toast.success(`${updated.name} updated.`);
    });
  }
}
