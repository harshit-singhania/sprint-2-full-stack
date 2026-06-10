# Used Cars Frontend

An Angular 17 single-page application for a used-car marketplace platform. Users can browse, list, purchase, and manage cars; admins get a full management dashboard with analytics.

---

## Tech Stack

| Layer | Library / Tool |
|---|---|
| Framework | Angular 17 (standalone components) |
| UI | Angular Material 17 + custom SCSS |
| Icons | Phosphor Icons (`@phosphor-icons/web`) |
| Fonts | Geist Sans & Geist Mono (`@fontsource`) |
| HTTP | Angular `HttpClient` with a session-token interceptor |
| Routing | Angular Router with lazy-loaded feature routes |
| Forms | Angular Reactive Forms |
| Build | Angular CLI 17 / Vite dev server |

---

## Prerequisites

- **Node.js** 18 or later
- **npm** 9 or later
- **Angular CLI** 17 — install globally once:
  ```bash
  npm install -g @angular/cli@17
  ```
- The **Spring Boot backend** running on `http://localhost:8081` (see `src/environments/environment.ts`)

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server (opens http://localhost:4200 automatically)
ng serve --open
```

The app hot-reloads on every file save.

### Production build

```bash
ng build
# Output → dist/used-cars-frontend/
```

---

## Project Structure

```
src/
├── app/
│   ├── app.config.ts          # Root providers (router, HttpClient, interceptors, animations)
│   ├── app.routes.ts          # All routes — auth, user shell, admin shell
│   ├── core/
│   │   ├── guards/            # AuthGuard, AdminGuard
│   │   ├── interceptors/      # AuthInterceptor — injects X-Session-Token header
│   │   ├── models/            # TypeScript interfaces (Car, Order, Ticket, Review …)
│   │   ├── pipes/             # InrCurrencyPipe, StatusClassPipe, StatusLabelPipe
│   │   ├── services/          # AuthService, CarService, OrderService, WishlistService …
│   │   └── utils/             # car-images.ts — maps make/model to local image assets
│   ├── features/
│   │   ├── auth/              # Login, Register
│   │   ├── browse/            # Car listing with filters, popular carousel, recent views
│   │   ├── car-detail/        # Full car spec page + purchase dialog
│   │   ├── compare/           # Side-by-side car comparison with score bars
│   │   ├── my-listings/       # Seller's listings + list/edit car forms
│   │   ├── my-orders/         # Buyer/seller order list + order detail + receipt
│   │   ├── tickets/           # Support ticket list, create, and threaded chat detail
│   │   ├── wishlist/          # Saved cars
│   │   ├── not-found/         # 404 page
│   │   └── admin/             # All admin pages (see below)
│   ├── shared/
│   │   └── components/        # CarCard, ConfirmDialog, EmptyState, FeedbackDialog,
│   │                          #   LoadingSpinner, StatusChip, Toast
│   └── shells/
│       ├── user-shell/        # Navbar + sidebar layout for authenticated users
│       └── admin-shell/       # Sidebar layout for admin with dynamic page title
├── assets/
│   └── car_images/            # Local car images (webp / jpeg)
├── environments/
│   ├── environment.ts         # Dev  → apiBaseUrl: http://localhost:8081
│   └── environment.prod.ts    # Prod → apiBaseUrl (configure before deploying)
└── styles/
    └── theme.scss             # Angular Material custom theme + global tokens
```

---

## Features

### User Side

| Feature | Description |
|---|---|
| **Browse** | Grid of available cars with live filters (make, year, price, colour, sort). Includes a "Popular Cars" carousel and recently viewed section. |
| **Car Detail** | Full spec sheet with image gallery, seller info, seller star rating, and a "Buy Now" dialog with simulated payment. |
| **Wishlist** | Save/unsave cars from browse or detail; view saved cars on a dedicated page. |
| **Compare** | Pick up to 2 cars and get a side-by-side spec comparison with winner highlights and visual score bars. |
| **My Listings** | List a car for sale, edit a listing, delete it. New/edited listings go to admin approval queue. |
| **My Orders** | View all purchase orders (as buyer or seller). Seller can approve or reject incoming sales. Download receipt for approved orders. |
| **Support Tickets** | Create support tickets and have a threaded chat conversation with admin. |

### Admin Side (`/admin`)

| Feature | Description |
|---|---|
| **Dashboard** | Platform KPIs — total users, cars, orders, revenue, open tickets, fraud alerts. |
| **Graphs** | Line/bar charts (orders, revenue, listings — last 30 days) and pie charts (order status, car approval breakdown). |
| **Pending Cars** | Review and approve or reject user-submitted car listings. |
| **Pending Orders** | Approve or reject orders in the first approval step. |
| **All Orders** | Full order history with status chips and receipt download. |
| **Users** | View all registered users, edit their profile, reset passwords. |
| **Feedback** | Read all user-submitted platform feedback. |
| **Support Tickets** | View all tickets, reply to any ticket, open or close tickets. |

---

## Authentication Flow

1. Register at `/register` (role `USER`; only one `ADMIN` account allowed).
2. Log in at `/login` — the server returns a `sessionToken`.
3. The `AuthInterceptor` automatically attaches `X-Session-Token: <token>` to every HTTP request.
4. `AuthGuard` redirects unauthenticated users to `/login`.
5. `AdminGuard` redirects non-admin users away from `/admin`.
6. Logout invalidates the server session and clears `localStorage`.

Session data stored in `localStorage`: `session_token`, `user_role`, `username`, `user_id`.

---

## Environment Configuration

Edit `src/environments/environment.ts` to point at your backend:

```ts
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8081'   // ← change this
};
```

For production builds, update `src/environments/environment.prod.ts` accordingly.

---

## API Reference

See [`API_SCHEMA.md`](./API_SCHEMA.md) for the full REST API contract, request/response shapes, validation rules, and the complete frontend flow summary.

---

## Available Scripts

| Command | Purpose |
|---|---|
| `ng serve` | Start dev server at `http://localhost:4200` |
| `ng build` | Production build → `dist/` |
| `ng build --watch` | Incremental dev build |
| `ng test` | Run unit tests with Karma + Jasmine |
| `ng generate component <name>` | Scaffold a new component |

---

## Known Warnings

- **Bundle size**: The initial bundle (~428 kB) exceeds the default 500 kB budget warning. This is expected given Angular Material and the feature set; all feature routes are lazy-loaded to keep the initial load reasonable.
- **compare.component.scss**: Slightly over the 8 kB per-file style budget due to the detailed comparison table layout.

Both are warnings only — the build and the app function correctly.
