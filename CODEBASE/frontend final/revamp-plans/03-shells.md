# Plan 03 — Shells (user + admin)

The frames every page sits in. Depends on Plans 01-02.

Read first (every task): `frontend/DESIGN-REVAMP.md` sections 2.1 and 2.2, Plan 01 Task 1.6 (icon map).

---

## Task 3.1 — user-shell

Read first: `frontend/src/app/shells/user-shell/user-shell.component.html`, `.scss`, `.ts`.

Action:
- Top bar: sticky, height `64px`, `background: rgba(20,20,24,0.72); backdrop-filter: blur(20px) saturate(180%); border-bottom: 1px solid var(--hairline)`. Add a `@media (prefers-reduced-transparency: reduce)` fallback `background: var(--surface-1)`.
- Left: wordmark text in `font-family: var(--font-sans); font-weight: 600; font-size: 18px; color: var(--text-primary)` linking to `/browse`.
- Nav links (desktop, single line): Browse `/browse`, Wishlist `/wishlist`, My Listings `/my-listings`, My Orders `/my-orders`, Support `/tickets`. Use `routerLinkActive`: active link = `color: var(--text-primary)` with a `2px solid var(--accent)` bottom border; inactive = `color: var(--text-secondary)`.
- Wishlist link shows a mono count badge when count > 0 (reuse whatever count source already exists; if none, omit the badge, do not add service logic).
- Account: a circular avatar button (initials, `.mono`, `background: var(--surface-3)`) opening a Material menu (`--surface-3`) with a Logout item (Phosphor `ph ph-sign-out`) calling the existing logout method.
- Mobile (`max-width: 768px`): hide the inline nav, show a `ph ph-list` hamburger that toggles a right-side panel (`background: var(--surface-1)`, full height) with the same links stacked, each >=44px tall.
- Wrap `<router-outlet>` in a `.page` container.
- Replace all `<mat-icon>` with Phosphor per the map.

Acceptance criteria:
- `grep -c "backdrop-filter" user-shell.component.scss user-shell.component.html user-shell.component.ts` returns `>=1`.
- `grep -c "prefers-reduced-transparency" user-shell.component.scss user-shell.component.html user-shell.component.ts` returns `>=1`.
- `grep -c "routerLinkActive" user-shell.component.html user-shell.component.ts` returns `>=1`.
- `grep -rc "mat-icon" frontend/src/app/shells/user-shell` returns `0`.
- `grep -c "ph ph-sign-out" user-shell.component.html user-shell.component.ts` returns `>=1`.
- `npm run build` exits 0.

---

## Task 3.2 — admin-shell

Read first: `frontend/src/app/shells/admin-shell/admin-shell.component.html`, `.scss`, `.ts`.

Action:
- Drop all indigo. Sidebar `width: 256px`, `background: var(--surface-1)`, `border-right: 1px solid var(--hairline)`. At top a tiny label `<div class="eyebrow mono">ADMIN</div>`.
- Sidebar items (Phosphor icon + label, `color: var(--text-secondary)`): Dashboard `/admin/dashboard` `ph ph-squares-four`; Pending Cars `/admin/cars/pending` `ph ph-car`; Pending Orders `/admin/orders/pending` `ph ph-shopping-bag`; Users `/admin/users` `ph ph-users`; Feedback `/admin/feedback` `ph ph-star`; Support `/admin/tickets` `ph ph-lifebuoy`.
- Active item (`routerLinkActive`): `background: var(--accent-wash); color: var(--text-primary)` with a `3px` left bar in `var(--accent)`.
- Top bar: slim `56px`, frosted like the user shell, current page title on left (`.h3`), account menu on right (same as user shell).
- Mobile: sidebar becomes an overlay `mat-sidenav` toggled by a `ph ph-list` hamburger.
- Replace all `<mat-icon>` with Phosphor.

Acceptance criteria:
- `grep -c "1A237E\|indigo\|#1E293B" admin-shell.component.scss admin-shell.component.html admin-shell.component.ts` returns `0`.
- `grep -c "accent-wash" admin-shell.component.scss admin-shell.component.html admin-shell.component.ts` returns `>=1`.
- `grep -c "ph ph-squares-four" admin-shell.component.html admin-shell.component.ts` returns `>=1`.
- `grep -rc "mat-icon" frontend/src/app/shells/admin-shell` returns `0`.
- `npm run build` exits 0.

---

## Plan 03 done when
- `npm run build` exits 0.
- Both shells are dark with frosted bars; no indigo; no Material Icons; accent active states.
