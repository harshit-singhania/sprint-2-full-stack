# Design Revamp Spec — Apple-Grade Dark Mode

> Instruction-only redesign brief. No code here. Every page in the app has a dedicated section.
> Goal: kill the stock Angular Material look and rebuild as a production-grade, dark, Apple-inspired marketplace.
> Stack stays Angular 17 + SCSS. We re-skin Angular Material rather than replace it.

---

## 0. The core idea

Apple's product surfaces feel expensive because of **restraint, depth, and typography**, not decoration. Three principles drive every page:

1. **One quiet near-black canvas, content floats on it in layers.** Hierarchy comes from subtle elevation and spacing, never from boxes-inside-boxes.
2. **Type does the work.** A tight, confident grotesque at large display sizes, generous line-height for body, numbers in mono. Color is almost monochrome; one blue accent carries all action.
3. **Photography is the hero.** This is a car marketplace. Real, cinematic car imagery is the single biggest lift from "slop" to "product." A text-and-card page is incomplete.

Page theme is **dark, locked**. No section ever flips to a light panel. (A future light mode is a token swap, not a per-section decision.)

---

## 1. Design tokens

### 1.1 Color — Apple system palette, dark

Define these as CSS custom properties on `:root` and consume everywhere. This replaces the entire current `--color-*` set and the Material blue.

| Token | Value | Use |
|---|---|---|
| `--bg-base` | `#0B0B0F` | The one page background. Near-black, faint cool tint. Never pure `#000`. |
| `--surface-1` | `#141418` | Cards, nav bar, sidebar, form panels. |
| `--surface-2` | `#1C1C22` | Hover state of surface-1, raised tiles, table row hover. |
| `--surface-3` | `#26262E` | Menus, popovers, dialogs, dropdowns. |
| `--hairline` | `rgba(255,255,255,0.08)` | All borders and dividers. This replaces every `1px solid #E0E0E0`. |
| `--hairline-strong` | `rgba(255,255,255,0.14)` | Focused input border, active tab underline base. |
| `--text-primary` | `#F5F5F7` | Headings, body. Apple off-white, not `#fff`. |
| `--text-secondary` | `#A1A1A6` | Labels, metadata, helper text. |
| `--text-tertiary` | `#6E6E73` | Placeholders, disabled, timestamps. |
| `--accent` | `#0A84FF` | THE accent. iOS dark system blue. Every primary CTA, active nav, focus ring, link, progress fill, stepper. Locked for the whole app. |
| `--accent-hover` | `#3D9BFF` | CTA hover only. |
| `--accent-wash` | `rgba(10,132,255,0.12)` | Selected-row tint, active-nav background, focus glow. |
| `--success` | `#30D158` | APPROVED, payment success. Used as chip text + 12% fill, never large areas. |
| `--warning` | `#FF9F0A` | PENDING states, fraud-alert badge. |
| `--danger` | `#FF453A` | REJECTED, delete, payment failure, errors. |
| `--neutral-chip` | `#8E8E93` | CANCELLED, CLOSED. |

Accent discipline: blue is the ONLY chromatic action color. Status colors appear only inside small chips and inline icons, never as section backgrounds or buttons (except destructive = danger).

### 1.2 Status chip mapping (re-skin the existing `status-chip` component)

Chips are low-alpha fills with colored text, pill shape, `font-mono` `12px` `letter-spacing 0`, `padding 4px 10px`. Keep the existing human labels.

| Enum | Label | Text color | Fill |
|---|---|---|---|
| `PENDING_ADMIN_APPROVAL` | Pending Review | `--warning` | `rgba(255,159,10,0.12)` |
| `PENDING_SELLER_APPROVAL` | Awaiting Seller | `--warning` | `rgba(255,159,10,0.12)` |
| `APPROVED` | Approved | `--success` | `rgba(48,209,88,0.12)` |
| `REJECTED` | Rejected | `--danger` | `rgba(255,69,58,0.12)` |
| `CANCELLED` | Cancelled | `--neutral-chip` | `rgba(142,142,147,0.14)` |
| `SUCCESS` | Payment Successful | `--success` | `rgba(48,209,88,0.12)` |
| `FAILED` | Payment Failed | `--danger` | `rgba(255,69,58,0.12)` |
| `OPEN` | Open | `--accent` | `--accent-wash` |
| `CLOSED` | Closed | `--neutral-chip` | `rgba(142,142,147,0.14)` |

### 1.3 Typography

Replace Roboto entirely. **Self-host Geist** (display + text) and **Geist Mono**. Do not link Google Fonts. Geist is SF-adjacent and reads as Apple without copying it.

| Role | Font | Spec |
|---|---|---|
| Display (hero, page H1) | Geist | `clamp(40px, 6vw, 72px)`, weight 600, `letter-spacing -0.03em`, `line-height 1.05` |
| Section heading (H2) | Geist | `28–34px`, weight 600, `letter-spacing -0.02em` |
| Card title / H3 | Geist | `18–20px`, weight 500, `letter-spacing -0.01em` |
| Body | Geist | `16px`, weight 400, `line-height 1.6`, color `--text-secondary`, `max-width 65ch` |
| Label / eyebrow | Geist | `13px`, weight 500, `--text-tertiary`. Use eyebrows sparingly (see §1.7). |
| Numbers: price, mileage, year, VIN, IDs, dates, dashboard metrics | **Geist Mono** | tabular, `--text-primary`. This single move makes the data feel engineered. |

Emphasis inside a headline = same font, heavier weight or the accent color. Never inject a serif. No em-dashes anywhere in UI copy (use periods, commas, or hyphens).

### 1.4 Spacing, radius, elevation

- **Spacing:** keep the 4px scale. Be more generous than the current spec: page vertical rhythm `py-16` to `py-24` on marketing surfaces, `py-10` on dense admin tables.
- **Radius (locked, one scale):** cards/panels/images `16px`; inputs/chips/small controls `10px`; buttons `full pill` for primary CTAs, `10px` for secondary/icon buttons; dialogs `20px`. Do not mix other radii.
- **Elevation:** Apple uses light, not shadow, for depth in dark mode. Cards get `background: --surface-1` + `1px --hairline` + a soft ambient shadow `0 1px 0 rgba(255,255,255,0.04) inset, 0 12px 32px rgba(0,0,0,0.4)`. No hard black drop shadows. Raise on hover by swapping to `--surface-2` and lifting `translateY(-2px)`.

### 1.5 Motion

`cubic-bezier(0.16, 1, 0.3, 1)` for all transitions, `200–280ms`. Specifics: route changes cross-fade + 8px rise; cards lift on hover; CTAs `scale(0.98)` on `:active`; lists stagger-reveal on first paint (`60ms` cascade) using `IntersectionObserver`, not scroll listeners. Everything above gentle micro-interaction collapses to instant under `prefers-reduced-motion: reduce`. No parallax, no marquees, no scroll-hijack in a transactional app.

### 1.6 Imagery (the most important rule)

Cars must be shown as real photography, never as a gray `mat-icon` placeholder.

- **Source:** ideally generate or use licensed automotive photography. Fallback while building: `https://picsum.photos/seed/{make}-{model}-{id}/{w}/{h}` so every car is deterministic.
- **Treatment for cohesion:** apply a uniform look so mixed stock feels like one brand. Slightly cool, slightly desaturated (`saturate(0.9)`), and a bottom-up scrim `linear-gradient(to top, rgba(11,11,15,0.85), transparent 60%)` on any image that carries text.
- **Aspect ratios:** card thumb `4:3`; detail gallery `16:10`; hero `21:9` letterbox.
- **Empty image fallback:** if a listing truly has no photo, show a `--surface-2` tile with a thin Phosphor car icon at `--text-tertiary` and the make/model in mono, not a broken image.

### 1.7 Iconography

Replace Material Icons (ligature font) with **Phosphor Icons**, "regular" or "thin" weight only, one consistent stroke. Phosphor's fine line weight is the Apple-adjacent move. One family across the whole app. Never hand-draw SVG paths.

### 1.8 Eyebrow + decoration discipline

Max one small uppercase eyebrow per ~3 sections. No section-number labels (`01 / Browse`), no decorative status dots before nav items, no version stamps, no "scroll" cues, no locale/time strips. The headline alone names the section.

---

## 2. Shared shells and components

### 2.1 User shell (`shells/user-shell`)

Replace the blue `mat-toolbar`.

- **Top bar:** height `64px`, `background: rgba(20,20,24,0.72)` with `backdrop-filter: blur(20px) saturate(180%)`, bottom `1px --hairline`. Sticky. This frosted bar over scrolling car photos is the signature Apple-glass moment. Provide a solid `--surface-1` fallback under `prefers-reduced-transparency`.
- **Left:** wordmark in Geist 600, 18px (e.g. "Carbon Market" or keep current name), no logo icon needed.
- **Center/right nav (single line, desktop):** Browse, Wishlist, My Listings, My Orders, Support. Active item = `--text-primary` with a 2px `--accent` underline that slides between items on navigation. Inactive = `--text-secondary`. Account menu = avatar circle (initials in mono on `--surface-3`) opening a `--surface-3` popover with Logout.
- **Wishlist** gets a small count badge (mono) when > 0.
- **Mobile (< 768px):** collapse nav to a right-side hamburger opening a full-height `--surface-1` sheet sliding from the right; items stacked, 44px touch targets.
- **Content container:** `max-width 1280px`, `margin auto`, `padding 0 24px` (`0 16px` mobile).

### 2.2 Admin shell (`shells/admin-shell`)

Drop the indigo. Admin shares the same dark canvas; it reads as "pro mode," not a different product.

- **Sidebar:** `256px` fixed (`md+`), `background --surface-1`, right `1px --hairline`. Section label "ADMIN" in tiny mono `--text-tertiary` at top. Nav items: Dashboard, Pending Cars, Pending Orders, Users, Feedback, Support. Each item: Phosphor icon + label, `--text-secondary`; active item gets `--accent-wash` background, `--text-primary` text, and a 3px left `--accent` bar. Pending Cars / Pending Orders / Support show a mono count chip when items await action.
- **Top bar:** slim `56px`, frosted like the user shell, shows current page title (H3) on the left and the same account menu on the right.
- **Mobile:** sidebar becomes an overlay `mat-sidenav` toggled by a hamburger.

### 2.3 Shared components

- **car-card:** see §3.3, this is the workhorse.
- **status-chip:** re-skin per §1.2.
- **empty-state:** centered, generous `py-24`. Thin Phosphor icon (48px, `--text-tertiary`), one H3 line, one `--text-secondary` sub-line (max ~15 words), one primary CTA when an action exists. No illustration clip-art.
- **loading-spinner → skeletons.** Remove the circular spinner as the default. Each list/detail page shows skeletons that match final layout: shimmering `--surface-1 → --surface-2` blocks at the real card/row shape. Spinner only for inline button-busy states (16px, inside the button).
- **confirm-dialog:** `--surface-3`, radius 20px, frosted backdrop `rgba(0,0,0,0.6) blur(8px)`. Title H3, body `--text-secondary`, destructive action uses `--danger` solid, cancel is ghost.
- **feedback-dialog / purchase-dialog:** same dialog chrome.
- **toast:** bottom-center, `--surface-3` pill, `1px --hairline`, Phosphor status icon in the semantic color, auto-dismiss 4s, slide-up + fade. Success/error/info variants by icon + a 3px left accent in the semantic color.

---

## 3. User-facing pages

### 3.1 Login (`features/auth/login`)

Auth pages have no shell, so they are a chance for a real first impression.

- **Layout:** split screen, 50/50 on `lg+`. **Left:** full-bleed cinematic car photograph (a moody three-quarter front shot, cool tone) with the bottom-scrim and a single line of overlaid copy in display type: "Find the one that's been waited for." Wordmark top-left. **Right:** the form, vertically centered on `--bg-base`, `max-width 360px`.
- **Form:** label-above-input (never placeholder-as-label). Inputs are `--surface-1`, `1px --hairline`, radius 10px, `--text-primary` text, focus = `--hairline-strong` border + `--accent` 2px ring (`box-shadow 0 0 0 3px --accent-wash`). Fields: Username, Password (with show/hide eye toggle). Primary CTA "Sign in" full-width pill in `--accent`. Below: "New here? Create an account" with the word "Create an account" as an `--accent` link to `/register`.
- **States:** invalid credentials = inline error below the form in `--danger` (not a toast), the password field border turns `--danger`. Button shows inline 16px spinner + "Signing in" while pending, disabled. Respect autofill styling (dark autofill background).
- **Mobile:** image becomes a short `40vh` top banner, form below; or drop the image to a thin gradient header if vertical space is tight.

### 3.2 Register (`features/auth/register`)

- **Layout:** same split-screen chrome as login for consistency; different photo (a lineup/detail shot). Form `max-width 420px`.
- **Form:** single column. Fields with helper text rendered in markup at all times (Apple-style proactive guidance), error below on blur:
  - Full name — helper "As it appears on your documents." Backend requires Title Case words; show the rule, validate live.
  - Username
  - Phone number — helper "10-digit Indian mobile." Live-validate the `[6-9]\d{9}` rule; show a green Phosphor check when valid.
  - Email
  - Password — with a thin strength meter (a 4-segment bar in `--accent`, no big filled track) and show/hide.
  - Role — segmented control (USER / ADMIN) styled as a pill toggle, not a dropdown. Default USER. Note in `--text-tertiary`: admin registration may be restricted.
- **CTA:** "Create account" pill, full width. Success routes to login with a toast "Account created. Please sign in."
- **States:** field-level errors inline; a server error (duplicate username/email) surfaces above the button in `--danger`.

### 3.3 Browse (`features/browse`) — the home/marketplace

This is the storefront and the page that most needs to stop looking like slop.

- **Hero band:** full-width `21:9` letterbox of a hero car photo with the frosted nav floating over it. Overlaid: display H1 "The used car, done properly." + one `--text-secondary` sub-line (max 18 words) + a search/filter affordance. Hero content stays within the initial viewport; `pt` capped so it does not float. One CTA only if needed; the search bar IS the primary action.
- **Filter bar (sticky under hero):** a single frosted row, `--surface-1`, radius full. Controls as quiet pill dropdowns: Make, Price range, Year, Mileage, Color, plus a Sort control (Newest, Price, Popularity). Active filters render as removable chips below the bar. No left-rail filter sidebar; keep it horizontal and calm.
- **Car grid:** CSS Grid, `repeat(auto-fill, minmax(300px, 1fr))`, `gap 24px`. **Car card:**
  - `4:3` photo on top (scrim only if a badge overlays), radius 16px top.
  - Body on `--surface-1`: title "Make Model" Geist 500 18px; year + mileage in mono `--text-secondary`; price in mono `--text-primary` 20px bottom-left.
  - A wishlist heart icon (Phosphor) top-right of the image, fills `--danger` when saved, with a subtle pop animation.
  - View count shown tiny in mono with an eye icon if popularity matters.
  - Hover: lift `translateY(-2px)`, surface → `--surface-2`, image `scale(1.03)` inside `overflow:hidden`.
  - Entire card is a link to detail.
- **Sections beyond the grid (vary layout families, no repetition):**
  1. Hero (above).
  2. "Popular this week" — a horizontal scroll-snap rail of cards (uses `getPopularCars`), distinct from the main grid.
  3. Main results grid (the bulk).
  4. A thin trust/how-it-works strip: 3 quiet columns (Browse, Buy with escrow approval, Drive away) with Phosphor icons. This is the only place a 3-up is allowed; keep it text-light.
- **States:** skeleton grid of 8 cards on load; empty state when filters match nothing ("No cars match these filters." + "Clear filters" button); error state with a retry.
- **Mobile:** single-column cards, filter bar becomes a "Filters" button opening a bottom sheet.

### 3.4 Car Detail (`features/car-detail`)

The conversion page. Make it feel like an Apple product page for a car.

- **Top:** gallery on the left/top — large `16:10` primary image with a thumbnail strip below; click opens a full-screen lightbox (frosted backdrop, arrow nav). If only one image, show it large and skip the strip.
- **Right rail (sticky on `lg+`):** the purchase panel on `--surface-1`, radius 16px:
  - Title "Year Make Model" (year + make/model, display 28px; year in mono).
  - Price large in mono.
  - Status chip (approval/availability).
  - Primary CTA "Buy now" pill `--accent`, full width; opens purchase dialog.
  - Secondary: "Add to wishlist" ghost button with heart icon; "Contact seller" reveals seller name + phone (mono).
  - Below CTA, quiet reassurance line, max 12 words.
- **Spec section (replace any spec table with cards):** a 2-column card grid of key specs, each card = label (`--text-secondary`) + value (mono, large): Mileage, Year, Color, Body color swatch, Listed date, Views. Do not render a `border-b`-per-row spec table.
- **Description:** prose block, `max-width 65ch`, `--text-secondary`.
- **Compare entry point:** a "Compare" button that adds this car to the compare tray (see §3.10).
- **Purchase dialog (`purchase-dialog`):** stepped, calm. Step 1 review (car thumb + price summary). Step 2 payment method (segmented: Card / UPI / Net banking) + a payment token field; this is a simulated gateway, so make it feel trustworthy with a lock Phosphor icon and "Secure simulated checkout" label. Step 3 confirm. On submit: button busy state, then success screen inside the dialog (large green Phosphor check, "Order placed", order id in mono, "It now awaits admin and seller approval" explaining the multi-step flow) with a "View order" CTA to `/my-orders/:id`. Payment failure path shows `--danger` state with retry.
- **States:** full skeleton (gallery block + rail) on load; 404 if the car id is invalid (route to a friendly not-found variant); disable Buy when the car is the user's own listing or not available, with a tooltip reason.
- **Mobile:** gallery first, then title/price/CTA (CTA becomes a sticky bottom bar with price + "Buy now"), then specs, then description.

### 3.5 Wishlist (`features/wishlist`)

- **Header:** H2 "Saved cars" + count in mono.
- **Body:** same car grid as Browse, reusing car-card; heart is pre-filled and removing it animates the card out (`layout` shrink + fade) and updates the count.
- **Empty state:** "Nothing saved yet." + "When you tap the heart on a car, it lands here." + "Browse cars" CTA.
- **Mobile:** single column.

### 3.6 My Listings (`features/my-listings`)

Seller's inventory management. Lean toward product density here.

- **Header row:** H2 "Your listings" on the left, primary CTA "List a car" pill `--accent` on the right (routes to `/my-listings/new`).
- **List:** prefer rich rows over cards. Each row on `--surface-1`, `1px --hairline` divider between rows (single hairline, not top+bottom), radius on the group: small `48px` thumbnail, Make Model (Geist 500), price (mono), a status chip (approval state), views (mono + eye icon), and a right-aligned action cluster: Edit (ghost), Delete (ghost, `--danger` on hover) opening confirm-dialog.
- **Status meaning surfaced:** a one-line helper under pending rows: "Awaiting admin review before it appears in Browse."
- **States:** skeleton rows; empty state "You have not listed a car yet." + "List a car" CTA; deletion shows confirm-dialog then optimistic row removal + toast.

### 3.7 List Car / Edit Car (`features/my-listings/list-car`, `edit-car`)

Shared form, Apple-clean.

- **Layout:** single centered column, `max-width 640px`, on `--bg-base`. Page H2 "List your car" / "Edit listing".
- **Grouped fields with section subheads** (not one long stack): "The basics" (Make, Model, Year, Color), "Condition & price" (Mileage, Price, Available toggle), "Details" (Description textarea, char count in mono). Labels above, helper text present, validation inline below per backend rules (year >= 1900, mileage >= 0, price required, Title Case where relevant).
- **Color field:** show a small swatch preview next to the input.
- **Available:** an Apple-style toggle switch (`--accent` when on), not a checkbox.
- **Image step:** a dashed `--hairline` drop zone with a Phosphor upload icon and "Drag photos or browse"; show thumbnails of added images with remove buttons. (Even if backend image upload is limited, design the affordance; otherwise note "Photos coming soon" rather than leaving a void.)
- **Footer actions:** sticky bottom bar within the form: "Cancel" ghost + "Publish listing" / "Save changes" pill `--accent`. On submit: busy state, success toast, route to My Listings. Edit re-triggers approval; tell the user: "Edits go back to admin review before going live."
- **States:** disabled submit until valid; server error banner above the footer in `--danger`.

### 3.8 My Orders + Order Detail (`features/my-orders`, `order-detail`)

- **My Orders list:** H2 "Your orders". Rows on `--surface-1`: car thumb + Make Model, amount (mono), order date (mono), an order status chip, and a payment status chip. Rows link to detail. A segmented filter at top: All / Buying / Selling, since a USER can be on either side. Empty state "No orders yet." + "Browse cars".
- **Order Detail:** the multi-step approval is the star. Render a **vertical stepper** (Apple-clean, accent for done, `--text-tertiary` for upcoming):
  1. Order placed (payment status)
  2. Admin approval
  3. Seller approval
  4. Completed
  Current step pulses subtly; rejected/cancelled shows a `--danger` terminal node with the reason.
- **Panels:** Car summary card (thumb, title, price), Parties card (buyer + seller names and phones in mono, with a clear "You are the buyer/seller" tag), Payment card (method, token masked, amount, fraud-alert badge in `--warning` if flagged), Timeline of status changes (mono timestamps).
- **Seller actions:** if the viewer is the selling user and the order is at `PENDING_SELLER_APPROVAL`, show "Approve sale" (`--accent`) and "Reject sale" (`--danger` ghost) with confirm-dialog. Hide otherwise.
- **States:** skeleton; not-found for bad id; action buttons show busy state and refresh the stepper on success.

### 3.9 Support tickets (`features/tickets`: my-tickets, create-ticket, ticket-detail)

Model this as a calm messaging thread.

- **My Tickets:** H2 "Support" + "New request" CTA. Rows: subject (Geist 500), last-activity time (mono), status chip (Open/Closed). Empty state "No requests yet." + "New request".
- **Create Ticket:** centered `max-width 560px` form: Subject input, Description textarea (char count), "Submit request" pill. Helper: "Our team replies in the thread; you will be notified."
- **Ticket Detail:** chat layout. Header: subject + status chip. Thread: message bubbles, owner messages right-aligned in `--accent-wash` with `--text-primary`, admin messages left-aligned in `--surface-2`, each with sender name (mono small) + timestamp. A sticky bottom composer: textarea + "Send" icon button (`--accent`), disabled when the ticket is Closed (show "This request is closed" note). New messages animate in from the bottom.
- **States:** skeleton bubbles; send shows optimistic bubble + busy, reconciles on response.

### 3.10 Compare (`features/compare`)

- **Layout:** a two-column side-by-side comparison on `--surface-1`. Top: each car's photo + title + price. Below: a shared spec matrix where each spec is a row label (`--text-secondary`, left) with the two values in mono columns; highlight the better value (lower price, lower mileage, newer year) with `--accent` text and a tiny Phosphor caret. Avoid heavy table borders; use sparse hairlines between spec groups only.
- **Entry:** populated via a compare tray (a small frosted floating bar that appears when a car is added from Browse/Detail, showing selected thumbnails and a "Compare" button; max two cars).
- **States:** empty ("Add two cars to compare."); if only one selected, prompt to add a second.
- **Mobile:** stack the two cars vertically with a sticky spec-label column, or swipe between them.

### 3.11 Not Found (`features/not-found`)

- Centered on `--bg-base`: a large mono "404", one H3 "This page took a wrong turn.", one `--text-secondary` line, "Back to Browse" pill. Optional faint, tasteful background image (a road at night) at low opacity. Keep it brand-consistent, not jokey clip-art.

---

## 4. Admin pages

Admin shares the dark canvas; density rises (`DENSITY 5`), motion calms.

### 4.1 Admin Dashboard (`features/admin/dashboard`)

- **KPI row:** 4 quiet metric tiles (not heavy cards) separated by hairlines or generous gaps: Pending Cars, Pending Orders, Total Revenue, Open Tickets. Each tile = label (`--text-secondary`) + big mono value + a tiny trend or count delta. No card-on-card. Numbers are the hero; let them breathe.
- **Below:** a "Needs your attention" two-column area: left = latest pending listings (mini rows with Approve/Reject inline), right = latest pending orders. Each links into the full queue.
- **Optional chart:** revenue over time as a minimal line chart, single `--accent` stroke, no gridline clutter, mono axis labels. Only if real data exists; otherwise omit rather than fake it.
- **States:** skeleton tiles; empty queues show a quiet "All clear" with a Phosphor check, not a blank.

### 4.2 Admin Pending Cars (`features/admin/pending-cars`)

- **Layout:** a review queue. Each pending listing is a wide row/card: thumbnail, Make Model Year (title + mono), price (mono), seller name (mono), submitted date. Right side: "Approve" (`--accent`) and "Reject" (`--danger` ghost) with confirm-dialog. Clicking the row expands an inline preview (specs + description + larger photo) so the admin can decide without leaving.
- **Bulk affordance:** optional checkbox select + "Approve selected".
- **States:** skeleton; empty "No listings awaiting review." with a check; each action animates the row out and decrements the sidebar count.

### 4.3 Admin Pending Orders (`features/admin/pending-orders`)

- **Layout:** queue rows: order id (mono), car Make Model, buyer and seller (mono), amount (mono), payment status chip, and a **fraud-alert badge** in `--warning` when flagged (prominent, with a warning Phosphor icon). Actions: "Approve" / "Reject" with confirm.
- **Fraud emphasis:** flagged orders get a subtle `--warning` left bar so they catch the eye in the list.
- **States:** skeleton; empty "No orders awaiting approval."

### 4.4 Admin Users (`features/admin/users`)

- **Layout:** a clean data table (this is legitimately tabular). Columns: avatar+name, username (mono), email, phone (mono), role (chip: accent for ADMIN, neutral for USER), joined date. Row hover `--surface-2`. Header row in `--text-secondary` mono small. Search input top-right, sticky table header.
- **Density:** tight row height (~52px), single hairline between rows, no per-cell borders.
- **States:** skeleton rows; empty/search-no-results state.

### 4.5 Admin Feedback (`features/admin/feedback`)

- **Layout:** feedback as a masonry/card grid, each card: rating as filled Phosphor stars (`--accent` or `--warning`), the comment in body, author name + date in mono. Quiet, readable. Cap visible card height and clamp long comments with "Read more".
- **Top:** an average-rating summary (big mono number + stars) and total count.
- **States:** skeleton; empty "No feedback yet."

### 4.6 Admin Tickets + Ticket Detail (`features/admin/tickets`, `admin-ticket-detail`)

- **Admin Tickets:** queue table: subject, requester (mono), status chip, last activity (mono). Filter tabs: Open / Closed / All. Open count badge.
- **Admin Ticket Detail:** same chat layout as the user ticket thread, admin composing from the left/agent side. Admin gets extra controls in the header: a status control to set Open/Closed (segmented toggle) and the reply composer. Closing posts a final reply and updates the chip. Reuse the bubble styling so users and admins see a consistent thread.

---

## 5. Implementation notes (Angular Material re-skin)

- **Switch Material to a dark theme:** define a dark `mat.define-dark-theme` with a custom primary built around `--accent` (`#0A84FF`), neutral background overridden to `--bg-base`/`--surface-1`. Then override component density and surfaces via CSS variables so Material parts inherit the tokens (toolbar, sidenav, dialog, chips, form-field, menu, snackbar).
- **Form fields:** use the `outline` appearance, restyled to the input spec in §3.1 (hairline border, accent focus ring). Kill the default filled-gray Material look.
- **Buttons:** primary = `mat-flat-button` re-skinned to pill `--accent`; secondary = `mat-stroked-button` ghost with hairline; destructive = `--danger`. One `:active` scale transition globally.
- **Replace** `mat-card` shadows with the §1.4 elevation; replace Material Icons with Phosphor; replace `mat-progress-spinner` defaults with skeletons.
- **Fonts:** self-host Geist + Geist Mono with `font-display: swap`; set as the Material typography family and the CSS `--font-sans` / `--font-mono`.
- **Background photos:** any car image that backs text needs the scrim from §1.6 so text always passes contrast.

---

## 6. Accessibility and quality gates

- **Contrast:** body and labels pass WCAG AA on `--bg-base`/`--surface-1`. `--text-secondary` is the floor for normal text; never go below it for body. Accent buttons use `--text-primary`/white label (passes on `#0A84FF`).
- **Focus:** every interactive element shows the `--accent` focus ring; never remove outlines.
- **Reduced motion:** all reveals/lifts collapse to instant; the frosted blur stays (it is not motion) but transparency has a solid fallback.
- **Touch:** 44px minimum targets on mobile.
- **States everywhere:** every list and detail page must ship loading (skeleton), empty, and error states, not just the happy path.

### Pre-flight per page before calling it done
- One theme (dark) locked, no inverted sections.
- One accent (`--accent`) used identically everywhere; status colors only in chips/icons.
- One radius scale; pill primary CTAs, 16px cards.
- Real car photography present (no gray icon placeholders) with scrim on text-bearing images.
- Numbers in Geist Mono; headings in Geist display with negative tracking.
- Eyebrows rationed (max 1 per 3 sections), no section numbers, no decorative dots, no version/locale/scroll strips.
- Zero em-dashes in any UI copy.
- CTA labels fit one line, one intent per label across the page.
- Mobile collapse defined for every multi-column layout.
