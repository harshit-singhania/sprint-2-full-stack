# Design Revamp — Executor Plan Set (codex-mini)

Standalone implementation plans for the Apple-grade dark redesign. No GSD. Built for a small executor model (gpt 5.4 codex mini): every task gives concrete values, exact file paths, files to read first, and grep/build-checkable acceptance criteria. Do tasks in file order; each file is self-contained once its predecessors are done.

## Source of truth
- Design contract: `frontend/DESIGN-REVAMP.md` (READ THIS FIRST, every session).
- This folder turns that contract into ordered tasks.

## Ground truth about the current code (do not assume otherwise)
- Angular 17 standalone components. Routing in `frontend/src/app/app.routes.ts`.
- Global styles: `frontend/src/styles.scss` (CSS custom properties, currently LIGHT) + `frontend/src/styles/theme.scss` (Angular Material LIGHT theme).
- Current font is **Outfit** loaded via Google Fonts `<link>` in `frontend/src/index.html`. Current icons are **Material Icons** (`<mat-icon>`), also via `<link>`.
- **Phosphor icons and Geist fonts are NOT installed yet.** Plan 01 installs them.
- Most feature components use **inline `template:` and `styles:`** inside the `.ts` file. Shells (`user-shell`, `admin-shell`) use external `.html` + `.scss`. A handful of features have a `.scss` file. When a task says "edit the template/styles," edit them wherever they live for that component (inline in `.ts` unless an external file exists).
- Pipes already exist: `core/pipes/status-class.pipe.ts`, `status-label.pipe.ts`, `inr-currency.pipe.ts`. Reuse them; do not duplicate.
- Services already exist under `core/services/`. Do NOT change service logic in this revamp; visual only.

## Execution order
1. `01-foundation.md` — fonts, icons, dark tokens, Material dark theme, global element styles. **Everything depends on this.**
2. `02-shared-components.md` — status-chip, empty-state, skeleton (replaces loading-spinner), dialogs, toast, car-card.
3. `03-shells.md` — user-shell, admin-shell.
4. `04-auth.md` — login, register.
5. `05-buyer.md` — browse, car-detail, purchase-dialog, wishlist, compare.
6. `06-seller-orders.md` — my-listings, list-car, edit-car, my-orders, order-detail.
7. `07-support-admin.md` — tickets (3), admin dashboard + 5 admin pages, not-found.

## Global rules (apply to EVERY task)
- **Never use `#000` or `#fff`.** Use `--bg-base` / `--text-primary`.
- **One accent only:** `--accent` (`#0A84FF`). Status colors live only inside chips/inline icons.
- **No em-dashes** in any visible UI string. Use periods, commas, or hyphens.
- **Numbers** (price, year, mileage, ids, dates, counts) render in the mono font via class `.mono`.
- **Replace every `<mat-icon>`** with a Phosphor `<i>` per Plan 01's mapping. Do not leave Material Icons.
- **Radius scale (locked):** cards/images `16px`, inputs/chips `10px`, primary CTA `pill (999px)`, dialogs `20px`.
- Touch targets >= 44px on mobile. Keep `:focus-visible` rings (`--accent`).
- Every list/detail page must keep its loading, empty, and error states (upgrade them, do not delete them).

## How to verify any task
- Build still compiles: from `frontend/`, run `npm run build` and confirm it exits 0.
- Token presence: `grep -n "TOKEN" frontend/src/styles.scss`.
- No leftover Material Icons in a touched component: `grep -c "mat-icon" <file>` returns `0` after that component's task.
- Visual checks are listed per task as concrete strings/classes that must exist.

## Definition of done for the whole revamp
- `npm run build` exits 0.
- `grep -rn "mat-icon" frontend/src/app` returns 0 (all icons migrated).
- `grep -rn "#000\b\|#fff\b\|#ffffff\|#000000" frontend/src/app frontend/src/styles*` returns 0 (no pure black/white).
- `frontend/src/index.html` has no Google Fonts `<link>` (fonts are self-hosted/bundled).
- Every page renders on `--bg-base` with the dark Material theme; no light panels.
