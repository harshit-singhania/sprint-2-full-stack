# Plan 04 — Auth pages (login, register)

First impression. No shell. Depends on Plans 01-02.

Read first (every task): `frontend/DESIGN-REVAMP.md` sections 3.1 and 3.2.

---

## Task 4.1 — login

Read first: `frontend/src/app/features/auth/login/login.component.ts`, `login.component.scss`, `frontend/src/app/core/services/auth.service.ts` (for the existing login method/fields, do not change it).

Action:
- Layout: CSS grid 2 columns on `min-width: 1024px`, single column below. Left panel: full-bleed image `https://picsum.photos/seed/dark-coupe-night/1200/1600`, `object-fit: cover`, with a bottom scrim `linear-gradient(to top, rgba(11,11,15,0.85), transparent 60%)` and one overlaid line in class `.display` (font-size capped ~40px here): "Find the one that's been waited for." Wordmark top-left.
- Right panel: centered form, `max-width: 360px`, on `var(--bg-base)`.
- Form fields (label ABOVE input, never placeholder-as-label): Username, Password. Inputs: `background: var(--surface-1); border: 1px solid var(--hairline); border-radius: var(--radius-input); color: var(--text-primary); padding: 12px 14px`. Focus: `border-color: var(--hairline-strong); box-shadow: 0 0 0 3px var(--accent-wash)`.
- Password field has a show/hide toggle using `ph ph-eye` / `ph ph-eye-slash`.
- Submit: full-width `.btn .btn-primary` labeled "Sign in"; while pending show inline 16px spinner + "Signing in" and disable.
- Below form: "New here? " + an `<a>` to `/register` styled `color: var(--accent)` reading "Create an account".
- Error state: invalid credentials render an inline message below the form in `var(--danger)` (NOT a toast); password border turns `var(--danger)`.
- Mobile: left image becomes a `40vh` top banner above the form.

Acceptance criteria:
- `grep -c "picsum.photos/seed/dark-coupe-night" login.component.ts login.component.scss` returns `>=1`.
- `grep -c "ph ph-eye" login.component.ts` returns `>=1`.
- `grep -c "btn-primary" login.component.ts` returns `>=1`.
- `grep -c "var(--danger)" login.component.ts login.component.scss` returns `>=1`.
- `grep -c "mat-icon" login.component.ts` returns `0`.
- `npm run build` exits 0.

---

## Task 4.2 — register

Read first: `frontend/src/app/features/auth/register/register.component.ts`, `register.component.scss`, `frontend/src/app/core/services/auth.service.ts`, `frontend/src/app/core/models/user.model.ts`.

Action:
- Same split-screen chrome as login; left image `https://picsum.photos/seed/car-lineup-studio/1200/1600`. Form `max-width: 420px`, single column.
- Fields, each with a persistent helper line in `var(--text-tertiary)` and inline error below on blur:
  - Full name. Helper: "As it appears on your documents." Live-validate Title Case words (backend rule).
  - Username.
  - Phone number. Helper: "10-digit Indian mobile." Live-validate `^[6-9]\d{9}$`; show `ph ph-check` in `var(--success)` when valid.
  - Email.
  - Password. Add a 4-segment strength bar (segments fill `var(--accent)`); show/hide toggle.
  - Role: a segmented pill toggle (USER / ADMIN), default USER. Note in `var(--text-tertiary)`: "Admin registration may be restricted." Do not use a dropdown.
- Submit: full-width `.btn .btn-primary` "Create account". On success route to `/login` and fire toast "Account created. Please sign in." (use existing toast service).
- Server error (duplicate username/email) surfaces above the button in `var(--danger)`.
- Reuse the existing reactive form / validators where present; only restyle and add the helper/validation display. Do not change auth.service calls.

Acceptance criteria:
- `grep -c "picsum.photos/seed/car-lineup-studio" register.component.ts register.component.scss` returns `>=1`.
- `grep -c "As it appears" register.component.ts` returns `>=1` (helper present).
- `grep -c "ph ph-check" register.component.ts` returns `>=1`.
- `grep -c "USER\|ADMIN" register.component.ts` returns `>=1` (segmented role).
- `grep -c "mat-icon" register.component.ts` returns `0`.
- `npm run build` exits 0.

---

## Plan 04 done when
- `npm run build` exits 0.
- Both auth pages are dark split-screen with real photography, label-above inputs, accent CTA, inline errors.
