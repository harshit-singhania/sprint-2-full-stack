# Plan 06 — Seller + orders (my-listings, list-car, edit-car, my-orders, order-detail)

Depends on Plans 01-03.

Read first (every task): `frontend/DESIGN-REVAMP.md` sections 3.6, 3.7, 3.8.

---

## Task 6.1 — my-listings

Read first: `frontend/src/app/features/my-listings/my-listings.component.ts`, `my-listings.component.scss`, `frontend/src/app/core/services/car.service.ts`, status-chip, confirm-dialog.

Action:
- Header row: `<h2 class="h2">Your listings</h2>` left, a "List a car" `.btn .btn-primary` right routing to `/my-listings/new`.
- Rich rows (not cards) on `.surface-card`, one `1px solid var(--hairline)` divider between rows (never top+bottom on each): a `48px` square thumbnail (picsum seed), Make Model (`.h3`), price (`.mono`), `<app-status-chip>`, views (`.mono` + `ph ph-eye`), and a right action cluster: Edit `.btn .btn-ghost` (`ph ph-pencil-simple`) to `/my-listings/{{id}}/edit`, Delete `.btn .btn-ghost` (`ph ph-trash`, hover `color: var(--danger)`) opening confirm-dialog.
- Under any pending row, a one-line helper in `var(--text-tertiary)`: "Awaiting admin review before it appears in Browse."
- States: skeleton rows (`variant="row"`); empty `<app-empty-state title="You have not listed a car yet" message="Create your first listing to start selling.">` + "List a car" CTA; deletion = confirm-dialog then optimistic row removal + toast.

Acceptance criteria:
- `grep -c "Your listings" my-listings.component.ts` returns `>=1`.
- `grep -c "ph ph-trash" my-listings.component.ts` returns `>=1`.
- `grep -c "app-status-chip\|status-chip" my-listings.component.ts` returns `>=1`.
- `grep -c "mat-icon" my-listings.component.ts` returns `0`.
- `npm run build` exits 0.

---

## Task 6.2 — list-car and edit-car (shared form treatment)

Read first: `frontend/src/app/features/my-listings/list-car/list-car.component.ts`, `frontend/src/app/features/my-listings/edit-car/edit-car.component.ts`, `frontend/src/app/core/models/car.model.ts`, `frontend/src/app/core/services/car.service.ts`.

Action (apply the same styling to both):
- Single centered column `max-width: 640px` on `var(--bg-base)`. Page title `.h2`: "List your car" (list-car) / "Edit listing" (edit-car).
- Group fields under section subheads (`.h3`), not one long stack:
  - "The basics": Make, Model, Year, Color (Color shows a small swatch preview next to the input).
  - "Condition and price": Mileage, Price, Available (an Apple-style toggle switch that is `var(--accent)` when on, not a checkbox).
  - "Details": Description textarea with a `.mono` char count.
- Inputs styled per Plan 04 Task 4.1 (hairline border, accent focus ring), labels ABOVE, helper text present, inline validation below per backend rules (year >= 1900, mileage >= 0, price required).
- Image affordance: a dashed `1px var(--hairline)` drop zone with `ph ph-upload-simple` and "Drag photos or browse" + thumbnail previews with remove buttons. If backend upload is unavailable, show the zone disabled with note "Photos coming soon" rather than omitting it.
- Footer: sticky bar within the form with "Cancel" `.btn .btn-ghost` + primary `.btn .btn-primary` "Publish listing" (list) / "Save changes" (edit); busy state on submit; success toast; route to `/my-listings`. For edit add the line "Edits go back to admin review before going live." in `var(--text-tertiary)`.
- Keep existing reactive form + validators; restyle only.

Acceptance criteria:
- `grep -c "The basics\|Condition and price" list-car.component.ts` returns `>=1`.
- `grep -c "ph ph-upload-simple" list-car.component.ts` returns `>=1`.
- `grep -c "Save changes\|back to admin review" edit-car.component.ts` returns `>=1`.
- `grep -c "mat-icon" list-car.component.ts edit-car.component.ts` returns `0`.
- `npm run build` exits 0.

---

## Task 6.3 — my-orders

Read first: `frontend/src/app/features/my-orders/my-orders.component.ts`, `my-orders.component.scss`, `frontend/src/app/core/models/order.model.ts`, `frontend/src/app/core/services/order.service.ts`, status-chip.

Action:
- `<h2 class="h2">Your orders</h2>`. A segmented filter at top: All / Buying / Selling (filters by whether the current user is buyer or seller; reuse existing user id source).
- Rows on `.surface-card`: car thumbnail + Make Model, amount (`.mono`), order date (`.mono`), an order `<app-status-chip>` and a payment `<app-status-chip>`. Rows link to `/my-orders/{{id}}`.
- States: skeleton rows; empty `<app-empty-state title="No orders yet" message="When you buy or sell a car it shows up here.">` + "Browse cars" CTA.

Acceptance criteria:
- `grep -c "Your orders" my-orders.component.ts` returns `>=1`.
- `grep -c "Buying\|Selling" my-orders.component.ts` returns `>=1`.
- `grep -c "app-status-chip\|status-chip" my-orders.component.ts` returns `>=1`.
- `grep -c "mat-icon" my-orders.component.ts` returns `0`.
- `npm run build` exits 0.

---

## Task 6.4 — order-detail (the multi-step approval is the star)

Read first: `frontend/src/app/features/my-orders/order-detail/order-detail.component.ts`, `order-detail.component.scss`, `frontend/src/app/core/models/order.model.ts`, `frontend/src/app/core/services/order.service.ts`.

Action:
- A vertical stepper with 4 nodes: 1 Order placed (payment status), 2 Admin approval, 3 Seller approval, 4 Completed. Done nodes use `var(--accent)`; upcoming use `var(--text-tertiary)`; the current node pulses subtly (disabled under reduced motion). A rejected/cancelled order shows a terminal `var(--danger)` node with the reason. Derive node states from the order `status` enum (PENDING_ADMIN_APPROVAL, PENDING_SELLER_APPROVAL, APPROVED, REJECTED, CANCELLED).
- Panels (`.surface-card` each): Car summary (thumb, title, price); Parties (buyer + seller name and phone in `.mono`, with a "You are the buyer"/"You are the seller" tag); Payment (method, masked token, amount, a `ph ph-warning` fraud badge in `var(--warning)` when `fraudAlert` is true); Timeline of status changes with `.mono` timestamps.
- Seller actions: if the viewer is the selling user AND status is `PENDING_SELLER_APPROVAL`, show "Approve sale" `.btn .btn-primary` and "Reject sale" `.btn .btn-ghost` (danger on hover), each via confirm-dialog and the existing order service calls; refresh the stepper on success. Hide otherwise.
- States: skeleton (`variant="detail"`); not-found for a bad id; busy state on the action buttons.

Acceptance criteria:
- `grep -c "PENDING_SELLER_APPROVAL" order-detail.component.ts` returns `>=1`.
- `grep -c "ph ph-warning" order-detail.component.ts` returns `>=1`.
- `grep -c "Approve sale\|Reject sale" order-detail.component.ts` returns `>=1`.
- `grep -c "mat-icon" order-detail.component.ts` returns `0`.
- `npm run build` exits 0.

---

## Plan 06 done when
- `npm run build` exits 0.
- Seller/order pages are dark, mono numbers, accent CTAs, the order-detail stepper reflects the real status enum, and all states present.
