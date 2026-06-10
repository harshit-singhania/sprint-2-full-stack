# Plan 07 — Support tickets + Admin pages + Not Found

Depends on Plans 01-03.

Read first (every task): `frontend/DESIGN-REVAMP.md` sections 3.9, 3.11, and all of section 4.

---

## Task 7.1 — my-tickets

Read first: `frontend/src/app/features/tickets/my-tickets.component.ts`, `frontend/src/app/core/services/ticket.service.ts`, status-chip.

Action: `<h2 class="h2">Support</h2>` + "New request" `.btn .btn-primary` to `/tickets/new`. Rows on `.surface-card`: subject (`.h3`), last-activity time (`.mono`), `<app-status-chip>` (Open/Closed). Empty: `<app-empty-state icon="ph ph-lifebuoy" title="No requests yet" message="Open a request and our team will reply in the thread.">` + "New request" CTA.

Acceptance criteria:
- `grep -c "New request" my-tickets.component.ts` returns `>=1`.
- `grep -c "app-status-chip\|status-chip" my-tickets.component.ts` returns `>=1`.
- `grep -c "mat-icon" my-tickets.component.ts` returns `0`.
- `npm run build` exits 0.

---

## Task 7.2 — create-ticket

Read first: `frontend/src/app/features/tickets/create-ticket/create-ticket.component.ts`, ticket.service.ts.

Action: Centered `max-width: 560px` form: Subject input, Description textarea with `.mono` char count, "Submit request" `.btn .btn-primary`. Helper in `var(--text-tertiary)`: "Our team replies in the thread; you will be notified." Inputs styled per Plan 04 Task 4.1. On success route to `/tickets` + toast.

Acceptance criteria:
- `grep -c "Submit request" create-ticket.component.ts` returns `>=1`.
- `grep -c "replies in the thread" create-ticket.component.ts` returns `>=1`.
- `grep -c "mat-icon" create-ticket.component.ts` returns `0`.
- `npm run build` exits 0.

---

## Task 7.3 — ticket-detail (chat thread)

Read first: `frontend/src/app/features/tickets/ticket-detail/ticket-detail.component.ts`, `ticket-detail.component.scss`, `frontend/src/app/core/models/ticket.model.ts`, ticket.service.ts.

Action:
- Header: subject + `<app-status-chip>`.
- Thread: message bubbles. Ticket-owner messages right-aligned, `background: var(--accent-wash); color: var(--text-primary)`. Admin messages left-aligned, `background: var(--surface-2)`. Each bubble shows sender name (`.mono`, small) + timestamp (`.mono`). Determine side using the existing sender/role field on each reply.
- Composer: sticky bottom, a textarea + a "Send" icon button `.btn .btn-primary` (`ph ph-paper-plane-tilt`). Disabled when ticket status is CLOSED, with a note "This request is closed."
- States: skeleton bubbles on load; new message appended optimistically.

Acceptance criteria:
- `grep -c "accent-wash" ticket-detail.component.ts ticket-detail.component.scss` returns `>=1`.
- `grep -c "This request is closed" ticket-detail.component.ts` returns `>=1`.
- `grep -c "mat-icon" ticket-detail.component.ts` returns `0`.
- `npm run build` exits 0.

---

## Task 7.4 — admin dashboard

Read first: `frontend/src/app/features/admin/dashboard/admin-dashboard.component.ts`, `admin-dashboard.component.scss`, `frontend/src/app/core/services/admin.service.ts`.

Action:
- KPI row: 4 quiet metric tiles (NOT heavy cards), separated by generous gaps or hairlines: Pending Cars, Pending Orders, Total Revenue, Open Tickets. Each tile = label (`var(--text-secondary)`) + big value in `.mono` (`font-size: 40px`). Bind to existing dashboard data fields.
- "Needs your attention": two columns, left = latest pending listings (mini rows with inline Approve/Reject), right = latest pending orders. Each links into the full queue.
- Optional revenue line chart only if real data exists: single `var(--accent)` stroke, mono axis labels, no gridline clutter. Otherwise omit (do not fake numbers).
- States: skeleton tiles; empty queues show a quiet "All clear" with `ph ph-check`.

Acceptance criteria:
- `grep -c "mono" admin-dashboard.component.ts` returns `>=1` (metric values mono).
- `grep -c "Needs your attention\|Pending Cars" admin-dashboard.component.ts` returns `>=1`.
- `grep -c "mat-icon" admin-dashboard.component.ts` returns `0`.
- `npm run build` exits 0.

---

## Task 7.5 — admin pending-cars

Read first: `frontend/src/app/features/admin/pending-cars/admin-pending-cars.component.ts`, admin.service.ts, status-chip, confirm-dialog.

Action: A review queue. Each pending listing = a wide row/card on `.surface-card`: thumbnail, Make Model Year (title + `.mono` year), price (`.mono`), seller name (`.mono`), submitted date (`.mono`). Right side: "Approve" `.btn .btn-primary` and "Reject" `.btn .btn-ghost` (danger hover), each via confirm-dialog and existing service calls. Clicking the row expands an inline preview (specs + description + larger photo). States: skeleton; empty "No listings awaiting review" with `ph ph-check`; each action animates the row out.

Acceptance criteria:
- `grep -c "Approve" admin-pending-cars.component.ts` returns `>=1`.
- `grep -c "No listings awaiting review" admin-pending-cars.component.ts` returns `>=1`.
- `grep -c "mat-icon" admin-pending-cars.component.ts` returns `0`.
- `npm run build` exits 0.

---

## Task 7.6 — admin pending-orders (fraud emphasis)

Read first: `frontend/src/app/features/admin/pending-orders/admin-pending-orders.component.ts`, `frontend/src/app/core/models/order.model.ts`, admin.service.ts, status-chip.

Action: Queue rows: order id (`.mono`), car Make Model, buyer and seller (`.mono`), amount (`.mono`), payment `<app-status-chip>`, and a prominent fraud-alert badge in `var(--warning)` with `ph ph-warning` when `fraudAlert` is true. Flagged orders get a subtle `3px` left bar in `var(--warning)`. Actions: "Approve" / "Reject" with confirm-dialog. States: skeleton; empty "No orders awaiting approval".

Acceptance criteria:
- `grep -c "fraudAlert" admin-pending-orders.component.ts` returns `>=1`.
- `grep -c "ph ph-warning" admin-pending-orders.component.ts` returns `>=1`.
- `grep -c "var(--warning)" admin-pending-orders.component.ts` returns `>=1`.
- `grep -c "mat-icon" admin-pending-orders.component.ts` returns `0`.
- `npm run build` exits 0.

---

## Task 7.7 — admin users (data table)

Read first: `frontend/src/app/features/admin/users/admin-users.component.ts`, `frontend/src/app/core/models/user.model.ts`, admin.service.ts.

Action: A clean data table. Columns: avatar+name, username (`.mono`), email, phone (`.mono`), role chip (accent for ADMIN, neutral for USER), joined date (`.mono`). Row hover `background: var(--surface-2)`. Header row in `.mono` small, `var(--text-secondary)`, sticky. Search input top-right. Tight row height (~52px), single `1px var(--hairline)` between rows, no per-cell borders. States: skeleton rows; empty/search-no-results.

Acceptance criteria:
- `grep -c "surface-2" admin-users.component.ts admin-users.component.scss` returns `>=1`.
- `grep -c "mono" admin-users.component.ts` returns `>=1`.
- `grep -c "mat-icon" admin-users.component.ts` returns `0`.
- `npm run build` exits 0.

---

## Task 7.8 — admin feedback

Read first: `frontend/src/app/features/admin/feedback/admin-feedback.component.ts`, `frontend/src/app/core/models/feedback.model.ts`, `frontend/src/app/core/services/feedback.service.ts`.

Action: Feedback as a card grid. Each card (`.surface-card`): rating as filled `ph ph-star` icons in `var(--warning)`, the comment in `.body`, author name + date in `.mono`. Clamp long comments with a "Read more". Top: an average-rating summary (big `.mono` number + stars) and total count. States: skeleton; empty "No feedback yet".

Acceptance criteria:
- `grep -c "ph ph-star" admin-feedback.component.ts` returns `>=1`.
- `grep -c "Read more\|No feedback yet" admin-feedback.component.ts` returns `>=1`.
- `grep -c "mat-icon" admin-feedback.component.ts` returns `0`.
- `npm run build` exits 0.

---

## Task 7.9 — admin tickets + admin ticket-detail

Read first: `frontend/src/app/features/admin/tickets/admin-tickets.component.ts`, `frontend/src/app/features/admin/ticket-detail/admin-ticket-detail.component.ts`, ticket.service.ts, status-chip.

Action:
- admin-tickets: queue table: subject, requester (`.mono`), `<app-status-chip>`, last activity (`.mono`). Filter tabs Open / Closed / All with an Open count badge.
- admin-ticket-detail: reuse the SAME bubble styling as Task 7.3 (admin composes from the agent side). Add header controls: a status segmented toggle (Open / Closed) and the reply composer. Closing posts a final reply and updates the chip via existing service calls.

Acceptance criteria:
- `grep -c "Open\|Closed\|All" admin-tickets.component.ts` returns `>=1`.
- `grep -c "accent-wash\|surface-2" admin-ticket-detail.component.ts admin-ticket-detail.component.scss` returns `>=1`.
- `grep -rc "mat-icon" frontend/src/app/features/admin/tickets frontend/src/app/features/admin/ticket-detail` returns `0`.
- `npm run build` exits 0.

---

## Task 7.10 — not-found

Read first: `frontend/src/app/features/not-found/not-found.component.ts`.

Action: Centered on `var(--bg-base)`: a large `.mono` "404", `<h3 class="h3">This page took a wrong turn.</h3>`, one `.body` line, and a "Back to Browse" `.btn .btn-primary` to `/browse`. Optional faint background image (`https://picsum.photos/seed/night-road/1600/900`) at `opacity: 0.15`.

Acceptance criteria:
- `grep -c "404" not-found.component.ts` returns `>=1`.
- `grep -c "Back to Browse" not-found.component.ts` returns `>=1`.
- `grep -c "mat-icon" not-found.component.ts` returns `0`.
- `npm run build` exits 0.

---

## Plan 07 done when
- `npm run build` exits 0.
- All support + admin pages dark, mono numbers, accent CTAs; ticket threads consistent; full states.

---

## FINAL whole-revamp verification (run after all plans)
- `npm run build` exits 0.
- `grep -rc "mat-icon" frontend/src/app` returns 0.
- `grep -rn "#000\b\|#fff\b\|#000000\|#ffffff" frontend/src/app frontend/src/styles.scss frontend/src/styles/theme.scss` returns nothing.
- `grep -c "googleapis" frontend/src/index.html` returns 0.
- Manual: every route loads dark with no light panel, real car photos present, numbers in mono.
