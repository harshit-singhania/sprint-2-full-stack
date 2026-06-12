# Angular Interview Q&A — Based on This Codebase

---

## SECTION 1: Application Bootstrap & Standalone API

**Q1. What is `bootstrapApplication()` and how does it differ from the older `platformBrowserDynamic().bootstrapModule()` approach?**

`bootstrapApplication(AppComponent, appConfig)` is the Angular 14+ standalone bootstrap. It replaces `bootstrapModule(AppModule)` entirely — there is no root `NgModule`. All providers that used to live in `AppModule.providers` or imported modules now live in the `ApplicationConfig` object passed as the second argument. In this project that's `app.config.ts` with `provideRouter`, `provideHttpClient`, `provideAnimations`, and the `AuthInterceptor` token.

The key difference: without a root module, Angular uses the component tree itself to resolve dependencies, and each standalone component declares its own `imports` array instead of relying on module-level declarations.

---

**Q2. What does `standalone: true` on a component mean? How does it affect imports?**

A standalone component is self-describing — it doesn't need to be declared in any `NgModule`. Instead, it lists everything it needs directly in its own `imports: []` array. For example `BrowseComponent` imports `CommonModule`, `ReactiveFormsModule`, `RouterModule`, `CarCardComponent`, `EmptyStateComponent`, and `LoadingSpinnerComponent` all at the component level. This makes components portable and eliminates the need for `SharedModule` patterns.

---

**Q3. Why is `withInterceptorsFromDi()` needed in `provideHttpClient()`?**

In the standalone API, `provideHttpClient()` by default only supports the newer functional interceptors (`withInterceptors([fn])`). To use the older class-based interceptor pattern (`implements HttpInterceptor` + `HTTP_INTERCEPTORS` multi-provider token), you must explicitly opt in with `withInterceptorsFromDi()`. Without it, the `AuthInterceptor` would be registered in DI but silently ignored.

---

## SECTION 2: Routing & Lazy Loading

**Q4. How does lazy loading work with `loadComponent()`? When is the JS chunk downloaded?**

`loadComponent` takes a factory function that returns a dynamic `import()`. Angular's router only calls this factory when the route is first activated — the browser makes a new network request for that component's JS chunk at that moment. Until then, the code doesn't exist in memory. In this app every feature component is lazy-loaded, so the initial bundle is small — only the router, shell components, guards, and services ship upfront.

```ts
{
  path: 'browse',
  loadComponent: () => import('./features/browse/browse.component').then(m => m.BrowseComponent)
}
```

---

**Q5. What is the role of `UserShellComponent` and `AdminShellComponent`? What Angular concept do they represent?**

They are **layout shell components** — route components that contain the navbar, footer, and a `<router-outlet>`. Child routes render into that outlet. This means the nav doesn't re-render on every child navigation — only the outlet content changes. Both shells have `canActivate` guards on the parent route, which means all children are automatically protected without repeating the guard on each child route.

---

**Q6. Why do the guards return `router.createUrlTree(['/login'])` instead of calling `router.navigate(['/login'])`?**

Returning a `UrlTree` from a `CanActivateFn` is the correct Angular pattern. It tells the router to treat the redirect as part of the current navigation — the router handles it synchronously without a separate navigation cycle. Calling `router.navigate()` is a side effect that fires a new, separate navigation, which can cause race conditions. The `UrlTree` approach is cleaner and is the officially recommended pattern.

---

**Q7. What is the difference between `AuthGuard` (functional) and the older class-based guard? Why was the change made?**

Old style:
```ts
@Injectable()
class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}
  canActivate(): boolean | UrlTree { ... }
}
```

New style (`CanActivateFn`):
```ts
export const AuthGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  ...
};
```

The functional form avoids creating a class and an injectable just to run a small check. `inject()` works in functional guards because Angular sets up an injection context when it calls the function. The functional form is also easier to compose — you can call multiple injected services without a constructor.

---

## SECTION 3: HTTP Interceptors

**Q8. Walk through exactly what `AuthInterceptor.intercept()` does.**

1. Reads `session_token` from `localStorage`
2. If token exists: calls `req.clone({ headers: req.headers.set('X-Session-Token', token) })` — creates a new immutable `HttpRequest` with the header added
3. Calls `next.handle(authReq)` — passes the (possibly modified) request to the next interceptor or to the HTTP backend
4. Pipes a `catchError` — if the response is a 401 or 403, it clears all localStorage auth keys and redirects to `/login`, then re-throws the error with `throwError(() => error)` so component-level error handlers still fire

---

**Q9. Why is `HttpRequest` immutable? Why must you use `.clone()`?**

Angular's `HttpRequest` is designed as a value object — immutable by design. This ensures that interceptors can't accidentally mutate a request that other parts of the pipeline have a reference to. `.clone()` accepts a partial override object and returns a new `HttpRequest` with those fields replaced, leaving the original untouched. If you try to mutate `req.headers.set()` directly it returns a new `HttpHeaders` object but doesn't modify the request — you need to pass it back via `clone()`.

---

**Q10. What does `multi: true` mean on the `HTTP_INTERCEPTORS` token?**

It means the token is a **multi-provider** — multiple values can be registered for the same token and Angular collects all of them into an array. Without `multi: true`, each new registration would replace the previous one. With `multi: true`, Angular builds a chain of interceptors. The `HttpClient` applies them in registration order.

---

## SECTION 4: Services & Dependency Injection

**Q11. What does `@Injectable({ providedIn: 'root' })` actually do?**

It registers the service in the root injector without needing to add it to any `providers` array. It also makes the service **tree-shakeable** — if no component or other service injects it, the bundler can remove it from the final output. All services in this app use `providedIn: 'root'` which means they're singletons for the lifetime of the application.

---

**Q12. `CarService.getAvailableCars()` returns an `Observable`. When does the HTTP call actually fire?**

Never, until something subscribes. `HttpClient.get()` returns a **cold Observable** — the HTTP request is deferred. Every call to `.subscribe()` creates a new subscription and fires a new HTTP request. In `BrowseComponent.loadCars()`, `this.carService.getAvailableCars().subscribe(...)` is what triggers the actual network call. If the component called `getAvailableCars()` but never subscribed, no request would go out.

---

**Q13. There's a nested subscribe in `BrowseComponent.loadCars()`. What's the problem with that pattern and how would you fix it?**

```ts
this.carService.getAvailableCars().subscribe({
  next: (cars) => {
    this.allCars = cars;
    this.carService.getPopularCars().subscribe({ ... }); // nested
  }
});
```

The problem: nested subscribes are hard to cancel, can cause memory leaks if unsubscribed improperly, and are harder to read. The RxJS fix is to use `switchMap` or `forkJoin`:

```ts
// forkJoin to run both in parallel
forkJoin({
  all: this.carService.getAvailableCars(),
  popular: this.carService.getPopularCars()
}).subscribe(({ all, popular }) => {
  this.allCars = all;
  this.popularCars = popular.slice(0, 8);
  this.applyFilters();
});
```

---

## SECTION 5: Reactive Forms

**Q14. What is the difference between Reactive Forms and Template-Driven Forms? Why does this app use Reactive Forms?**

| | Reactive | Template-Driven |
|---|---|---|
| Form model created in | Component class | Template directives |
| Validation | Synchronous validator functions | Directive-based (`required`, `minlength`) |
| Testability | Easy (pure class logic) | Harder (needs DOM) |
| Dynamic forms | Straightforward | Complex |

This app uses Reactive Forms because validation logic lives in the component class (testable), and form values are accessed programmatically via `form.value` rather than through `ngModel` two-way binding.

---

**Q15. Walk through exactly what happens when `filterForm.valueChanges.subscribe(() => this.applyFilters())` runs.**

`filterForm` is a `FormGroup`. Every `FormGroup` exposes a `valueChanges` Observable on `AbstractControl`. It emits the current form value as a plain object every time any child `FormControl` emits (i.e. on every keystroke in any filter input). `applyFilters()` then runs a client-side filter and sort on `this.allCars` and assigns the result to `this.filteredCars`. Angular's change detection picks up the new reference and re-renders the `*ngFor`.

---

**Q16. What is `form.patchValue()` vs `form.setValue()`?**

- `setValue()` requires you to provide values for **all** controls in the group. Missing any key throws an error.
- `patchValue()` allows a **partial** update — only the keys you provide are updated, others are untouched.

In `BrowseComponent.removeFilter()`:
```ts
this.filterForm.patchValue({ [key]: numericKeys.includes(key) ? null : '' });
```
Only one control is reset; the others keep their current values.

---

**Q17. In `LoginComponent`, why check `this.form.invalid` before calling the API?**

```ts
onSubmit() {
  this.submitted = true;
  if (this.form.invalid) return;
  ...
}
```

`this.submitted = true` is set first so the template can show validation error messages (typically shown only after first submission attempt). The `form.invalid` guard prevents the HTTP call from firing if client-side validators fail. `Validators.required` and `Validators.minLength` run synchronously — no network round-trip needed.

---

## SECTION 6: RxJS & State Management

**Q18. What is a `BehaviorSubject`? How is it different from a plain `Subject` and a regular `Observable`?**

| | `Observable` | `Subject` | `BehaviorSubject` |
|---|---|---|---|
| Has current value | No | No | Yes (`value` getter) |
| Replays to new subscribers | No | No | Yes (latest value) |
| Can call `.next()` | No | Yes | Yes |
| Multicast | No (cold) | Yes | Yes |

`CompareService` uses `BehaviorSubject<Car[]>([])` because:
1. New subscribers (e.g. `CompareTrayComponent`) immediately receive the current list of compare cars without waiting for the next emission
2. `compareService.cars` (sync getter via `_cars.value`) lets `CompareComponent` read current state without subscribing

---

**Q19. Why is `cars$` exposed as `this._cars.asObservable()` rather than making `_cars` public?**

Encapsulation. If `_cars` were public, any component could call `_cars.next([])` and mutate the state from outside. Exposing only `asObservable()` makes the state read-only to consumers — only `CompareService`'s own methods (`toggle`, `remove`, `clear`) can push new values via `_cars.next()`. This is the standard **Subject encapsulation pattern** in Angular.

---

**Q20. This app has no NgRx. When would you reach for NgRx instead?**

NgRx is worth the overhead when:
1. Multiple unrelated components need to share and react to the same state
2. State changes need to be time-travel debuggable or logged
3. Complex async flows (effects, loading/error states per action)
4. The team size is large enough that predictable unidirectional data flow matters

In this app, the only shared state is the compare list (`CompareService`) — a `BehaviorSubject` is sufficient. All other state is local to components. Adding NgRx here would be over-engineering.

---

## SECTION 7: MatDialog & Component Communication

**Q21. How is data passed into a `MatDialog` component? How does the dialog pass data back?**

**Into dialog:** `MatDialog.open(Component, { data: value })` — the `data` object is made available via the `MAT_DIALOG_DATA` injection token:
```ts
constructor(@Inject(MAT_DIALOG_DATA) public data: Car) {}
```

**Out of dialog:** The parent subscribes to `dialogRef.afterClosed()` which emits the value passed to `dialogRef.close(result)`. In `PurchaseDialogComponent`, `dialogRef.close()` is called with no argument (the dialog navigates directly instead).

---

**Q22. `PurchaseDialogComponent` manages a 3-step wizard. What state management approach does it use?**

Pure component-local state: `step: number`, `isLoading: boolean`, `successState: boolean`, `errorState: boolean`, `orderId: number | null`. The template uses `*ngIf="step === 1"`, `*ngIf="step === 2"` etc. to show/hide sections. There's no routing involved — the dialog is a self-contained stateful component. This is fine for isolated, short-lived UI flows.

---

## SECTION 8: Pipes & Templates

**Q23. What is a pure pipe and why does it matter for performance?**

A **pure pipe** (the default) is only re-executed when its input reference changes. Angular's change detection skips it if the input is the same reference. An **impure pipe** runs on every CD cycle regardless. `InrCurrencyPipe` is pure — it formats a number, always returning the same output for the same input. If it were impure, it'd re-run on every mouse move.

---

**Q24. What is `routerLinkActive` and `routerLinkActiveOptions`?**

```html
<a routerLink="/browse"
   routerLinkActive="nav-active"
   [routerLinkActiveOptions]="{exact:false}">
```

`routerLinkActive` adds the CSS class `nav-active` whenever the current URL matches (or starts with) the `routerLink` path. `exact: false` means `/browse/something` would also activate it. `exact: true` would only match the exact URL. Without this directive you'd have to manually subscribe to `Router.events` and check the URL.

---

**Q25. What is `ActivatedRoute.snapshot` vs subscribing to `ActivatedRoute.params`? When should you use each?**

- `snapshot.paramMap.get('id')` — synchronous read of current route params. Use when the component is **always destroyed and recreated** on navigation (e.g. going from `/cars/1` to `/cars/2` creates a new `CarDetailComponent`).
- `params.subscribe()` — live Observable. Use when Angular **reuses the component instance** across param changes (same route, different param, no component destroy). In `CarDetailComponent`, `snapshot` is correct — each car detail page creates a fresh component.

---

## SECTION 9: Change Detection

**Q26. What triggers change detection in this app? Why does an HTTP response cause the template to update?**

This app uses the default **`CheckAlways` strategy** (no `ChangeDetectionStrategy.OnPush`). Zone.js (imported via `zone.js` in `polyfills.ts`) monkey-patches async APIs — `setTimeout`, `Promise`, `XHR` (which `HttpClient` uses). When an XHR completes, zone.js notifies Angular that something async happened, Angular runs a CD cycle from the root, and all component templates are checked. Since `this.allCars = cars` changes the component property, the `*ngFor` re-renders.

---

**Q27. What would `ChangeDetectionStrategy.OnPush` change about this app?**

With `OnPush`, a component only re-renders when:
1. An `@Input` reference changes
2. An Observable used with `async` pipe emits
3. `markForCheck()` is called manually
4. A DOM event fires inside the component

This would improve performance but requires discipline: you'd need to use `async` pipe instead of manual `.subscribe()` assignments, or call `cdr.markForCheck()` after updating local state from HTTP responses. None of the components in this app use `OnPush` — they rely on zone.js triggering full CD cycles.

---

## SECTION 10: Architecture & Design Patterns

**Q28. What is the Shell-Feature-Core architecture used here?**

- **`core/`** — singletons that live for the app lifetime: services, guards, interceptors, models, pipes. Imported once, never feature-specific.
- **`features/`** — routed feature components. Each is a self-contained slice of functionality (browse, auth, admin, orders). They consume services from core.
- **`shells/`** — layout wrappers (`UserShellComponent`, `AdminShellComponent`). They contain `<router-outlet>` and the persistent UI (nav, footer). Feature components render inside them.
- **`shared/`** — dumb/presentational components (`CarCardComponent`, `LoadingSpinnerComponent`, etc.) used across multiple features. No business logic, no HTTP calls.

---

**Q29. `AuthService` stores auth state in `localStorage`. What are the tradeoffs vs storing it in a service property or a `BehaviorSubject`?**

| | localStorage | Service property | BehaviorSubject |
|---|---|---|---|
| Survives page refresh | Yes | No | No |
| Accessible across tabs | Yes | No | No |
| Reactive to changes | No | No | Yes |
| XSS risk | Higher (JS readable) | Lower | Lower |

This app trades XSS risk for simplicity and persistence. A `BehaviorSubject` in `AuthService` would be more reactive (components could subscribe to auth state changes) but state would be lost on page refresh, requiring a re-login. For a session-token-based app like this, `localStorage` is a pragmatic choice — the token is useless without the server-side session anyway.

---

**Q30. If you had to add a loading state that's shared across multiple components (e.g. a global spinner), how would you do it without NgRx?**

Add a `LoadingService` with a `BehaviorSubject<boolean>`:
```ts
@Injectable({ providedIn: 'root' })
export class LoadingService {
  private _loading = new BehaviorSubject<boolean>(false);
  readonly loading$ = this._loading.asObservable();
  show() { this._loading.next(true); }
  hide() { this._loading.next(false); }
}
```
The `UserShellComponent` template subscribes to `loading$` with the `async` pipe to show/hide a global spinner. Services or the interceptor call `show()`/`hide()` around HTTP calls. This is the same pattern `CompareService` uses — `BehaviorSubject` as a lightweight shared state container.

---

## BONUS: Quick-Fire Questions

**Q: What is `FormBuilder`? Is it required?**
`FormBuilder` is a helper service that reduces boilerplate. `this.fb.group({ name: [''] })` is equivalent to `new FormGroup({ name: new FormControl('') })`. Not required, just convenient.

**Q: What does `catchError(e => throwError(() => e))` actually do?**
Catches the error in the RxJS pipe, then immediately re-throws it as a new Observable error. Net effect: no transformation, just re-propagation. It's often added as a hook point for future logging. In practice it's identical to not having the `catchError` at all in terms of behavior.

**Q: Why are `LoginComponent` and `RegisterComponent` not inside a shell?**
Because they're unauthenticated pages — no nav bar needed. They're direct children of the root router with no `canActivate` guard and no shell wrapper.

**Q: What is the `async` pipe and why is it preferred for Observables in templates?**
`async` pipe subscribes to an Observable in the template and automatically unsubscribes when the component is destroyed — preventing memory leaks. It also calls `markForCheck()` when a new value arrives, which works correctly with `OnPush`. Manual `.subscribe()` in `ngOnInit` requires manual `unsubscribe()` in `ngOnDestroy` to avoid leaks.

**Q: What is `paramMap` vs `params` on `ActivatedRoute`?**
Both give route parameters. `params` returns a plain `{ [key]: string }` object. `paramMap` returns a `ParamMap` interface with methods like `.get('id')`, `.getAll('id')`, `.has('id')` — safer and more explicit. Prefer `paramMap`.

**Q: What is the `MatMenu` pattern in `UserShellComponent`?**
```html
<button [matMenuTriggerFor]="accountMenu">...</button>
<mat-menu #accountMenu="matMenu">...</mat-menu>
```
`#accountMenu` is a template reference variable exported as `matMenu`. The `[matMenuTriggerFor]` directive binds the button to that menu instance. Clicking the button opens the overlay — Material handles positioning and close-on-outside-click automatically.
