# Plan 05 — Buyer flow (browse, car-detail, purchase-dialog, wishlist, compare)

The storefront and conversion path. Depends on Plans 01-03 (uses car-card and shells).

Read first (every task): `frontend/DESIGN-REVAMP.md` sections 3.3, 3.4, 3.5, 3.10; and `car-card` from Plan 02.

---

## Task 5.1 — browse

Read first: `frontend/src/app/features/browse/browse.component.ts`, `browse.component.scss`, `frontend/src/app/core/services/car.service.ts`, `frontend/src/app/shared/components/car-card/car-card.component.ts`.

Action:
- Hero band: full-width `aspect-ratio: 21/9` image `https://picsum.photos/seed/marketplace-hero-dusk/1920/820` with bottom scrim. Overlaid: `<h1 class="display">The used car, done properly.</h1>` + one `.body` sub-line (max 18 words) + the existing search/filter control. Keep hero content within the first viewport; cap top padding at 96px.
- Filter bar under hero: a single row `.surface-card` with `border-radius: var(--radius-pill)`, containing the existing filter controls styled as quiet pill dropdowns (Make, Price, Year, Mileage, Color) plus a Sort control (Newest, Price, Popularity). Active filters render as removable chips below the bar. No left sidebar.
- Popular rail: a horizontal scroll-snap row of car-cards bound to the existing `getPopularCars()` output (`overflow-x: auto; scroll-snap-type: x mandatory`). Section heading `.h2` "Popular this week".
- Main grid: `display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px` of car-cards from the existing available-cars source.
- Trust strip: 3 quiet columns (Browse / Buy with approval / Drive away) each a Phosphor icon + short label. This is the only allowed 3-up.
- States: while loading show a grid of 8 `<app-loading-spinner variant="card">`; empty (filtered to nothing) shows `<app-empty-state title="No cars match these filters" message="Try widening your search.">` with a "Clear filters" `.btn .btn-ghost`; error shows a retry button.
- Mobile: single-column grid; filter bar becomes a "Filters" button.

Acceptance criteria:
- `grep -c "picsum.photos/seed/marketplace-hero-dusk" browse.component.ts browse.component.scss` returns `>=1`.
- `grep -c "auto-fill, minmax(300px" browse.component.ts browse.component.scss` returns `>=1`.
- `grep -c "scroll-snap-type" browse.component.ts browse.component.scss` returns `>=1`.
- `grep -c "app-empty-state\|empty-state" browse.component.ts` returns `>=1`.
- `grep -c "mat-icon" browse.component.ts` returns `0`.
- `npm run build` exits 0.

---

## Task 5.2 — car-detail

Read first: `frontend/src/app/features/car-detail/car-detail.component.ts`, `car-detail.component.scss`, `frontend/src/app/core/models/car.model.ts`, `frontend/src/app/core/services/car.service.ts`, `frontend/src/app/core/services/wishlist.service.ts`.

Action:
- Two-column layout on `lg+` (gallery left, sticky purchase rail right); single column on mobile.
- Gallery: large `aspect-ratio: 16/10` primary image `https://picsum.photos/seed/{{car.make}}-{{car.model}}-{{car.id}}/1280/800`; a thumbnail strip below (reuse the same seed with `-2`, `-3` suffixes for variety). Clicking opens a full-screen lightbox (frosted backdrop) with arrow nav.
- Purchase rail: `.surface-card`, sticky `top: 80px`. Contents: title `<span class="mono">{{car.year}}</span> {{car.make}} {{car.model}}` (class `.h2`); price `.mono` large; an `<app-status-chip>`; primary `.btn .btn-primary` full-width "Buy now" that opens purchase-dialog; secondary "Add to wishlist" `.btn .btn-ghost` with `ph ph-heart` (calls existing wishlist service); "Contact seller" reveals seller name + phone in `.mono`; one reassurance line (max 12 words) in `var(--text-tertiary)`.
- Specs: a 2-column card grid (NOT a bordered table). Each cell = label in `var(--text-secondary)` + value in `.mono` large: Mileage, Year, Color (+ swatch), Listed date, Views. Use `.surface-card` cells or hairline-separated cells, never `border-bottom` per row.
- Description: `.body` block.
- Compare: a `.btn .btn-ghost` "Compare" that adds this car to the compare tray (Task 5.5).
- States: full skeleton (`<app-loading-spinner variant="detail">`) on load; if car id invalid show a not-found message; disable "Buy now" when the car is the viewer's own listing or not available, with a tooltip reason.
- Mobile: gallery, then a STICKY bottom bar with price + "Buy now", then specs, then description.

Acceptance criteria:
- `grep -c "aspect-ratio: 16/10\|aspect-ratio:16/10" car-detail.component.ts car-detail.component.scss` returns `>=1`.
- `grep -c "app-status-chip\|status-chip" car-detail.component.ts` returns `>=1`.
- `grep -c "Buy now" car-detail.component.ts` returns `>=1`.
- `grep -c "border-bottom" car-detail.component.ts car-detail.component.scss` returns `0` (no spec-row borders).
- `grep -c "mat-icon" car-detail.component.ts` returns `0`.
- `npm run build` exits 0.

---

## Task 5.3 — purchase-dialog

Read first: `frontend/src/app/features/car-detail/purchase-dialog/purchase-dialog.component.ts`, `frontend/src/app/core/services/order.service.ts` (existing purchase call; do not change its signature).

Action: 3-step calm flow in the themed dialog surface:
- Step 1 Review: car thumbnail + price summary.
- Step 2 Payment: a segmented control (Card / UPI / Net banking) writing the existing `paymentMethod` field; a payment token input; a `ph ph-lock-simple` icon with label "Secure simulated checkout".
- Step 3 Confirm: primary `.btn .btn-primary` "Place order" with busy state on submit.
- On success: in-dialog success screen with a large `ph ph-check-circle` in `var(--success)`, "Order placed", order id in `.mono`, the line "It now awaits admin and seller approval.", and a "View order" `.btn .btn-primary` routing to `/my-orders/{{orderId}}`.
- On payment failure: `var(--danger)` state with a "Try again" button.

Acceptance criteria:
- `grep -c "ph ph-lock-simple" purchase-dialog.component.ts` returns `>=1`.
- `grep -c "ph ph-check-circle" purchase-dialog.component.ts` returns `>=1`.
- `grep -c "awaits admin and seller approval" purchase-dialog.component.ts` returns `>=1`.
- `grep -c "mat-icon" purchase-dialog.component.ts` returns `0`.
- `npm run build` exits 0.

---

## Task 5.4 — wishlist

Read first: `frontend/src/app/features/wishlist/wishlist.component.ts`, `frontend/src/app/core/services/wishlist.service.ts`, car-card.

Action:
- Header: `<h2 class="h2">Saved cars</h2>` + a count in `.mono`.
- Body: the same grid as browse, reusing `<app-car-card>` with a pre-filled heart; removing a card animates it out (opacity + height) and decrements the count.
- Empty: `<app-empty-state icon="ph ph-heart" title="Nothing saved yet" message="Tap the heart on a car and it lands here.">` with a "Browse cars" `.btn .btn-primary` to `/browse`.
- Mobile: single column.

Acceptance criteria:
- `grep -c "app-car-card\|car-card" wishlist.component.ts` returns `>=1`.
- `grep -c "Saved cars" wishlist.component.ts` returns `>=1`.
- `grep -c "app-empty-state\|empty-state" wishlist.component.ts` returns `>=1`.
- `grep -c "mat-icon" wishlist.component.ts` returns `0`.
- `npm run build` exits 0.

---

## Task 5.5 — compare + compare tray

Read first: `frontend/src/app/features/compare/` (the compare component .ts), `frontend/src/app/core/models/car.model.ts`, `frontend/src/app/core/services/car.service.ts`.

Action:
- Compare page: two cars side by side on `.surface-card`. Top: each car photo (picsum seed) + title + price. Below: a spec matrix where each row = label (`var(--text-secondary)`) and two `.mono` value columns; highlight the better value (lower price, lower mileage, newer year) with `color: var(--accent)` and a `ph ph-caret-up` marker. Use sparse hairlines between spec GROUPS only, not per row.
- Compare tray: a small frosted floating bar (`position: fixed; bottom: 16px`) that appears when a car is added from browse/detail, showing up to 2 selected thumbnails and a "Compare" `.btn .btn-primary` linking to the compare route. Store selection in a lightweight signal/service in the compare feature (do not touch backend services).
- States: empty "Add two cars to compare."; one selected prompts to add a second.
- Mobile: stack the two cars vertically with a sticky spec-label column.

Acceptance criteria:
- `grep -rc "var(--accent)" frontend/src/app/features/compare` returns `>=1`.
- `grep -rc "mono" frontend/src/app/features/compare` returns `>=1`.
- `grep -rc "position: fixed\|position:fixed" frontend/src/app/features/compare` returns `>=1` (tray).
- `grep -rc "mat-icon" frontend/src/app/features/compare` returns `0`.
- `npm run build` exits 0.

---

## Plan 05 done when
- `npm run build` exits 0.
- Browse, detail, wishlist, compare are dark with real photography, mono numbers, accent CTAs, and full loading/empty/error states.
