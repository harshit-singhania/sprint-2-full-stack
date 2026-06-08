import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard';
import { UserShellComponent } from './shells/user-shell/user-shell.component';
import { AdminShellComponent } from './shells/admin-shell/admin-shell.component';
import { NotFoundComponent } from './features/not-found/not-found.component';

export const routes: Routes = [
  { path: '', redirectTo: '/browse', pathMatch: 'full' },

  // Auth routes (no shell)
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },

  // User shell routes
  {
    path: '',
    component: UserShellComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'browse',
        loadComponent: () => import('./features/browse/browse.component').then(m => m.BrowseComponent)
      },
      {
        path: 'cars/:id',
        loadComponent: () => import('./features/car-detail/car-detail.component').then(m => m.CarDetailComponent)
      },
      {
        path: 'wishlist',
        loadComponent: () => import('./features/wishlist/wishlist.component').then(m => m.WishlistComponent)
      },
      {
        path: 'my-listings',
        loadComponent: () => import('./features/my-listings/my-listings.component').then(m => m.MyListingsComponent)
      },
      {
        path: 'my-listings/new',
        loadComponent: () => import('./features/my-listings/list-car/list-car.component').then(m => m.ListCarComponent)
      },
      {
        path: 'my-listings/:id/edit',
        loadComponent: () => import('./features/my-listings/edit-car/edit-car.component').then(m => m.EditCarComponent)
      },
      {
        path: 'my-orders',
        loadComponent: () => import('./features/my-orders/my-orders.component').then(m => m.MyOrdersComponent)
      },
      {
        path: 'my-orders/:id',
        loadComponent: () => import('./features/my-orders/order-detail/order-detail.component').then(m => m.OrderDetailComponent)
      },
      {
        path: 'tickets',
        loadComponent: () => import('./features/tickets/my-tickets.component').then(m => m.MyTicketsComponent)
      },
      {
        path: 'tickets/new',
        loadComponent: () => import('./features/tickets/create-ticket/create-ticket.component').then(m => m.CreateTicketComponent)
      },
      {
        path: 'tickets/:id',
        loadComponent: () => import('./features/tickets/ticket-detail/ticket-detail.component').then(m => m.TicketDetailComponent)
      },
      {
        path: 'compare',
        loadComponent: () => import('./features/compare/compare.component').then(m => m.CompareComponent)
      }
    ]
  },

  // Admin shell routes
  {
    path: 'admin',
    component: AdminShellComponent,
    canActivate: [AuthGuard, AdminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'cars/pending',
        loadComponent: () => import('./features/admin/pending-cars/admin-pending-cars.component').then(m => m.AdminPendingCarsComponent)
      },
      {
        path: 'orders/pending',
        loadComponent: () => import('./features/admin/pending-orders/admin-pending-orders.component').then(m => m.AdminPendingOrdersComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./features/admin/users/admin-users.component').then(m => m.AdminUsersComponent)
      },
      {
        path: 'feedback',
        loadComponent: () => import('./features/admin/feedback/admin-feedback.component').then(m => m.AdminFeedbackComponent)
      },
      {
        path: 'tickets',
        loadComponent: () => import('./features/admin/tickets/admin-tickets.component').then(m => m.AdminTicketsComponent)
      },
      {
        path: 'tickets/:id',
        loadComponent: () => import('./features/admin/ticket-detail/admin-ticket-detail.component').then(m => m.AdminTicketDetailComponent)
      }
    ]
  },

  { path: '**', component: NotFoundComponent }
];
