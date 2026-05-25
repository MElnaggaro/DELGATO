# DELGATO — Final Canonical Application Flow

**Status**: DEFINITIVE
**Created**: 2026-05-24  **Revised**: 2026-05-24 (v3 — final clarifications applied)
**Sources**: Canonical Spec § 1–16 · Design Reference · Codebase audit

---

## 0. Conventions

### Scope Labels

Every scenario is tagged:

| Label | Meaning |
|---|---|
| `[MVP REQUIRED]` | Must ship in first release. Blocking for launch. |
| `[POST-MVP]` | Planned for the release immediately after launch. Design exists. |
| `[LATER]` | Roadmap item. No implementation commitment. |

### Navigation Architecture

**Two navigation authorities exist. They do NOT overlap.**

| Authority | Scope | Mechanism |
|---|---|---|
| **AppStateMachine + RoutingResolver** | Boot, auth, role selection, session expiry, biometric gate, locked, fatal | `RouteGuard` observes state, calls `router.replace()` |
| **Standard Expo Router** | All feature-level navigation once `READY` | Screens call `router.push()` / `router.back()` directly |

> Once `AppState = READY{role}`, the state machine is **dormant**. It only re-activates for `session.expired`, `network.offline`, `auth.signed_out`, `role.switch_requested`, `merchant.suspended`, or `fatal`. Feature screens (shop → product → cart → checkout → tracking) navigate via standard router. They do NOT emit state machine events for in-flow transitions.

### Scenario Fields

- **TRIGGER / PRECONDITIONS / STATE TRANSITIONS / ROUTES / ROLE / ERRORS / RECOVERY / SYNC EVENTS / DESIGN REF**

---

## 0.1 Identity Boundaries

These are load-bearing decisions. Every flow inherits them.

| Boundary | Decision | Detail |
|---|---|---|
| **App binary** | **Single binary** | One app, two role-scoped shells (customer/merchant). No separate merchant app. |
| **Auth identity** | **Shared** | One `User` entity per phone number. `user.roles: ['customer'] \| ['merchant'] \| ['customer','merchant']`. |
| **Session** | **Single token, role-scoped context** | One `accessToken + refreshToken` per device. `session.activeRole` determines which shell mounts. Role switch = context switch, not re-login. |
| **Wallet** | **Customer-scoped only** | `Wallet` is a customer feature. Merchants have an **earnings ledger + payouts**, not a wallet. Wallet is NOT shared between roles — it belongs to the customer profile. |
| **Notifications** | **Shared namespace, role-tagged** | One notification stream per `userId`. Each notification carries `targetRole`. In-app list shows all; push routing checks `targetRole` against `activeRole`. |
| **Session scoping** | **Token is role-agnostic; context is role-specific** | A role switch does NOT invalidate the token. It changes `session.activeRole` and re-runs the resolver. Role-scoped in-memory caches (merchant order queue subscription) are closed on switch; persisted state (customer cart) remains but is **inaccessible** from the other shell. |

### 0.1.1 Auth Model

Single `User` entity, role-specific credentials:

| Aspect | Customer | Merchant |
|---|---|---|
| **Primary credential** | Phone + OTP | Phone + Password |
| **Registration** | Self-service. Phone → OTP → User created with `roles: ['customer']`. | Admin-provisioned. Operator creates User with `roles: ['merchant']` + sets initial password. `merchantSelfSignup` flag (OFF at MVP) gates future in-app registration. |
| **Login** | Phone → OTP → session | Phone → Password → session. New-device step-up: OTP after password. |
| **Dual-role** | User already has `roles: ['customer']`. When merchant profile is added (admin), `roles` becomes `['customer','merchant']`. **No second User entity.** | Same User entity. One `accessToken` grants both roles. `session.activeRole` scopes the shell. |
| **Password storage** | None. Customer has no password. | Password hash stored on `MerchantProfile` (not on `User`). |
| **Token** | `accessToken` is role-agnostic. Backend includes `user.roles` in token claims. Client reads roles from `/me` or token decode. | Same token. |
| **Forgot password** | N/A (no password). | Phone → OTP → reset password. |

### 0.1.2 Payment Lifecycle Model

Card and wallet payments follow **authorize-then-capture-on-delivery**:

| Phase | Timing | Action | Method |
|---|---|---|---|
| **Authorize (hold)** | At checkout, before order creation | Place a hold on funds. No money moves yet. | `PaymentRepository.authorize(token, amount, orderRef)` or `WalletRepository.hold(userId, amount)` |
| **Create order** | Immediately after successful hold | `OrderRepository.place()` with `payment.ref` | Order starts at `payment_pending` (card/wallet) then moves to `new` on hold confirm. Cash orders skip hold and start at `new`. |
| **Capture (settle)** | On `order.delivered` | Settle the held funds. Money moves to merchant. | `PaymentRepository.capture(ref)` or `WalletRepository.capture(holdId)` |
| **Release (void)** | On `order.cancelled` or `order.rejected` | Release the hold. Customer gets funds back. | `PaymentRepository.release(ref)` or `WalletRepository.releaseHold(holdId)` |

Critical rules:
- Hold → capture is **system-driven**, triggered by the `order.delivered` domain event handler. Not client-initiated.
- Hold → release is **system-driven**, triggered by `order.cancelled` or `order.rejected`.
- At MVP, these handlers exist in mock. Production wiring is backend work.
- The client **never calls `capture()` or `release()` directly**. It only calls `authorize()`/`hold()` at checkout time.
- Cash orders skip the entire payment lifecycle. `OrderRepository.place({payment:{method:'cash'}})` creates the order directly at status `new`.

### 0.1.3 Cart Persistence Model

Cart is **scoped by `userId`**, not global:

- Zustand cart store persists to `AsyncStorage` under key `delgato.cart.{userId}`.
- On login: load cart for the authenticated `userId`. If no cart exists, start empty.
- On logout: cart remains in storage under the old `userId` key. Next login by same user restores it.
- On login by a **different** user: that user gets their own cart (empty if new).
- **No global cart**. If no user is authenticated, cart operations are blocked (the user must be past auth to reach any cart-adding screen).

### 0.1.4 Cart Scoping on Role Switch

The cart is **explicitly customer-scoped**:

- Cart data belongs to `CustomerProfile`. It is persisted under `delgato.cart.{userId}` and only loaded when `activeRole === 'customer'`.
- When switching **customer → merchant**: cart data stays in storage. NOT loaded into memory by merchant shell. NOT accessible. NOT cleared.
- When switching **merchant → customer**: the customer shell re-mounts, cart store hydrates from `delgato.cart.{userId}`, cart is available.
- **No blind preservation**. If the cart contains items from a shop that the merchant user also owns, no special handling — the cart is a customer-side concern, invisible to the merchant shell.
- If the app cold-starts into merchant role, the customer cart is never loaded into memory until the user switches to customer.

---

## A. APP BOOT FLOWS

### A-1: First Install `[MVP REQUIRED]`

| Field | Value |
|---|---|
| TRIGGER | User opens app for the very first time |
| PRECONDITIONS | No session · `hasAuthenticatedBefore=false` · `hasSeenIntro=false` |
| STATE TRANSITIONS | `UNKNOWN →[boot.start]→ BOOTING →[boot.hydrate]→ HYDRATING →[hydrate.complete]→ FIRST_RUN` |
| ROUTES | `/` (splash, 800–1400ms) → `/(onboarding)/intro` |
| ROLE REQUIREMENTS | None |
| ERROR STATES | Font load failure → `FATAL{recoverable:true}` |
| RECOVERY PATHS | FATAL → `/_error` with retry button |
| SYNC EVENTS | None |
| DESIGN SCREEN REF | `Onboarding.jsx` → `IntroScreen` |

### A-2: Cold Start — Returning, Biometric OFF `[MVP REQUIRED]`

| Field | Value |
|---|---|
| TRIGGER | Cold start, session valid, customer-only |
| PRECONDITIONS | Session valid · `addresses.length ≥ 1` · `biometricEnabled=false` |
| STATE TRANSITIONS | `HYDRATING →[hydrate.complete]→ READY{customer}` |
| ROUTES | `/` → `/(tabs)/home` |
| NOTES | After reaching READY, state machine is dormant. All subsequent navigation is router-driven. |
| DESIGN SCREEN REF | `Home.jsx` → `HomeScreen` |

### A-3: Cold Start — Returning, Biometric ON `[MVP REQUIRED]`

| Field | Value |
|---|---|
| TRIGGER | Cold start, session valid, biometric enabled + supported |
| STATE TRANSITIONS | `HYDRATING →[hydrate.complete]→ BIOMETRIC_REQUIRED{customer}` |
| ROUTES | `/` → `/(onboarding)/biometric` → on verify → `/(tabs)/home` |
| ERROR STATES | Biometric unsupported (HW removed) → auto-disable, skip to READY |
| DESIGN SCREEN REF | `AuthExtras.jsx` → `BiometricScreen` |

### A-4: Cold Start — Returning Merchant `[MVP REQUIRED]`

| Field | Value |
|---|---|
| TRIGGER | Cold start, merchant-only or dual-role with `lastActiveRole='merchant'` |
| STATE TRANSITIONS | `HYDRATING →[hydrate.complete]→ READY{merchant}` |
| ROUTES | `/` → `/(merchant)/(tabs)/dashboard` |
| ERROR STATES | KYC pending → `MERCHANT_KYC_PENDING` · Suspended → `MERCHANT_SUSPENDED` |
| DESIGN SCREEN REF | `merchant/screens/Dashboard.jsx` |

### A-5: Cold Start — Dual-Role, No lastActiveRole `[MVP REQUIRED]`

| Field | Value |
|---|---|
| TRIGGER | Cold start, both roles, `lastActiveRole=null` |
| STATE TRANSITIONS | `HYDRATING →[hydrate.complete]→ ROLE_SELECTION_REQUIRED` |
| ROUTES | `/` → `/(auth)/role` |
| DESIGN SCREEN REF | Canonical spec § 4.1 |

### A-6: Warm Start (<10 min background) `[MVP REQUIRED]`

| Field | Value |
|---|---|
| TRIGGER | App foregrounded within 10 min |
| STATE TRANSITIONS | None — remains `READY` |
| ROUTES | Same as before background |
| ERROR STATES | Session expired during background → `SESSION_EXPIRED` modal |

### A-7: Warm Start (≥10 min, Biometric ON) `[POST-MVP]`

| Field | Value |
|---|---|
| TRIGGER | App foregrounded after ≥10 min, biometric enabled |
| STATE TRANSITIONS | Re-prompt biometric gate |
| NOTES | MVP: no background timer. POST-MVP: add configurable re-prompt threshold. |

### A-8: Session Expired Mid-Use `[MVP REQUIRED]`

| Field | Value |
|---|---|
| TRIGGER | 401 from any API call + refresh fails |
| STATE TRANSITIONS | `* →[session.expired{returnTo}]→ SESSION_EXPIRED` |
| ROUTES | `/_modals/session-expired` (modal over current route) |
| RECOVERY PATHS | "Sign in again" → OTP → on success → `returnTo` |

### A-9: Notification Tap Launch `[POST-MVP]`

| Field | Value |
|---|---|
| TRIGGER | Push notification tap while app killed |
| STATE TRANSITIONS | Full boot → deep link queued → consume after READY |
| NOTES | MVP ships without deep link consumption. Tap opens app to home. |

### A-10: Forced App Update `[LATER]`

| Field | Value |
|---|---|
| TRIGGER | Boot version check against `minSupported` |
| STATE TRANSITIONS | `FATAL{recoverable:false}` |
| ROUTES | Store link screen, no bypass |

---

## B. AUTH FLOWS

### B-1: Customer Registration `[MVP REQUIRED]`

| Field | Value |
|---|---|
| TRIGGER | Tap "أنشئ حساب" on welcome |
| ROUTES | `/(onboarding)/welcome` → `/(onboarding)/register` → `/(onboarding)/otp` → resolve target |
| ERROR STATES | Phone exists → zero-friction sign-up (treat as login) · OTP expired → resend |
| DESIGN SCREEN REF | `AuthExtras.jsx` → `RegisterScreen` + `Onboarding.jsx` → `OTPScreen` |

### B-2: Customer Login (Returning) `[MVP REQUIRED]`

| Field | Value |
|---|---|
| TRIGGER | Tap "عندي حساب" → phone → OTP |
| ROUTES | `/(onboarding)/auth` → `/(onboarding)/otp` → resolve target |
| ERROR STATES | Phone not found → implicit registration |
| DESIGN SCREEN REF | `Onboarding.jsx` → `AuthScreen` |

### B-3: OTP Verification `[MVP REQUIRED]`

| Field | Value |
|---|---|
| TRIGGER | User submits 6-digit code |
| ERROR STATES | Invalid code (5 attempts → 30-min lockout) · Expired (60s TTL) |
| RECOVERY PATHS | Resend after 60s · Lockout → `/(auth)/locked` |

### B-4: Biometric Unlock `[MVP REQUIRED]`

| Field | Value |
|---|---|
| TRIGGER | `BIOMETRIC_REQUIRED` state |
| ERROR STATES | 3 failures → cooldown · HW removed → auto-disable |
| RECOVERY PATHS | "Sign in with phone" escape hatch |

### B-5: Logout `[MVP REQUIRED]`

| Field | Value |
|---|---|
| TRIGGER | Tap logout in profile/settings |
| STATE TRANSITIONS | `READY →[auth.signed_out]→ UNAUTHENTICATED` |
| NOTES | Revoke server-side (best-effort) → clear `delgato.session.v2` → clear in-memory stores. Preserve `hasAuthenticatedBefore=true`. |

### B-6: Merchant Login `[MVP REQUIRED]`

| Field | Value |
|---|---|
| TRIGGER | Merchant taps login → phone + password |
| AUTH MODEL | Same `User` entity as customer. Merchant credentials (password hash) stored on `MerchantProfile`, not on `User`. See § 0.1.1 for full auth model. |
| FLOW | Phone input → password input → `AuthRepository.loginMerchant(phone, password)` → if new device: OTP step-up → session. |
| DUAL ROLE | If user already has customer role, login with merchant credentials attaches `'merchant'` to `user.roles`. Single token, both roles. |
| NOTES | No in-app self-registration at MVP (gated by `merchantSelfSignup` flag). Merchant accounts are admin-provisioned. |

### B-7: Forgot Password `[MVP REQUIRED]`

| Field | Value |
|---|---|
| TRIGGER | "نسيت كلمة المرور" on merchant login |
| ROUTES | `/(onboarding)/forgot-password` → OTP → `/(onboarding)/reset-password` |

### B-8: Role Selection `[MVP REQUIRED]`

| Field | Value |
|---|---|
| TRIGGER | `RESOLVE_AUTHED()` finds both roles, no `lastActiveRole` |
| ROUTES | `/(auth)/role` → target shell |
| NOTES | Managed by state machine. Only time role selection is state-machine-driven. |

### B-9: Role Switch from Active State `[MVP REQUIRED]`

| Field | Value |
|---|---|
| TRIGGER | Tap "Switch to merchant/customer" |
| STATE TRANSITIONS | `READY{current} →[role.switch_requested]→ ROLE_SELECTION_REQUIRED →[role.selected]→ READY{other}` |
| CART BEHAVIOR | Customer cart stays in customer-scoped storage. NOT accessible from merchant shell. NOT cleared. Available when user returns to customer role. |
| NOTES | State-machine-driven (one of the few in-READY events the machine handles). |

### B-10: Locked Account `[MVP REQUIRED]`

| Field | Value |
|---|---|
| TRIGGER | 5 OTP failures |
| ROUTES | `/(auth)/locked` with countdown |

---

## C. CUSTOMER COMMERCE FLOWS

> **Navigation note**: All flows in this section are **router-driven** once `READY{customer}`. The state machine is not involved.

### C-1: Home `[MVP REQUIRED]`

| Field | Value |
|---|---|
| TRIGGER | READY{customer} |
| ROUTES | `/(tabs)/home` |
| NAVIGATION | Router-driven. Taps navigate via `router.push()`. |
| DATA SOURCES | Shop listing from `MerchantRepository` (or catalog seed). Live order banner from `OrderRepository`. |
| DESIGN SCREEN REF | `Home.jsx` → `HomeScreen` |

### C-2: Search `[MVP REQUIRED]`

| Field | Value |
|---|---|
| ROUTES | `/(tabs)/search` |
| DATA SOURCES | Debounced query against product/shop seed. Recent searches (local). |
| DESIGN SCREEN REF | `Home.jsx` → `SearchScreen` |

### C-3: Shop Detail `[MVP REQUIRED]`

| Field | Value |
|---|---|
| TRIGGER | Tap shop card (router-driven) |
| ROUTES | `/shop?id={shopId}` |
| DATA SOURCES | `MerchantRepository.byId()` · `ProductRepository.listForStore()` |
| DESIGN SCREEN REF | `Shop.jsx` → `ShopScreen` |

### C-4: Product Detail `[MVP REQUIRED]`

| Field | Value |
|---|---|
| TRIGGER | Tap product card (router-driven) |
| ROUTES | `/product?id={productId}` |
| DATA SOURCES | `ProductRepository.byId()` |
| DESIGN SCREEN REF | `Shop.jsx` → `ProductScreen` |

### C-5: Add to Cart — Same Shop `[MVP REQUIRED]`

| Field | Value |
|---|---|
| TRIGGER | Tap "أضف" |
| PRECONDITIONS | Cart empty OR same shop |
| NOTES | Cart is managed by Zustand store (client-side). Single-shop invariant enforced at store level. |

### C-6: Add to Cart — Different Shop (Conflict) `[MVP REQUIRED]`

| Field | Value |
|---|---|
| ROUTES | `/merchant-conflict` (router-driven) |
| RECOVERY | "Replace cart" → clear + add · "Cancel" → return |
| DESIGN SCREEN REF | `CheckoutExtras.jsx` → `MerchantConflictScreen` |

### C-7: Cart `[MVP REQUIRED]`

| Field | Value |
|---|---|
| ROUTES | `/cart` |
| DATA SOURCES | Local cart store (scoped by `userId`). |
| MVP SCOPE | Cart displays items, allows quantity edit and removal. |
| POST-MVP | `CartRepository.revalidate()` on mount for full price/stock diff UX. |
| DESIGN SCREEN REF | `Cart.jsx` → `CartScreen` |

### C-8: Checkout `[MVP REQUIRED]`

| Field | Value |
|---|---|
| ROUTES | `/checkout` (router-driven from cart) |
| DATA SOURCES | Cart store (userId-scoped) · Address store · Wallet balance |
| PAYMENT METHODS | Cash, card, wallet. **Provider-agnostic**: the `PaymentRepository` interface accepts an opaque token. No PSP-specific types leak into domain. |
| MVP VALIDATION | **Minimal availability check before place.** Call `ProductRepository.checkAvailability(productIds)` (lightweight batch endpoint). If any item is unavailable, show blocking alert with item names. User must remove unavailable items before proceeding. This is NOT the full diff UX (no price-change detection, no line-by-line diff modal). Full revalidation is POST-MVP. |
| DESIGN SCREEN REF | `Cart.jsx` → `CheckoutScreen` |

### C-9: Place Order — Cash `[MVP REQUIRED]`

| Field | Value |
|---|---|
| TRIGGER | Select cash → confirm |
| DATA FLOW | `OrderRepository.place({payment: {method:'cash'}})` |
| ROUTES | `/checkout` → `/order-success?orderId={id}` |
| SYNC EVENTS | `order.placed` emitted by repository |

### C-10: Place Order — Card `[MVP REQUIRED]`

| Field | Value |
|---|---|
| ROUTES | `/checkout` → `/payment` → `/order-success` |
| DATA FLOW | `PaymentRepository.authorize({token, amount, orderRef})` → `OrderRepository.place({payment: {method:'card', ref}})` |
| PAYMENT CONTRACT | `token` is an opaque string from the payment form. No card numbers, no PSP-specific types. Repository returns generic `PaymentAuth{ref, status:'authorized'}`. |
| PAYMENT LIFECYCLE | **Authorize-hold at checkout. Capture on delivery. Release on cancel/reject.** See § 0.1.2. Client only calls `authorize()`. Capture/release are system-driven by domain event handlers. |
| ERROR STATES | Authorization declined → stay on payment, show generic error. Timeout (15s) → treat as failure, release any partial hold. |

### C-11: Place Order — Wallet `[MVP REQUIRED]`

| Field | Value |
|---|---|
| ROUTES | `/checkout` → `/wallet-pay` → `/order-success` |
| DATA FLOW | `WalletRepository.hold(userId, amount)` → `OrderRepository.place({payment: {method:'wallet', holdRef}})` |
| PAYMENT LIFECYCLE | **Hold at checkout. Capture on delivery. Release on cancel/reject.** See § 0.1.2. Same model as card but through `WalletRepository`. |
| ERROR STATES | Insufficient balance → wallet method disabled with top-up CTA. Hold fails → show error, stay on wallet-pay. |

### C-12: Order Success `[MVP REQUIRED]`

| Field | Value |
|---|---|
| ROUTES | `/order-success?orderId={id}` |
| NOTES | Stateless screen. Receives `orderId` from place-order result. No side-effects on mount. |

### C-13: Order Tracking `[MVP REQUIRED]`

| Field | Value |
|---|---|
| ROUTES | `/tracking?orderId={id}` |
| DATA SOURCES | `OrderRepository.byId()` via platform store. Realtime updates via transport-agnostic `RealtimeClient` subscription. |
| REALTIME | Screen subscribes to order updates. **Transport is abstracted**: `RealtimeClient` interface is the contract. Mock uses in-memory pub/sub. Production may use WebSocket, SSE, or polling — screen doesn't know or care. |
| NOTES | NO local timers. All status changes from subscription events. |

### C-14: Orders List `[MVP REQUIRED]`

| Field | Value |
|---|---|
| ROUTES | `/(tabs)/orders` |
| TABS | Live (new/accepted/preparing/ready/picked) · Done (delivered/cancelled/rejected) |
| DATA SOURCES | `OrderRepository.listForCustomer()` |
| NAVIGATION | Tap live → `/tracking` · Tap done → `/order-detail` (router-driven) |

### C-15: Order Detail `[MVP REQUIRED]`

| Field | Value |
|---|---|
| ROUTES | `/order-detail?orderId={id}` |
| ACTIONS | View items, total, timeline. |
| MVP ACTIONS | Reorder (re-add items to cart). |
| POST-MVP ACTIONS | Refund request, invoice download, rate/review. |

### C-16: Category Browsing `[MVP REQUIRED]`

| Field | Value |
|---|---|
| ROUTES | `/category?key={key}` (router-driven) |

### C-17: Product Customization `[MVP REQUIRED]`

| Field | Value |
|---|---|
| ROUTES | `/customize?productId={id}` (router-driven) |
| DATA SOURCES | `ModifierRepository.forProduct()` |

### C-18: Promo Code `[MVP REQUIRED]`

| Field | Value |
|---|---|
| ROUTES | `/promo-code` (router-driven from cart/checkout) |
| DATA SOURCES | `PromotionRepository.validate(code, cart)` |

### C-19: Checkout Extras — Delivery Notes `[MVP REQUIRED]`

| Field | Value |
|---|---|
| ROUTES | `/delivery-notes` (router-driven) |

### C-20: Checkout Extras — Tip Driver `[POST-MVP]`

| Field | Value |
|---|---|
| ROUTES | `/tip-driver` |
| NOTES | Screen exists but tip selection is POST-MVP feature. |

### C-21: Checkout Extras — Scheduled Delivery `[POST-MVP]`

| Field | Value |
|---|---|
| ROUTES | `/scheduled-delivery` |
| NOTES | Data model ready. UI gated at MVP. |

### C-22: Checkout Extras — Map Pin `[POST-MVP]`

| Field | Value |
|---|---|
| ROUTES | `/map-pin` |

### C-23: Product Gallery `[MVP REQUIRED]`

| Field | Value |
|---|---|
| ROUTES | `/product-gallery?id={id}` (router-driven) |

### C-24: Reviews (customer-facing) `[POST-MVP]`

| Field | Value |
|---|---|
| ROUTES | `/reviews?storeId={id}` |
| NOTES | Read-only display is MVP. Submission flow is POST-MVP. |

### C-25: Similar Products `[POST-MVP]`

| Field | Value |
|---|---|
| ROUTES | `/similar?productId={id}` |

### C-26: Unavailable Product `[MVP REQUIRED]`

| Field | Value |
|---|---|
| ROUTES | `/unavailable?id={id}&shopId={id}` |

### C-27: Featured Shops `[MVP REQUIRED]`

| Field | Value |
|---|---|
| ROUTES | `/featured` (router-driven) |

### C-28: Nearby Shops `[POST-MVP]`

| Field | Value |
|---|---|
| ROUTES | `/nearby` |
| NOTES | Requires location services integration. |

### C-29: Deals `[MVP REQUIRED]`

| Field | Value |
|---|---|
| ROUTES | `/deals` (router-driven) |

### C-30: Recommendations `[POST-MVP]`

| Field | Value |
|---|---|
| ROUTES | `/recommendations` |
| NOTES | Requires recommendation engine. Mock returns random products. |

### C-31: Recently Viewed `[POST-MVP]`

| Field | Value |
|---|---|
| ROUTES | `/recently-viewed` |

### C-32: Cancel Order `[MVP REQUIRED]`

| Field | Value |
|---|---|
| ROUTES | `/cancel-order?orderId={id}` (router-driven) |
| DATA FLOW | `OrderRepository.cancel(id, reason, 'customer')` |
| NOTES | Free cancel for `new` status. Confirm dialog for later statuses. |

### C-33: Refund Request `[POST-MVP]`

| Field | Value |
|---|---|
| ROUTES | `/refund?orderId={id}` |
| NOTES | Full refund workflow (item selection, reason, photo upload, merchant approval/dispute, 48h auto-approve) is POST-MVP. MVP: customer contacts support for refunds. |

### C-34: Chat (Driver/Merchant) `[LATER]`

| Field | Value |
|---|---|
| ROUTES | `/chat?orderId={id}` |
| NOTES | Real-time chat is a significant infrastructure investment. LATER. MVP: ticket-based support via `SupportRepository`. |

### C-35: Contact Merchant `[MVP REQUIRED]`

| Field | Value |
|---|---|
| ROUTES | `/contact-merchant?storeId={id}` (router-driven) |
| MVP SCOPE | Call/WhatsApp links. Not in-app chat. |

### C-36: Invoice `[POST-MVP]`

| Field | Value |
|---|---|
| ROUTES | `/invoice?orderId={id}` |

### C-37: Rate/Review `[POST-MVP]`

| Field | Value |
|---|---|
| ROUTES | `/rate?orderId={id}` |
| NOTES | 24h review window, triggered by `order.delivered` event — all POST-MVP. |

### C-38: Reorder `[MVP REQUIRED]`

| Field | Value |
|---|---|
| TRIGGER | Tap reorder in order detail |
| DATA FLOW | Read order items → validate availability → populate cart → navigate to `/cart` |
| NOTES | Simple re-add to cart. No server-side `reorder()` endpoint needed at MVP. |

---

## D. LOYALTY FLOWS

### D-1: Wallet `[MVP REQUIRED]`

| Field | Value |
|---|---|
| ROUTES | `/wallet` (router-driven from profile) |
| DATA SOURCES | `WalletRepository.forUser()` · `.history()` |
| DESIGN SCREEN REF | `Loyalty.jsx` → `WalletScreen` |

### D-2: Wallet History `[MVP REQUIRED]`

| Field | Value |
|---|---|
| ROUTES | `/wallet-history` |

### D-3: Wallet Top-Up `[MVP REQUIRED]`

| Field | Value |
|---|---|
| TRIGGER | Tap "شحن" in wallet |
| DATA FLOW | `WalletRepository.topUp({amount, paymentToken})` |
| PAYMENT | Same provider-agnostic contract. Opaque token from card form. |

### D-4: Points `[POST-MVP]`

| Field | Value |
|---|---|
| ROUTES | `/points` |
| NOTES | Points/tier system requires backend infrastructure. Screen exists, data from mock seed. |

### D-5: Rewards Catalog `[LATER]`

| Field | Value |
|---|---|
| ROUTES | `/rewards` |

### D-6: Cashback `[POST-MVP]`

| Field | Value |
|---|---|
| ROUTES | `/cashback` |

### D-7: Referral `[POST-MVP]`

| Field | Value |
|---|---|
| ROUTES | `/referral` |
| NOTES | Requires referral tracking backend. Code generation is simple; attribution on first order is complex. |

---

## E. PROFILE FLOWS

### E-1: Profile Tab `[MVP REQUIRED]`

| Field | Value |
|---|---|
| ROUTES | `/(tabs)/profile` |
| SECTIONS | Header · Wallet quick-link · Addresses · Settings · Logout · Role switch (if dual-role) |
| NAVIGATION | All sub-screen navigation is router-driven. |

### E-2: Edit Profile `[MVP REQUIRED]`

| Field | Value |
|---|---|
| ROUTES | `/edit-profile` |
| MVP SCOPE | Name, email edit. |
| POST-MVP | Phone change with re-verification. Avatar upload. |

### E-3: Addresses `[MVP REQUIRED]`

| Field | Value |
|---|---|
| ROUTES | `/addresses` |
| DATA SOURCES | `AddressRepository` |

### E-4: Favorites `[POST-MVP]`

| Field | Value |
|---|---|
| ROUTES | `/favorites` |
| NOTES | Currently stored in cart Zustand store. Keep local-only at MVP. |

### E-5: Payment Methods `[POST-MVP]`

| Field | Value |
|---|---|
| ROUTES | `/payment-methods` |
| NOTES | Requires saved-card infrastructure from payment provider. |

### E-6: Notification Settings `[POST-MVP]`

| Field | Value |
|---|---|
| ROUTES | `/notification-settings` |

### E-7: Security `[POST-MVP]`

| Field | Value |
|---|---|
| ROUTES | `/security` |
| MVP SCOPE | Biometric toggle only. |
| POST-MVP | Active sessions list, 2FA. |

### E-8: Change Password `[MVP REQUIRED]` (merchant only)

| Field | Value |
|---|---|
| ROUTES | `/change-password` |

### E-9: Privacy `[POST-MVP]`

| ROUTES | `/privacy` |

### E-10: Language `[MVP REQUIRED]`

| Field | Value |
|---|---|
| ROUTES | `/language` |
| NOTES | Instant switch. RTL flip without restart. |

### E-11: Support `[MVP REQUIRED]`

| Field | Value |
|---|---|
| ROUTES | `/support` |
| MVP SCOPE | FAQ list + "contact us" links (phone, email, WhatsApp). |
| POST-MVP | In-app ticket creation via `SupportRepository`. |

### E-12: Delete Account `[POST-MVP]`

| Field | Value |
|---|---|
| ROUTES | `/delete-account` |
| NOTES | Two-step with 7-day grace. Requires backend support. |

### E-13: Report Issue `[POST-MVP]`

| ROUTES | `/report-issue` |

---

## F. MERCHANT FLOWS

> **Navigation**: Same rule. State machine handles boot/auth/KYC/suspended only. Once `READY{merchant}`, all navigation is router-driven.

### F-1: Dashboard `[MVP REQUIRED]`

| Field | Value |
|---|---|
| ROUTES | `/(merchant)/(tabs)/dashboard` |
| DATA SOURCES | **MVP KPIs are computed from `OrderRepository`, not from an analytics service.** Today's orders count = `OrderRepository.listForStore(storeId, {from: today}).length`. Today's revenue = sum of `order.total` for delivered orders. Pending count = orders with `status: 'new'`. No analytics infrastructure at MVP. `AnalyticsRepository` exists but its mock returns data derived from the order list — it is NOT a separate data pipeline. |
| REALTIME | Subscribes to store orders via `RealtimeClient` (transport-agnostic). |

### F-2: Incoming Orders `[MVP REQUIRED]`

| Field | Value |
|---|---|
| ROUTES | `/(merchant)/(tabs)/orders` |
| ACTIONS | Accept (with prep time), Reject (with reason) |

### F-3: Accept Order `[MVP REQUIRED]`

| DATA FLOW | `OrderRepository.accept(id)` |
| SYNC EVENTS | `order.accepted` → customer tracking updates |

### F-4: Reject Order `[MVP REQUIRED]`

| DATA FLOW | `OrderRepository.reject(id, reason)` |
| SYNC EVENTS | `order.rejected` → customer notified |
| POST-MVP | Auto-refund trigger on rejection of pre-paid orders. |

### F-5: Start Preparing `[MVP REQUIRED]`

| DATA FLOW | `OrderRepository.startPreparing(id)` |

### F-6: Mark Ready `[MVP REQUIRED]`

| DATA FLOW | `OrderRepository.markReady(id)` |

### F-7: Handover to Courier `[POST-MVP]`

| DATA FLOW | `OrderRepository.handover(id, driverId)` |
| NOTES | Courier assignment system is POST-MVP. MVP: merchant marks "handed over" as a status bump. |

### F-8: Catalog Management `[MVP REQUIRED]`

| ROUTES | `/(merchant)/catalog` |
| DATA SOURCES | `CategoryRepository` · `ProductRepository` |

### F-9: Product Availability Toggle `[MVP REQUIRED]`

| DATA FLOW | `ProductRepository.toggleAvailability(id)` |
| SYNC EVENTS | `product.availability` event |

### F-10: Promotions `[POST-MVP]`

| ROUTES | `/(merchant)/promotions` |
| NOTES | Screen exists. Full promo CRUD with customer-side validation is POST-MVP. |

### F-11: Analytics `[POST-MVP]`

| ROUTES | `/(merchant)/analytics` |
| NOTES | Screen exists with mock data. Real analytics requires data warehouse. |

### F-12: Reviews `[POST-MVP]`

| ROUTES | `/(merchant)/reviews` |
| NOTES | Read-only display at MVP. Reply capability is POST-MVP. |

### F-13: Staff Management `[LATER]`

| ROUTES | `/(merchant)/staff` |
| NOTES | Multi-user store access requires significant auth infrastructure. |

### F-14: Payouts `[POST-MVP]`

| ROUTES | `/(merchant)/payouts` |
| NOTES | Basic payout history display is POST-MVP. Automated scheduled payouts are LATER. |

### F-15: Settings `[MVP REQUIRED]`

| ROUTES | `/(merchant)/(tabs)/settings` |
| MVP SCOPE | Store info, working hours, role switch (if dual). |
| POST-MVP | Delivery radius, payment preferences, temp close, tax. |

### F-16: Temporarily Close Shop `[POST-MVP]`

| NOTES | Requires discovery filtering infrastructure. |

### F-17: SLA Auto-Reject `[POST-MVP]`

| NOTES | Server-side timer that auto-rejects orders after `responseTimeoutSec`. This is a **backend feature**, not a client feature. MVP: manual accept/reject only. Mock may simulate it but client does NOT rely on it. |

---

## G. CROSS-ROLE SYNCHRONIZATION

> All cross-role sync happens through the `RealtimeClient` abstraction. **Transport is NOT specified.** The `RealtimeClient` interface defines `subscribe(channel, callback)` and `unsubscribe(channel)`. The mock implementation uses in-memory pub/sub. Production implementation may use WebSocket, Server-Sent Events, long-polling, or Firebase — the domain layer doesn't know.

### G-1: Order Placed → Merchant Notified `[MVP REQUIRED]`

| MECHANISM | `order.placed` event via `RealtimeClient` subscription |
| CUSTOMER → MERCHANT | Order appears in merchant orders tab |

### G-2: Order Accepted → Customer Tracking Updates `[MVP REQUIRED]`

| MECHANISM | `order.accepted` event |
| MERCHANT → CUSTOMER | Tracking step advances |

### G-3: Order Rejected → Customer Notified `[MVP REQUIRED]`

| MECHANISM | `order.rejected` event |
| POST-MVP | Auto-refund trigger for pre-paid orders |

### G-4: Product Unavailable → Customer Sees `[MVP REQUIRED]`

| MECHANISM | `product.availability` event |
| MERCHANT → CUSTOMER | Add button disabled on shop/product screens |
| POST-MVP | Cart revalidation catches it at checkout |

### G-5: Price Change → Customer Sees `[POST-MVP]`

| MECHANISM | `product.updated` event |
| EFFECT | Cart price-change modal at checkout |

### G-6: Order Cancelled → Merchant Notified `[MVP REQUIRED]`

| MECHANISM | `order.cancelled` event |

### G-7: Order Delivered `[MVP REQUIRED]`

| MECHANISM | `order.delivered` event |
| EFFECTS | Tracking shows delivered. |
| POST-MVP EFFECTS | Payment capture (card/wallet). Review window opens. |

### G-8: SLA Auto-Reject `[POST-MVP]`

| NOTES | Backend-driven. Client reacts to the event but doesn't implement the timer. |

### G-9: Review Posted → Merchant Sees `[POST-MVP]`

### G-10: Shop Temporarily Closed → Customer Discovery `[POST-MVP]`

### G-11: Promotion Change → Customer Deals `[POST-MVP]`

---

## H. EDGE CASES

| ID | Scenario | Scope | Behavior |
|---|---|---|---|
| E-1 | Offline at boot | `[MVP REQUIRED]` | `OFFLINE_DEGRADED` banner. Persisted data browsable. |
| E-2 | Offline mid-checkout | `[MVP REQUIRED]` | Place-order disabled. Cart preserved. |
| E-3 | Offline during tracking | `[MVP REQUIRED]` | Last status shown + stale marker. |
| E-4 | Session expired (401) | `[MVP REQUIRED]` | Modal over current. Re-auth → returnTo. |
| E-5 | Session expired during payment | `[POST-MVP]` | Modal → re-tokenize on success. |
| E-6 | Biometric HW removed | `[MVP REQUIRED]` | Auto-disable, skip. |
| E-7 | Biometric 3x fail | `[MVP REQUIRED]` | Cooldown → "Sign in with phone". |
| E-8 | Deep link while logged out | `[POST-MVP]` | Queue → consume after READY. |
| E-9 | Deep link → wrong role | `[POST-MVP]` | Prompt switch or error sheet. |
| E-10 | Delete account with active orders | `[POST-MVP]` | Block with order list. |
| E-11 | Merchant suspended mid-session | `[MVP REQUIRED]` | State machine → `MERCHANT_SUSPENDED`. |
| E-12 | Incomplete merchant setup | `[MVP REQUIRED]` | Cannot toggle acceptingOrders. |
| E-13 | Missing address at checkout | `[MVP REQUIRED]` | Route to address flow, return. |
| E-14 | Payment timeout >15s | `[MVP REQUIRED]` | Treat as failure. |
| E-15 | Inventory conflict at checkout | `[POST-MVP]` | Modal with diff. |
| E-16 | Stale cart prices | `[POST-MVP]` | Modal with diff. |
| E-17 | Double-submit place order | `[MVP REQUIRED]` | Idempotency key. |
| E-18 | Race: accept vs cancel | `[POST-MVP]` | First wins, ConflictError. |
| E-19 | Push in foreground | `[POST-MVP]` | In-app toast. |
| E-20 | Push tap (cold) | `[POST-MVP]` | Pending deep link. |
| E-21 | Token refresh fails | `[MVP REQUIRED]` | One retry → SESSION_EXPIRED. |
| E-22 | Corrupt persisted state | `[MVP REQUIRED]` | Wipe slice + telemetry. |
| E-23 | SecureStore unavailable | `[MVP REQUIRED]` | Treat as no session. |
| E-24 | Language switch mid-flow | `[MVP REQUIRED]` | Instant re-render. |
| E-25 | RTL toggle | `[MVP REQUIRED]` | Layout flip. |
| E-26 | Role switch with cart | `[MVP REQUIRED]` | Cart stays in customer-scoped storage. Inaccessible from merchant shell. |
| E-27 | Role switch with pending SLA | `[POST-MVP]` | Server-side timer continues. |
| E-28 | Reservation hold expires | `[POST-MVP]` | Re-reserve. |
| E-29 | Wallet hold + parallel top-up | `[POST-MVP]` | No deadlock. |
| E-30 | Promo used twice | `[MVP REQUIRED]` | Server rejects. |
| E-31 | Mock fail rate | `[MVP REQUIRED]` | All retry paths exercise. |
| E-32 | Forced update | `[LATER]` | Store link screen. |

---

## I. COMPLETE ROUTE REGISTRY

### State-Machine-Managed Routes (RouteGuard navigates)

| Route | AppState |
|---|---|
| `/` (splash) | UNKNOWN / BOOTING / HYDRATING |
| `/(onboarding)/intro` | FIRST_RUN |
| `/(onboarding)/welcome` | UNAUTHENTICATED (first time) |
| `/(onboarding)/auth` | UNAUTHENTICATED (returning) |
| `/(onboarding)/otp` | AUTH_OTP_PENDING |
| `/(onboarding)/biometric` | BIOMETRIC_REQUIRED |
| `/(onboarding)/location-permission` | ADDRESS_SETUP_REQUIRED |
| `/(auth)/role` | ROLE_SELECTION_REQUIRED |
| `/(auth)/locked` | LOCKED_OUT |
| `/(merchant)/kyc-pending` | MERCHANT_KYC_PENDING |
| `/(merchant)/suspended` | MERCHANT_SUSPENDED |
| `/(tabs)/home` | READY{customer} |
| `/(merchant)/(tabs)/dashboard` | READY{merchant} |
| `/_modals/session-expired` | SESSION_EXPIRED |
| `/_error` | FATAL |

### Router-Driven Routes (screens navigate directly)

All other routes. Screens call `router.push('/shop?id=xyz')` etc. **No state machine involvement.** See sections C–F for the full list.

---

*End of canonical flow specification v2.*
