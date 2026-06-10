# Plan 02 — Shared components

Re-skin the reusable building blocks so every page inherits the new look. Depends on Plan 01.

Read first (every task): `frontend/DESIGN-REVAMP.md` section 2.3, and `frontend/revamp-plans/01-foundation.md` Task 1.6 (icon map).

---

## Task 2.1 — status-chip

Read first: `frontend/src/app/shared/components/status-chip/status-chip.component.ts`, `frontend/src/app/core/pipes/status-label.pipe.ts`, `frontend/src/app/core/pipes/status-class.pipe.ts`.

Action: Render each status as a pill: `font-family: var(--font-mono); font-size: 12px; padding: 4px 10px; border-radius: var(--radius-input);`. Use the human label from `status-label` pipe. Apply text color + 12% fill per enum:
- `PENDING_ADMIN_APPROVAL`, `PENDING_SELLER_APPROVAL`: text `var(--warning)`, bg `rgba(255,159,10,0.12)`.
- `APPROVED`, `SUCCESS`: text `var(--success)`, bg `rgba(48,209,88,0.12)`.
- `REJECTED`, `FAILED`: text `var(--danger)`, bg `rgba(255,69,58,0.12)`.
- `OPEN`: text `var(--accent)`, bg `var(--accent-wash)`.
- `CANCELLED`, `CLOSED`: text `var(--neutral-chip)`, bg `rgba(142,142,147,0.14)`.
Keep the existing `@Input()` status name. Do not show raw enum text.

Acceptance criteria:
- `grep -c "font-mono" status-chip.component.ts` returns `>=1`.
- `grep -c "rgba(48,209,88,0.12)" status-chip.component.ts` returns `>=1`.
- `grep -c "var(--warning)" status-chip.component.ts` returns `>=1`.
- `npm run build` exits 0.

---

## Task 2.2 — empty-state

Read first: `frontend/src/app/shared/components/empty-state/empty-state.component.ts`.

Action: Center content, `padding: 96px 24px` (`py-24`). Structure: one Phosphor icon `<i>` at `font-size: 48px; color: var(--text-tertiary)` (icon name from an `@Input() icon` defaulting to `ph ph-car`), one title line using class `.h3`, one sub-line using `.body` (max ~15 words), and an optional projected CTA slot (`<ng-content>`). Inputs: `icon`, `title`, `message`. Remove any clip-art image.

Acceptance criteria:
- `grep -c "ph ph-" empty-state.component.ts` returns `>=1`.
- `grep -c "text-tertiary" empty-state.component.ts` returns `>=1`.
- `grep -c "@Input()" empty-state.component.ts` returns `>=3`.
- `npm run build` exits 0.

---

## Task 2.3 — skeleton (replace loading-spinner default)

Read first: `frontend/src/app/shared/components/loading-spinner/loading-spinner.component.ts`.

Action: Add an `@Input() variant: 'card' | 'row' | 'detail' | 'spinner' = 'card'`. For `card`/`row`/`detail`, render `.skeleton` blocks shaped like the final layout (card: a 4:3 block + two short bars; row: a 48px square + bars; detail: a large block + a side column of bars). For `spinner` only, keep a small inline spinner for button-busy use. Do not delete the component; widen it.

Acceptance criteria:
- `grep -c "class=\"skeleton\"\|'skeleton'\|skeleton" loading-spinner.component.ts` returns `>=1`.
- `grep -c "variant" loading-spinner.component.ts` returns `>=1`.
- `npm run build` exits 0.

---

## Task 2.4 — confirm-dialog and feedback-dialog chrome

Read first: `frontend/src/app/shared/components/confirm-dialog/confirm-dialog.component.ts`, `frontend/src/app/shared/components/feedback-dialog/feedback-dialog.component.ts`.

Action: Dialog surface uses `background: var(--surface-3); border-radius: var(--radius-dialog); border: 1px solid var(--hairline)`. Title `.h3`, body `.body`. confirm-dialog: confirm action uses `.btn .btn-danger` when destructive (else `.btn .btn-primary`), cancel uses `.btn .btn-ghost`. feedback-dialog: rating uses Phosphor stars `ph ph-star` in `var(--warning)`; submit is `.btn .btn-primary`. (The CDK backdrop is themed globally; no per-dialog backdrop edit needed.)

Acceptance criteria:
- `grep -c "surface-3" confirm-dialog.component.ts` returns `>=1`.
- `grep -c "btn-ghost" confirm-dialog.component.ts` returns `>=1`.
- `grep -c "ph ph-star" feedback-dialog.component.ts` returns `>=1`.
- `npm run build` exits 0.

---

## Task 2.5 — toast service surface

Read first: `frontend/src/app/shared/components/toast/toast.service.ts`.

Action: If the toast uses MatSnackBar, attach a panel class per variant (`toast-success`, `toast-error`, `toast-info`) and define those classes in `frontend/src/styles.scss` (global, because snackbar renders in an overlay): each is `background: var(--surface-3); color: var(--text-primary); border-left: 3px solid <semantic>` where semantic = `--success` / `--danger` / `--accent`. Keep auto-dismiss at ~4000ms.

Acceptance criteria:
- `grep -c "toast-success\|toast-error\|toast-info" frontend/src/styles.scss` returns `>=1`.
- `grep -c "var(--surface-3)" frontend/src/styles.scss` returns `>=1`.
- `npm run build` exits 0.

---

## Task 2.6 — car-card (the workhorse)

Read first: `frontend/src/app/shared/components/car-card/car-card.component.ts`, `frontend/src/app/core/models/car.model.ts`, `frontend/src/app/core/pipes/inr-currency.pipe.ts`.

Action: Rebuild the card markup/styles (keep existing `@Input() car` and any existing output events):
- Root: `<a>` link to `/cars/{{car.id}}`, class `.surface-card`, `overflow: hidden`, hover lifts `translateY(-2px)` and swaps bg to `var(--surface-2)` (transition `var(--dur) var(--ease)`).
- Image: `aspect-ratio: 4/3; object-fit: cover; width: 100%`. `src` = `https://picsum.photos/seed/{{car.make}}-{{car.model}}-{{car.id}}/600/450`. On hover, `transform: scale(1.03)` inside the clipped root. `alt` = `"{{car.make}} {{car.model}}"`.
- Wishlist heart: absolutely positioned top-right over the image, Phosphor `ph ph-heart`, fills `var(--danger)` when saved. Emit the existing toggle output (do not invent new service calls). Stop click propagation so it does not navigate.
- Body (`padding: 16px`): title `<div class="h3">{{car.make}} {{car.model}}</div>`; meta line `<span class="mono">{{car.year}}</span> · <span class="mono">{{car.mileage}} km</span>` in `var(--text-secondary)`; price `<div class="mono" style="font-size:20px">{{ car.price | inrCurrency }}</div>`.
- Use a single middle-dot separator max in the meta line.

Acceptance criteria:
- `grep -c "picsum.photos/seed" car-card.component.ts` returns `1`.
- `grep -c "aspect-ratio: 4/3\|aspect-ratio:4/3" car-card.component.ts` returns `>=1`.
- `grep -c "ph ph-heart" car-card.component.ts` returns `>=1`.
- `grep -c "mat-icon" car-card.component.ts` returns `0`.
- `grep -c "surface-card" car-card.component.ts` returns `>=1`.
- `npm run build` exits 0.

---

## Plan 02 done when
- `npm run build` exits 0.
- `grep -rc "mat-icon" frontend/src/app/shared` returns 0.
- car-card shows real photos, mono numbers, and a Phosphor heart.
