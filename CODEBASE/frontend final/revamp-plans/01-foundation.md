# Plan 01 — Foundation: fonts, icons, dark tokens, Material dark theme

Goal: the whole app turns dark, Apple-grade, on Geist + Phosphor. After this plan, every existing page already looks dark (even before per-page polish) because all color comes from tokens and the Material theme.

Read first (every task): `frontend/DESIGN-REVAMP.md` sections 1 and 5.

---

## Task 1.1 — Install Geist fonts and Phosphor icons

Read first: `frontend/package.json`.

Action — from `frontend/`, run:
```
npm install @fontsource/geist-sans@^5 @fontsource/geist-mono@^5 @phosphor-icons/web@^2
```
If those exact versions 404, install without the version range: `npm install @fontsource/geist-sans @fontsource/geist-mono @phosphor-icons/web`.

Acceptance criteria:
- `frontend/package.json` dependencies contain `@fontsource/geist-sans`, `@fontsource/geist-mono`, and `@phosphor-icons/web`.
- `frontend/node_modules/@phosphor-icons/web` directory exists.
- `npm run build` still exits 0.

---

## Task 1.2 — Wire fonts/icons in, remove Google Fonts links

Read first: `frontend/src/index.html`, `frontend/src/styles.scss`.

Action:
1. In `frontend/src/index.html`, DELETE the three font/icon links (the `preconnect` to googleapis/gstatic, the `Outfit` stylesheet link, and the `Material+Icons` link). Leave the favicon link.
2. At the very TOP of `frontend/src/styles.scss` (above the existing `@import 'styles/theme';`), add these imports:
```
@import '@fontsource/geist-sans/400.css';
@import '@fontsource/geist-sans/500.css';
@import '@fontsource/geist-sans/600.css';
@import '@fontsource/geist-mono/400.css';
@import '@fontsource/geist-mono/500.css';
@import '@phosphor-icons/web/regular/style.css';
@import '@phosphor-icons/web/thin/style.css';
```

Acceptance criteria:
- `grep -c "googleapis" frontend/src/index.html` returns `0`.
- `grep -c "Material+Icons" frontend/src/index.html` returns `0`.
- `grep -c "geist-sans/600.css" frontend/src/styles.scss` returns `1`.
- `grep -c "@phosphor-icons/web/regular/style.css" frontend/src/styles.scss` returns `1`.
- `npm run build` exits 0.

---

## Task 1.3 — Replace the light token block with the dark Apple palette

Read first: `frontend/src/styles.scss` (the full `:root { ... }` block).

Action: Replace the ENTIRE existing `:root { ... }` block in `frontend/src/styles.scss` with the block below verbatim. Keep the `@import` lines from Task 1.2 above it.
```
:root {
  /* Surfaces */
  --bg-base:        #0B0B0F;
  --surface-1:      #141418;
  --surface-2:      #1C1C22;
  --surface-3:      #26262E;

  /* Hairlines */
  --hairline:        rgba(255,255,255,0.08);
  --hairline-strong: rgba(255,255,255,0.14);

  /* Text */
  --text-primary:   #F5F5F7;
  --text-secondary: #A1A1A6;
  --text-tertiary:  #6E6E73;

  /* Accent (the only chromatic action color) */
  --accent:        #0A84FF;
  --accent-hover:  #3D9BFF;
  --accent-wash:   rgba(10,132,255,0.12);

  /* Semantic (chips and inline icons only) */
  --success:       #30D158;
  --warning:       #FF9F0A;
  --danger:        #FF453A;
  --neutral-chip:  #8E8E93;

  /* Fonts */
  --font-sans: "Geist Sans", system-ui, -apple-system, sans-serif;
  --font-mono: "Geist Mono", ui-monospace, "SF Mono", monospace;

  /* Radius (locked scale) */
  --radius-input:  10px;
  --radius-card:   16px;
  --radius-dialog: 20px;
  --radius-pill:   999px;

  /* Elevation (light, not hard shadow) */
  --elev-card: 0 1px 0 rgba(255,255,255,0.04) inset, 0 12px 32px rgba(0,0,0,0.40);

  /* Motion */
  --ease: cubic-bezier(0.16, 1, 0.3, 1);
  --dur: 240ms;
}
```

Acceptance criteria:
- `grep -c "color-primary" frontend/src/styles.scss` returns `0` (old light tokens gone).
- `grep -c -- "--bg-base:        #0B0B0F" frontend/src/styles.scss` returns `1`.
- `grep -c -- "--accent:        #0A84FF" frontend/src/styles.scss` returns `1`.
- `grep -c -- "--font-mono" frontend/src/styles.scss` returns `1`.
- `npm run build` exits 0.

---

## Task 1.4 — Swap Angular Material to a dark theme

Read first: `frontend/src/styles/theme.scss` (the full current light theme).

Action: Replace the entire body of `frontend/src/styles/theme.scss` with the dark theme below. This builds a custom dark theme whose background is `--bg-base`/`--surface-1` and whose primary is the accent blue.
```
@use '@angular/material' as mat;

$accent-primary: mat.define-palette(mat.$blue-palette, 500, 300, 700);
$accent-accent:  mat.define-palette(mat.$blue-palette, 400);
$warn:           mat.define-palette(mat.$red-palette, 400);

$dark-theme: mat.define-dark-theme((
  color: (
    primary: $accent-primary,
    accent: $accent-accent,
    warn: $warn,
  ),
  typography: mat.define-typography-config(
    $font-family: '"Geist Sans", system-ui, sans-serif',
  ),
  density: 0,
));

@include mat.all-component-themes($dark-theme);

/* Force Material surfaces onto our tokens */
.mat-mdc-card,
.mat-mdc-dialog-container .mdc-dialog__surface,
.mat-mdc-menu-panel,
.mat-mdc-select-panel,
.mat-mdc-autocomplete-panel {
  background-color: var(--surface-1) !important;
  color: var(--text-primary) !important;
}
.mat-mdc-dialog-container .mdc-dialog__surface { border-radius: var(--radius-dialog) !important; }
.mat-mdc-snack-bar-container .mdc-snackbar__surface { background-color: var(--surface-3) !important; }
```

Acceptance criteria:
- `grep -c "define-dark-theme" frontend/src/styles/theme.scss` returns `1`.
- `grep -c "define-light-theme" frontend/src/styles/theme.scss` returns `0`.
- `grep -c "Geist Sans" frontend/src/styles/theme.scss` returns `1`.
- `npm run build` exits 0.

---

## Task 1.5 — Global element + utility styles

Read first: `frontend/src/styles.scss` (after Task 1.3).

Action: APPEND to the bottom of `frontend/src/styles.scss`:
```
* { box-sizing: border-box; }
html, body { height: 100%; }
body {
  margin: 0;
  background: var(--bg-base);
  color: var(--text-primary);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
}

/* Numbers everywhere */
.mono { font-family: var(--font-mono); font-feature-settings: "tnum" 1; }

/* Type scale helpers */
.display { font-size: clamp(40px, 6vw, 72px); font-weight: 600; letter-spacing: -0.03em; line-height: 1.05; }
.h2 { font-size: clamp(28px, 3vw, 34px); font-weight: 600; letter-spacing: -0.02em; }
.h3 { font-size: 19px; font-weight: 500; letter-spacing: -0.01em; }
.body { font-size: 16px; line-height: 1.6; color: var(--text-secondary); max-width: 65ch; }
.eyebrow { font-size: 13px; font-weight: 500; color: var(--text-tertiary); }

/* App buttons (use alongside Material or on plain buttons) */
.btn { font-family: var(--font-sans); font-weight: 500; border: 0; cursor: pointer;
  transition: transform var(--dur) var(--ease), background var(--dur) var(--ease); }
.btn:active { transform: scale(0.98); }
.btn-primary { background: var(--accent); color: var(--text-primary); border-radius: var(--radius-pill);
  padding: 12px 22px; }
.btn-primary:hover { background: var(--accent-hover); }
.btn-ghost { background: transparent; color: var(--text-primary); border: 1px solid var(--hairline);
  border-radius: var(--radius-input); padding: 10px 18px; }
.btn-ghost:hover { background: var(--surface-2); }
.btn-danger { background: var(--danger); color: var(--text-primary); border-radius: var(--radius-input); padding: 10px 18px; }

/* Phosphor sizing default */
i[class^="ph"], i[class*=" ph"] { font-size: 20px; line-height: 1; vertical-align: middle; }

/* Card surface */
.surface-card { background: var(--surface-1); border: 1px solid var(--hairline);
  border-radius: var(--radius-card); box-shadow: var(--elev-card); }

/* Focus ring */
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

/* Page container */
.page { max-width: 1280px; margin: 0 auto; padding: 0 24px; }
@media (max-width: 768px) { .page { padding: 0 16px; } }

/* Skeleton shimmer */
@keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
.skeleton { background: linear-gradient(90deg, var(--surface-1) 25%, var(--surface-2) 37%, var(--surface-1) 63%);
  background-size: 800px 100%; animation: shimmer 1.4s infinite linear; border-radius: var(--radius-card); }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; }
}
```

Acceptance criteria:
- `grep -c "background: var(--bg-base)" frontend/src/styles.scss` returns `>=1`.
- `grep -c ".btn-primary" frontend/src/styles.scss` returns `>=1`.
- `grep -c ".skeleton" frontend/src/styles.scss` returns `>=1`.
- `npm run build` exits 0.

---

## Task 1.6 — Phosphor icon mapping reference (used by all later plans)

This task creates no code. It is the canonical Material-Icon to Phosphor map every later task uses when replacing `<mat-icon>name</mat-icon>` with `<i class="ph ph-NAME"></i>`.

| Material icon (common) | Phosphor class |
|---|---|
| favorite / favorite_border | `ph ph-heart` |
| shopping_cart / sell | `ph ph-shopping-bag` |
| directions_car / car | `ph ph-car` |
| visibility | `ph ph-eye` |
| visibility_off | `ph ph-eye-slash` |
| edit | `ph ph-pencil-simple` |
| delete | `ph ph-trash` |
| add | `ph ph-plus` |
| check / check_circle | `ph ph-check` / `ph ph-check-circle` |
| close / cancel | `ph ph-x` / `ph ph-x-circle` |
| warning / report | `ph ph-warning` |
| search | `ph ph-magnifying-glass` |
| menu | `ph ph-list` |
| logout | `ph ph-sign-out` |
| person / account | `ph ph-user` |
| dashboard | `ph ph-squares-four` |
| people / group | `ph ph-users` |
| feedback / star | `ph ph-star` |
| support / help | `ph ph-lifebuoy` |
| chat / message | `ph ph-chat-circle` |
| arrow_back | `ph ph-arrow-left` |
| arrow_forward / chevron_right | `ph ph-arrow-right` / `ph ph-caret-right` |
| lock | `ph ph-lock-simple` |
| upload / cloud_upload | `ph ph-upload-simple` |
| phone | `ph ph-phone` |
| email / mail | `ph ph-envelope` |

Acceptance criteria: none (reference only). Later tasks cite this table.

---

## Plan 01 done when
- `npm run build` exits 0.
- App boots dark: `grep -c -- "--bg-base" frontend/src/styles.scss` is 1 and body uses it.
- `grep -rc "googleapis" frontend/src/index.html` is 0.
- Phosphor + Geist appear in `package.json`.
