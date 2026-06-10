import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../../../core/models/user.model';
import { AdminService } from '../../../core/services/admin.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LoadingSpinnerComponent,
    EmptyStateComponent
  ],
  template: `
    <div class="users-page">
      <div class="page-head">
        <div>
          <div class="eyebrow mono">Admin users</div>
          <h1 class="page-heading">Users</h1>
          <p class="body page-intro">Search by name, username, email, or phone and review roles quickly.</p>
        </div>

        <label class="search-shell" aria-label="Search users">
          <i class="ph ph-magnifying-glass" aria-hidden="true"></i>
          <input
            type="search"
            [(ngModel)]="searchTerm"
            (ngModelChange)="applyFilter()"
            placeholder="Search users"
          >
        </label>
      </div>

      <ng-container *ngIf="isLoading">
        <div class="table-shell surface-card">
          <app-loading-spinner variant="row" *ngFor="let _ of skeletonRows"></app-loading-spinner>
        </div>
      </ng-container>

      <ng-container *ngIf="!isLoading">
        <app-empty-state
          *ngIf="error"
          icon="ph ph-warning-circle"
          title="Could not load users"
          message="Try again in a moment."
        ></app-empty-state>

        <ng-container *ngIf="!error">
          <app-empty-state
            *ngIf="filteredUsers.length === 0"
            icon="ph ph-users"
            title="No users found"
            message="Try a different search term."
          ></app-empty-state>

          <div *ngIf="filteredUsers.length > 0" class="surface-card table-shell">
            <table class="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
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
                  <td>{{ user.email }}</td>
                  <td class="mono">{{ user.phoneNumber }}</td>
                  <td>
                    <span class="role-chip" [class.role-chip--admin]="user.role === 'ADMIN'">
                      {{ user.role }}
                    </span>
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
    .users-page {
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding-bottom: 24px;
    }

    .page-head {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      align-items: flex-end;
      flex-wrap: wrap;
    }

    .page-intro {
      margin: 0;
    }

    .search-shell {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: min(100%, 320px);
      background: var(--surface-1);
      border: 1px solid var(--hairline);
      border-radius: var(--radius-pill);
      padding: 0 16px;
      color: var(--text-tertiary);
    }

    .search-shell i {
      font-size: 18px;
      flex-shrink: 0;
    }

    .search-shell input {
      width: 100%;
      height: 44px;
      background: transparent;
      border: 0;
      outline: 0;
      color: var(--text-primary);
      font: inherit;
    }

    .search-shell input::placeholder {
      color: var(--text-tertiary);
    }

    .table-shell {
      overflow: hidden;
    }

    .users-table {
      width: 100%;
      border-collapse: collapse;
    }

    .users-table thead th {
      font-size: 12px;
      font-weight: 500;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--text-tertiary);
      text-align: left;
      padding: 16px 20px;
      border-bottom: 1px solid var(--hairline);
      background: rgba(255, 255, 255, 0.01);
    }

    .users-table tbody td {
      padding: 16px 20px;
      border-top: 1px solid var(--hairline);
      color: var(--text-primary);
      vertical-align: middle;
    }

    .users-table tbody tr:first-child td {
      border-top: 0;
    }

    .users-table tbody tr:hover {
      background: var(--surface-2);
    }

    .user-name {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
    }

    .avatar {
      width: 34px;
      height: 34px;
      border-radius: 999px;
      display: grid;
      place-items: center;
      background: var(--surface-2);
      border: 1px solid var(--hairline);
      color: var(--text-primary);
      font-size: 12px;
      flex: 0 0 auto;
    }

    .role-chip {
      display: inline-flex;
      align-items: center;
      padding: 4px 10px;
      border-radius: var(--radius-pill);
      font-size: 12px;
      font-family: var(--font-mono);
      color: var(--neutral-chip);
      background: rgba(142, 142, 147, 0.14);
    }

    .role-chip--admin {
      color: var(--accent);
      background: var(--accent-wash);
    }

    @media (max-width: 960px) {
      .users-table {
        min-width: 720px;
      }

      .table-shell {
        overflow-x: auto;
      }
    }
  `]
})
export class AdminUsersComponent implements OnInit {
  allUsers: User[] = [];
  filteredUsers: User[] = [];
  isLoading = true;
  error = '';
  searchTerm = '';
  skeletonRows = [0, 1, 2, 3, 4];

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.adminService.getUsers().subscribe({
      next: (users) => {
        this.allUsers = users;
        this.filteredUsers = users;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Failed to load users.';
        this.isLoading = false;
      }
    });
  }

  applyFilter() {
    const term = this.searchTerm.trim().toLowerCase();
    this.filteredUsers = this.allUsers.filter((user) =>
      [user.name, user.username, user.email, user.phoneNumber]
        .filter(Boolean)
        .some(value => value!.toLowerCase().includes(term))
    );
  }

  getInitials(name: string): string {
    return (name || '')
      .split(/\s+/)
      .filter(Boolean)
      .map(part => part[0] ?? '')
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'U';
  }
}
