# Angular Frontend — Architecture Diagrams

---

## 1. Application Bootstrap Flow

```mermaid
flowchart TD
    A[main.ts\nbootstrapApplication] --> B[AppComponent\napp.config.ts]
    B --> C[provideRouter routes]
    B --> D[provideHttpClient\nwithInterceptorsFromDi]
    B --> E[provideAnimations]
    B --> F[HTTP_INTERCEPTORS\nAuthInterceptor multi:true]
    C --> G[Router reads app.routes.ts]
    D --> H[HttpClient available\nin DI tree]
    F --> I[Every HttpClient call\npasses through AuthInterceptor]
```

---

## 2. Full Route Hierarchy & Guards

```mermaid
flowchart TD
    ROOT["/ → redirect /browse"]
    LOGIN["/login\nLoginComponent\nlazy"]
    REGISTER["/register\nRegisterComponent\nlazy"]

    subgraph USER_SHELL["UserShellComponent — canActivate: [AuthGuard]"]
        BROWSE["/browse\nBrowseComponent"]
        CAR["/cars/:id\nCarDetailComponent"]
        WISH["/wishlist\nWishlistComponent"]
        LIST["/my-listings\nMyListingsComponent"]
        LIST_NEW["/my-listings/new\nListCarComponent"]
        LIST_EDIT["/my-listings/:id/edit\nEditCarComponent"]
        ORDERS["/my-orders\nMyOrdersComponent"]
        ORDER_D["/my-orders/:id\nOrderDetailComponent"]
        TICK["/tickets\nMyTicketsComponent"]
        TICK_NEW["/tickets/new\nCreateTicketComponent"]
        TICK_D["/tickets/:id\nTicketDetailComponent"]
        COMPARE["/compare\nCompareComponent"]
    end

    subgraph ADMIN_SHELL["AdminShellComponent — canActivate: [AuthGuard, AdminGuard]"]
        DASH["/admin/dashboard\nAdminDashboardComponent"]
        PCARS["/admin/cars/pending\nAdminPendingCarsComponent"]
        PORD["/admin/orders/pending\nAdminPendingOrdersComponent"]
        USERS["/admin/users\nAdminUsersComponent"]
        FEED["/admin/feedback\nAdminFeedbackComponent"]
        ATICK["/admin/tickets\nAdminTicketsComponent"]
        ATICK_D["/admin/tickets/:id\nAdminTicketDetailComponent"]
    end

    NOTFOUND["** → NotFoundComponent\neager"]

    ROOT --> LOGIN
    ROOT --> REGISTER
    ROOT --> USER_SHELL
    ROOT --> ADMIN_SHELL
    ROOT --> NOTFOUND
```

---

## 3. Route Guard Decision Flow

```mermaid
flowchart TD
    NAV[User navigates to URL] --> ROUTER[Angular Router\nmatches route]
    ROUTER --> HAS_GUARD{Has canActivate\nguards?}
    HAS_GUARD -- No --> ACTIVATE[Activate component]
    HAS_GUARD -- Yes --> AUTH_G[AuthGuard\nCanActivateFn]
    AUTH_G --> CHECK_TOKEN{localStorage\nhas session_token?}
    CHECK_TOKEN -- No --> REDIRECT_LOGIN[router.createUrlTree\n/login]
    CHECK_TOKEN -- Yes --> IS_ADMIN_ROUTE{AdminGuard\nalso present?}
    IS_ADMIN_ROUTE -- No --> ACTIVATE
    IS_ADMIN_ROUTE -- Yes --> ADMIN_G[AdminGuard\nCanActivateFn]
    ADMIN_G --> CHECK_ROLE{localStorage\nuser_role === ADMIN?}
    CHECK_ROLE -- No --> REDIRECT_BROWSE[router.createUrlTree\n/browse]
    CHECK_ROLE -- Yes --> ACTIVATE
    ACTIVATE --> LOAD_CHUNK[loadComponent\nfetch JS chunk]
    LOAD_CHUNK --> INIT[ngOnInit runs]
```

---

## 4. HTTP Interceptor Flow

```mermaid
sequenceDiagram
    participant C as Component
    participant SVC as Service
    participant INT as AuthInterceptor
    participant HTTP as HttpClient
    participant BE as Backend :8080

    C->>SVC: carService.getAvailableCars()
    SVC->>HTTP: http.get('/api/cars/available')
    HTTP->>INT: intercept(req, next)
    INT->>INT: localStorage.getItem('session_token')
    INT->>INT: req.clone({ headers: set X-Session-Token })
    INT->>BE: cloned request with token header
    BE-->>INT: 200 JSON response
    INT-->>HTTP: next.handle returns Observable
    HTTP-->>SVC: Observable<Car[]>
    SVC-->>C: Observable<Car[]>
    C->>C: .subscribe({ next, error })
    C->>C: this.allCars = cars

    note over INT,BE: On 401/403
    BE-->>INT: 401 Unauthorized
    INT->>INT: clearLocalStorage()
    INT->>INT: router.navigate(['/login'])
    INT-->>C: throwError(error)
```

---

## 5. Login → Auth State → Navigation Flow

```mermaid
sequenceDiagram
    participant U as User
    participant T as Template\n[formGroup]
    participant FC as LoginComponent\nFormGroup
    participant AUTH as AuthService
    participant INT as AuthInterceptor
    participant LS as localStorage
    participant R as Router

    U->>T: types username + password
    T->>FC: FormControl valueChanges emit
    U->>T: clicks Submit
    T->>FC: (click)="onSubmit()"
    FC->>FC: this.submitted = true
    FC->>FC: form.invalid? → return early (validators)
    FC->>AUTH: auth.login(username, password)
    AUTH->>INT: HttpClient.post('/api/auth/login')
    note over INT: No token yet → passes req unchanged
    INT-->>AUTH: Observable<{sessionToken, role, username}>
    AUTH-->>FC: Observable
    FC->>FC: .subscribe({ next })
    FC->>AUTH: auth.storeAuth(token, role, username)
    AUTH->>LS: setItem session_token, user_role, username
    FC->>R: router.navigate(['/admin/dashboard'] or ['/browse'])
    R->>R: AuthGuard: isLoggedIn() = true ✓
```

---

## 6. Component Lifecycle — BrowseComponent Data Flow

```mermaid
flowchart TD
    INIT[ngOnInit] --> LOAD_CARS[carService.getAvailableCars\nObservable cold]
    INIT --> LOAD_WISH[wishlistService.getWishlist\nObservable cold]
    INIT --> FILTER_SUB[filterForm.valueChanges\n.subscribe → applyFilters]

    LOAD_CARS --> SUBSCRIBE1[.subscribe next]
    SUBSCRIBE1 --> SET_ALL[this.allCars = cars]
    SET_ALL --> APPLY[applyFilters]
    APPLY --> FILTER_OPS["filter by make, year, price, color\nsort by sortBy"]
    FILTER_OPS --> SET_FILTERED[this.filteredCars = result]
    SET_FILTERED --> CD[Change Detection\nre-renders *ngFor]

    LOAD_CARS --> NESTED[carService.getPopularCars\nnested subscribe]
    NESTED --> POP[this.popularCars = popular.slice 0,8]

    LOAD_WISH --> SUBSCRIBE2[.subscribe next]
    SUBSCRIBE2 --> SET_IDS[this.wishlistIds = new Set car.id]

    FILTER_SUB --> EVERY_KEYSTROKE[Every form value change]
    EVERY_KEYSTROKE --> APPLY
```

---

## 7. Purchase Dialog — Multi-Step Flow

```mermaid
stateDiagram-v2
    [*] --> Step1_Review : MatDialog.open\ndata = Car injected via MAT_DIALOG_DATA

    Step1_Review --> Step2_Payment : click Continue\nstep = 2

    Step2_Payment --> Step3_Confirm : click Continue\nform valid paymentMethod + paymentToken

    Step2_Payment --> Step1_Review : click Back\nstep = 1

    Step3_Confirm --> Calling_API : click Place Order\nisLoading = true

    Calling_API --> SuccessState : 200 OK\norderId captured\nsuccessState = true

    Calling_API --> ErrorState : HTTP error\nerrorMsg = err.error.message\nerrorState = true

    ErrorState --> Step2_Payment : retry()\nerrorState = false, step = 2

    SuccessState --> [*] : dialogRef.close()\nrouter.navigate /my-orders/orderId

    Step3_Confirm --> Step2_Payment : click Back
```

---

## 8. BehaviorSubject — CompareService Reactive State

```mermaid
flowchart LR
    CS["CompareService\nprovidedin: root singleton"]
    BS["BehaviorSubject<Car[]>\n_cars private"]
    OBS["Observable<Car[]>\ncars$ = _cars.asObservable()"]

    CS --> BS
    BS --> OBS

    CAR_D["CarDetailComponent\naddToCompare()"]
    BROWSE["BrowseComponent\n(could call toggle)"]
    TRAY["CompareTrayComponent\nsubscribes to cars$"]
    COMP["CompareComponent\nreads compareService.cars"]

    CAR_D -- "compareService.toggle(car)\n_cars.next(newArray)" --> BS
    BROWSE -- "compareService.toggle(car)" --> BS
    OBS -- "async pipe or subscribe" --> TRAY
    OBS -- "subscribe" --> COMP

    TRAY -- "shows floating tray\nwhen count > 0" --> TRAY
    COMP -- "compare two cars side by side" --> COMP
```

---

## 9. Service Layer — Full Domain Map

```mermaid
flowchart TD
    subgraph SERVICES["Core Services (providedIn: root)"]
        A[AuthService\nPOST /auth/login\nPOST /auth/register\nPOST /auth/logout]
        B[CarService\nGET /cars/available\nGET /cars/popular\nGET /cars/id\nPOST /cars\nPUT /cars/id\nDELETE /cars/id]
        C[OrderService\nGET /orders/my\nPOST /user/cars/id/purchase\nGET /user/sales/pending\nPOST /user/sales/id/approve\nPOST /user/sales/id/reject]
        D[AdminService\nGET /admin/dashboard\nGET /admin/cars/pending\nPOST /admin/cars/id/approve\nGET /admin/orders/pending\nPOST /admin/orders/id/approve\nGET /admin/users]
        E[WishlistService\nGET /user/wishlist\nPOST /user/wishlist/id\nDELETE /user/wishlist/id]
        F[TicketService\nGET /user/support-tickets\nPOST /user/support-tickets\nPOST /support-tickets/id/messages]
        G[FeedbackService\nPOST /feedback]
        H["CompareService\nBehaviorSubject only\nno HTTP"]
        I[ToastService\nMatSnackBar wrapper]
    end

    HTTP[HttpClient] --> A
    HTTP --> B
    HTTP --> C
    HTTP --> D
    HTTP --> E
    HTTP --> F
    HTTP --> G

    INT[AuthInterceptor] -.adds X-Session-Token.-> HTTP
```

---

## 10. Standalone Component Import Model

```mermaid
flowchart TD
    COMP["BrowseComponent\nstandalone: true"]

    subgraph IMPORTS["imports: [ ... ] in @Component"]
        CM[CommonModule\n*ngIf, *ngFor, AsyncPipe]
        RFM[ReactiveFormsModule\nformGroup, formControlName]
        RM[RouterModule\nrouterLink, routerLinkActive]
        CC[CarCardComponent\nstandalone child]
        ES[EmptyStateComponent\nstandalone child]
        LS[LoadingSpinnerComponent\nstandalone child]
    end

    COMP --> IMPORTS

    note1["No NgModule.declarations\nNo SharedModule\nEach component is self-contained"]
```

---

## 11. Complete E2E Data Flow — One Page Summary

```mermaid
flowchart TD
    U[User Action\nclick / keystroke / navigation]
    TEMPLATE[Template\nevent binding click\nproperty binding\n*ngIf *ngFor]
    COMP[Component Class\nngOnInit\nform.valueChanges\nsubscribe callbacks]
    GUARD[Route Guard\nCanActivateFn\nchecks localStorage]
    FORM[Reactive Form\nFormGroup\nFormControl\nValidators]
    SVC[Service\nreturns cold Observable]
    INT[AuthInterceptor\nreq.clone + X-Session-Token\ncatchError 401/403]
    HTTP[HttpClient]
    BE[Spring Boot Backend\n:8080]
    MODEL[Typed Model Interface\nCar / Order / Ticket]
    CD[Change Detection\nzone.js triggered\nre-evaluates bindings]
    TOAST[ToastService\nMatSnackBar]
    DIALOG[MatDialog\nMAT_DIALOG_DATA injection\nMatDialogRef]
    BS[BehaviorSubject\nCompareService\ncross-component state]

    U --> TEMPLATE
    TEMPLATE --> COMP
    COMP --> GUARD
    COMP --> FORM
    FORM --> COMP
    COMP --> SVC
    SVC --> HTTP
    HTTP --> INT
    INT --> BE
    BE --> INT
    INT --> SVC
    SVC --> COMP
    COMP --> MODEL
    MODEL --> CD
    CD --> TEMPLATE
    COMP --> TOAST
    COMP --> DIALOG
    COMP --> BS
    BS --> TEMPLATE
```
