# DELGATO — Complete Flow Discovery & Scenario Map

## 1. Project Architecture Overview

- **delngato-app** (Expo Router app with TypeScript) and **design/** (static HTML design references)
- Architecture layers:
  - **Domain**: types, repository interfaces, selectors, stores (platform store), errors, use-cases
  - **Features** (Zustand stores): auth, cart, orders, loyalty, addresses, settings, catalog, discovery, chat
  - **Infrastructure**: DI container, config, mock/HTTP repositories, event bus, realtime client, seed data
- Mock is default backend mode (`EXPO_PUBLIC_API_MODE=mock`); HTTP repos throw `NotImplementedError`
- Platform store (`usePlatformStore`): canonical reactive cache persisted to AsyncStorage as `delngato.platform.v1`
- Event bus (`src/infrastructure/events/EventBus.ts`): typed side-effect channel — handlers for toasts, haptics, analytics, push, notifications
- DI container built once at boot in `src/infrastructure/container.ts` (singleton pattern with `getContainer()` / `resetContainer()`)

## 2. App Startup Flow (app/_layout.tsx → app/index.tsx)

### Phase 1: Native Boot (_layout.tsx)
1. `SplashScreen.preventAutoHideAsync()` — hold native splash
2. Font load: IBM Plex Sans Arabic (7 weights) + Tienne (3 weights)
3. Async init in `useEffect`:
   - `applyRtlForLocale('ar')` — set Arabic RTL
   - `initI18n('ar')` — bootstrap i18next with Arabic
   - `hydrateSession()` — read SecureStore token → set `authed` flag
   - `getContainer()` — build DI container (mock repos)
   - `hydratePlatformSeed()` — if platform store empty, apply seed data
   - `installEventHandlers(container)` — wire domain events to side-effects
4. Hide native splash when fonts + i18n ready
5. Render `RootStack` (Stack navigator) + `ToastHost`

### Phase 2: Splash Routing (app/index.tsx)
- 1.4s branded reveal (olive bg, ivory monogram + wordmark)
- After hold, decision tree:

```
isHydrated (always true after seed)
├── authed (has session)
│   ├── !hasAddresses → /(onboarding)/location-permission
│   ├── biometricEnabled + biometric supported → /(onboarding)/biometric
│   └── all complete → /(tabs)/home
├── hasAuthenticatedBefore || hasCompletedOnboarding
│   ├── biometricEnabled + biometric supported → /(onboarding)/biometric
│   └── → /(onboarding)/auth
└── first-time user → /(onboarding)/intro
```

## 3. Auth State Machine

### States (inferred from code + types):
| State | Description |
|-------|-------------|
| `unknown` | No session info (app boot, before hydrateSession) |
| `hydrating` | Token restore in progress |
| `new_user` | Never authenticated (hasAuthenticatedBefore=false) |
| `returning_logged_out` | Has authenticated before but signed out now |
| `phone_otp_pending` | Phone submitted, OTP not yet verified |
| `customer_logged_in` | Active customer session (authed=true) |
| `address_required` | Logged in but no address on file |
| `biometric_required` | Logged in, biometric enabled but not yet enrolled |
| `session_expired` | 401/403 detected by axios interceptor |
| `signed_out` | Explicit sign-out (state cleared except hasAuthenticatedBefore) |

### Transitions
1. `unknown` → `hydrating` (app boot → `hydrateSession()`)
2. `hydrating` → `customer_logged_in` (SecureStore has token)
3. `hydrating` → `returning_logged_out` (no token, hasAuthenticatedBefore=true)
4. `hydrating` → `new_user` (no token, hasAuthenticatedBefore=false)
5. `new_user` → `phone_otp_pending` (`useRequestOtp` → phone submitted)
6. `phone_otp_pending` → `customer_logged_in` (`useVerifyOtp` → token saved)
7. `customer_logged_in` → `address_required` (no addresses)
8. `customer_logged_in` → `biometric_required` (biometric enabled, not enrolled)
9. `customer_logged_in` → `signed_out` (signOut → token cleared, preserves hasAuthenticatedBefore)
10. `customer_logged_in` → `session_expired` (401/403 interceptor → `signOut()`)

### Auth domain types
- `AuthSession`: role, userId, accessToken, refreshToken?, issuedAt, expiresAt?
- `OtpChallenge`: phone, role, resendInSec
- `RegisterInput`: role, phone, name, email?, password?
- `MockAuthRepository`: per-role session map in-memory + SecureStore via `setRoleSessionToken`/`getRoleSessionToken`
- Events emitted: `auth.session-started`, `auth.session-ended`
- Token keys in SecureStore: `delngato.sessionToken`, `delngato.merchant.sessionToken`

### Merchant auth (domain exists, no UI)
- `MockAuthRepository` handles merchant role tokens same as customer
- `role.switched` event defined in types but never emitted
- No merchant auth UI in production app

## 4. Role State Machine

### States
- `customer` (default, only role with UI)
- `merchant` (domain types and mock repos exist, no UI)

### Implementation
- `role.switched` event type exists in `DomainEvent` but never emitted
- `MockAuthRepository` stores per-role tokens: `delngato.sessionToken` (customer), `delngato.merchant.sessionToken` (merchant)
- No role switch UI in production app
- Design reference shows merchant login flow in `merchant.html`

## 5. Biometric State Machine

### States
| State | Description |
|-------|-------------|
| `disabled` | biometricEnabled=false in settings store |
| `capability_checking` | Checking `hasHardwareAsync()` + `isEnrolledAsync()` |
| `supported_idle` | HW + enrolled, waiting for scan |
| `unsupported` | No HW or no enrollment |
| `scanning` | `authenticateAsync()` in progress |
| `success` | Authentication succeeded |
| `fail` | Authentication failed (non-cancel error) |
| `cancelled` | User cancelled (user_cancel/system_cancel/app_cancel → back to idle) |

### Transitions
1. `disabled` → `capability_checking` (app/index.tsx or welcome.tsx or biometric.tsx)
2. `capability_checking` → `supported_idle` (HW + enrolled)
3. `capability_checking` → `unsupported` (no HW or no enrollment)
4. `supported_idle` → `scanning` (user taps fingerprint circle)
5. `scanning` → `success` (authenticateAsync returns success)
6. `success` → route to home (700ms delay then hydrateSession + replace)
7. `scanning` → `fail` (non-cancel error)
8. `scanning` → `cancelled` (user/system/app cancel → back to supported_idle)
9. `fail` → `supported_idle` (user can retry by tapping)
10. `unsupported` → show phone login alternative

### Settings toggle
- Settings screen toggles `biometricEnabled` in settings store
- Not re-checked at enable time (no re-enrollment flow)
- Biometric gate in `biometric.tsx`: if `biometricEnabled=false`, redirect authed users to home, unauthed to auth

## 6. Customer Journeys

### 6.1 Onboarding (11 routes under app/(onboarding)/)

| Route | Screen | Purpose | Next |
|-------|--------|---------|------|
| `/intro` | Intro carousel (3 slides) | Brand intro, skip → welcome | `/welcome` |
| `/welcome` | Welcome hub | Register / login / biometric quick entry | `/register` or `/auth` or `/biometric` |
| `/auth` | Phone input | Enter Egyptian phone → request OTP | `/otp` |
| `/register` | Name + phone + agreement | New user registration | `/otp` |
| `/otp` | OTP verification | 6-digit code with custom keypad | `/location-permission` |
| `/forgot-password` | Forgot password | Mock, routes back to auth | Back to `/auth` |
| `/reset-password` | Reset password | Mock form | — |
| `/biometric` | Biometric enrollment | Fingerprint/face scan | `/home` or `/auth` |
| `/location-permission` | Location permission request | Grant location → auto-detect address | `/address-setup` |
| `/address-setup` | Confirm/detect address | Auto-detect or manual entry, label (home/work/other) | `/` (which routes to home) |

**Registration flow**: `welcome → register (name+email+phone) → otp (verify) → location-permission → address-setup → home`
**Login flow**: `welcome → auth (phone) → otp (verify) → biometric (if enabled) → home`
**Returning user**: `welcome → biometric (if enabled+supported) → home` OR `welcome → auth → otp → home`

### 6.2 Home (app/(tabs)/home.tsx)
- Address bar (tap → /addresses), cart icon (badge count), notification bell (unread dot)
- Search field (read-only, tap → search tab)
- Category icon strip (5 tiles, horizontal scroll) → tap → `/category?key=...`
- Active order banner (if live order exists) → tap → `/tracking`
- Category filter chips (all/grocery/pharmacy/etc) — local filter only
- Hero deal banner → tap → `/deals`
- Quick access tiles (3): offers → `/deals`, featured shops → `/featured`, recommended → `/recommendations`
- Nearby shops section → `ShopCard` list → tap → `/shop?id=`; "View all" → `/nearby`

### 6.3 Search (app/(tabs)/search.tsx)
- Search bar with local filtering of PRODUCTS and SHOPS arrays (no API call, no debounce)
- Recent searches (chip list), trending searches, browse categories
- Results: product hits (up to 8) + shop hits (up to 4)
- Product hit → `/product?id=&shopId=`, Shop hit → `/shop?id=`

### 6.4 Shop & Category (app/shop.tsx, app/category/[id].tsx)
- **Category**: reads from static `CATEGORIES`/`SHOPS` data, filters by category key, local sort filters (nearest, highest rated, open now, fastest delivery)
- **Shop**: lists products for a given shop from static `PRODUCTS` data, product cards → tap → `/product?id=&shopId=`

### 6.5 Product Detail (app/product.tsx)
- Hero image (colored tile with first letter), name, price, description, quantity stepper
- Add to cart → `useCartStore.addItem()`:
  - Same shop → adds OK
  - Different shop → returns conflict → navigate to `/merchant-conflict`
- Unavailable product → redirect to `/unavailable`
- No stock check on add, no variant/modifier support, no back-in-stock notification

### 6.6 Cart (app/cart.tsx + app/merchant-conflict.tsx)
- Stack-based cart from `useCartStore` (items, promo, tip, schedule, delivery note)
- Merchant conflict detection:
  - `addItem` checks if existing cart has different shop → returns `{ ok: false, reason: 'conflict' }`
  - `/merchant-conflict` shows current vs new shop, offers "replace cart" or "keep"
  - `forceReplaceWith` clears cart and adds new item
- Checkout button → `/checkout`
- Remove item confirmation dialog
- Persisted to AsyncStorage as `delngato.cart`

### 6.7 Checkout (app/checkout.tsx)
- Address selection → `/addresses`
- Timing: ASAP (default) or scheduled → `/scheduled-delivery`
- Delivery note → `/delivery-notes`
- Promo code → `/promo-code` (hardcoded DEALS matching, code "DELGATO10" or "DLN10")
- Tip → `/tip-driver` (10%/15%/20% presets)
- Payment selection: cash (immediate), card (→ `/payment`), wallet (→ `/wallet-pay`)
- Place Order → if cash, 900ms delay then `/order-success`; if card → `/payment`; if wallet → `/wallet-pay`
- No address guard, no missing-field validation before place

### 6.8 Card Payment (app/payment.tsx)
- Mock card form: number (16-digit, formatted), holder name, expiry (MM/YY), CVV (3-4 digit)
- Visual card preview with gradient
- Validation: number >=16, name >=3, expiry >=5, CVV >=3
- Submit: 900ms delay → `/order-success`
- No payment gateway integration

### 6.9 Wallet Payment (app/wallet-pay.tsx)
- Shows balance from `useLoyaltyStore`, total, remaining after payment
- Insufficient balance → alert message, button to top-up
- Confirm → 1100ms delay → `chargeWallet(total, orderId)` → `/order-success`

### 6.10 Wallet Top-Up (app/wallet-topup.tsx)
- Preset amounts + custom input
- Method selection: cash (immediate top-up in store), card (→ `/payment` then back)
- No actual top-up API call (local store mutation only)

### 6.11 Order Success (app/order-success.tsx)
- Destructive side-effects on mount:
  - `clearCart()` — empties cart store
  - `addOrder({ id: 'DLN-2047', shop, status: 'live', step: 1, ... })` — hard-coded test order
- Success animation + order ID + ETA display
- Buttons: Track Order (→ `/tracking?orderId=DLN-2047`), Back Home (→ home)

### 6.12 Order Tracking (app/tracking.tsx)
- Reads order ID from params (defaults to "DLN-2047")
- Local timer simulates progress: step 0→1→2→3 every 5 seconds
  - Steps: received → preparing → on the way → delivered
- Courier card appears at step 2+ (phone + chat buttons)
- Map SVG visualization with animated delivery path
- Hard-coded order items (not from actual order)
- No realtime subscription, no connection to domain `OrderRepository`

### 6.13 Order History (app/(tabs)/orders.tsx)
- Lists orders from `useOrdersStore` (feature store, not domain)
- Filters: all / live / done
- Tap order → `/order-detail` (or `/tracking` in home banner)
- Cancel/refund available via order detail

### 6.14 Profile (app/(tabs)/profile.tsx)
- User info header (name, phone, avatar initial) → edit → `/edit-profile`
- Loyalty tiles: wallet (→ `/wallet`), points (→ `/points`), referral (→ `/referral`)
- Account group: addresses, payment methods, favorites, recently viewed
- App group: notification settings, language (→ `/language`), privacy (→ `/privacy`), security (→ `/security`)
- Help group: support center, contact, report issue, about
- Logout: ConfirmDialog → `signOut()` → clear store + SecureStore → navigate to `/`
- Delete account → `/delete-account` (mock confirmation)

### 6.15 Settings (app/(tabs)/settings.tsx — note: this file was not found; settings are inline in profile.tsx and individual routes)
- Biometric toggle → settings store `biometricEnabled`
- Language toggle ('ar'/'en') → settings store → i18n locale switch
- Notification prefs (orders/promos/news/push/sms) → settings store
- Privacy: share location, allow marketing, share usage
- Change password → `/change-password` (mock form, no API)
- Security → `/security`
- Delete account → `/delete-account`

### 6.16 Support (app/support.tsx)
- Static contact tiles: phone (+20221234567), chat (alert: coming soon)
- FAQ (4 static Q&A items with accordion)
- Report problem: multiline text input → back
- No ticket system, no API integration

### 6.17 Notifications (app/notifications.tsx)
- Reads from `useOrdersStore.notifications` (hardcoded from catalog data)
- Mark all read on mount (800ms delay)
- Clear all button
- No realtime subscription, no push tap handler, no deep link routing

### 6.18 Referral (app/referral.tsx)
- Static referral code "AHMED2025"
- Share button (native Share API)
- Invited friends list (3 hardcoded entries)
- No reward tracking API, no referral link generation

## 7. Merchant Journeys

### 7.1 Production App
- Zero merchant routes exist in `delngato-app/app/`
- No production merchant code path exists
- No role switch UI, no merchant store management UI

### 7.2 Design Reference (design/design-reference/merchant.html)
- 42 screens organized in 10 flow groups
- Navigator pattern: `merchant/Navigator.jsx` (stack-based, gesture-enabled)
- Flows: Splash → Auth → Dashboard → Orders → Products → Catalog → Promotions → Analytics → Reviews → Settings → Staff & Support → Payouts

### 7.3 Auth (design reference)
- Splash → login (phone input) → OTP verification → dashboard
- Same OTP flow pattern as customer side

### 7.4 Dashboard
- Orders summary (new/total), revenue KPI
- Accept/reject incoming order cards
- Quick actions: products, analytics, settings

### 7.5 Order Management
- Order queue with tabs: new/accepted/preparing/ready/completed/rejected
- Per-order actions: accept, reject (with reason), prepare, ready, handover (assign driver)
- Each maps to `OrderStatus` transitions: new→accepted→preparing→ready→picked→delivered

### 7.6 Products
- Product list with search/filter
- Add product form: name, price, stock, category, availability toggle
- Edit product, delete product, toggle availability

### 7.7 Catalog
- Category list, add/edit/delete categories
- Product-category assignment

### 7.8 Promotions
- Promo code list, create promo (type: percentage/fixed amount/BOGO)
- Start/end date pickers, usage limits
- Activate/pause/end promo

### 7.9 Analytics
- Revenue chart (daily/weekly/monthly)
- Orders chart, top products by revenue
- Static/mock data

### 7.10 Reviews
- Customer reviews list with ratings
- Reply to reviews

### 7.11 Settings
- Store profile: name, description, logo, contact info
- Working hours per day
- Temporary close toggle
- Delivery radius, prep time
- Payment preferences (cash/card/wallet on/off)
- Tax settings (rate, inclusive/exclusive)
- Branding (logo, colors)

### 7.12 Staff & Support
- Staff list with roles (Owner/Manager/Staff)
- Add/edit/remove staff
- Support ticket view

### 7.13 Payouts (design reference only)
- Next payout amount + expected date
- Payout history (paginated list)
- Settlement details per payout

## 8. Order Lifecycle (Domain)

### 8.1 States
```
new → accepted → preparing → ready → picked → delivered
new → rejected
new → cancelled
accepted → cancelled
preparing → cancelled
ready → cancelled (cancelled from ready state only in design, not in ALLOWED_NEXT)
```

### 8.2 Transitions (ALLOWED_NEXT in MockOrderRepository)
| From | To | Actor |
|------|----|-------|
| new | accepted | merchant |
| new | rejected | merchant |
| new | cancelled | customer/system |
| accepted | preparing | merchant |
| accepted | cancelled | customer |
| preparing | ready | merchant |
| preparing | cancelled | customer |
| ready | picked | merchant (handover) |
| picked | delivered | system/driver |

### 8.3 SLA Timer
- `TIMER_PER_STATUS` in MockOrderRepository:
  - new: 300s (5 min SLA to accept/reject)
  - accepted: 600s (10 min to start preparing)
  - preparing: counts up (UI uses store's `prepTimeMin`)
- Timer decremented by realtime tick hook (1s interval)
- New orders with expired SLA → auto-rejected by system with reason "انتهت مهلة الرد"
- Events: `order.placed`, `order.accepted`, `order.rejected`, `order.preparing.started`, `order.ready`, `order.handed-over`, `order.cancelled`, `order.issue-reported`

### 8.4 Customer UI (feature store only, not domain)
- `order-success.tsx` clears cart and adds hard-coded test order "DLN-2047" to feature store
- `tracking.tsx` reads hard-coded order items, simulates progress with local timers (5s increments)
- `orders.tsx` lists orders from feature store (`useOrdersStore`)
- Cancel/refund buttons available in order detail screens

### 8.5 Merchant (design only)
- Accept/reject/prepare/ready/handover buttons shown in merchant order queue
- `MockOrderRepository` implements all these transitions
- No production merchant UI wires these methods

## 9. Payment & Wallet

### 9.1 Checkout Payment Selection (app/checkout.tsx)
- 3 methods: cash (no action), card (→ `/payment`), wallet (→ `/wallet-pay`)
- Wallet shows balance from `useLoyaltyStore`

### 9.2 Card Payment (app/payment.tsx)
- Mock card form with format validation only
- On success: 900ms delay → `/order-success`
- No payment gateway, no tokenization, no 3D Secure

### 9.3 Wallet Payment (app/wallet-pay.tsx)
- Shows balance, total, remaining
- Insufficient balance → alert + top-up link
- On confirm: 1100ms delay → `chargeWallet(total, 'DLN-2047')` → `/order-success`
- No gateway integration

### 9.4 Wallet Top-Up (app/wallet-topup.tsx)
- Preset amounts + custom
- Method: cash (local store update) or card (→ `/payment`)
- No API call for actual top-up

### 9.5 Merchant Payouts (domain — MockPayoutRepository)
- `nextPayout`: sum of delivered orders' merchantShare (93% of subtotal)
- `history`: filter payouts by storeId, sorted by date desc
- Bank details: hard-coded to بنك الأهلي المصري, account mask **** 7421
- No production UI

### 9.6 Wallet (domain — MockWalletRepository)
- `forUser`: lookup wallet by userId in platform store
- `history`: filter walletTx by userId, sorted desc
- `topUp`: validate amount >0, create tx, add to balance
- `charge`: validate balance >= amount, subtract
- Events: `wallet.topped-up`, `wallet.charged`

## 10. Settings-Driven Flows

### 10.1 Customer Settings
| Setting | Store | Effect |
|---------|-------|--------|
| Biometric toggle | settings store | Enables/disables biometric feature. Not re-checked at enable time. |
| Language (ar/en) | settings store | i18n locale switch + RTL layout toggle |
| Notification prefs | settings store | Feature notification list reads prefs (but never filters) |
| Privacy prefs | settings store | shareLocation, allowMarketing, shareUsage |
| Onboarding complete | settings store | `markOnboardingComplete()` on welcome screen |
| Address management | address store | CRUD via `addLocal`/`removeLocal`/`setDefaultAddress` |
| Change password | `/change-password` | Mock form, no API |
| Logout | auth store | `signOut()` → clear SecureStore + auth state → navigate to `/` |
| Delete account | `/delete-account` | Mock confirmation, no API |

### 10.2 Merchant Settings (design reference)
- Store profile (name, description, logo, phone, address)
- Working hours (per-day schedule)
- Temporary close toggle
- Delivery radius (km)
- Prep time (minutes)
- Payment preferences (cash/card/wallet toggle)
- Tax settings (rate %, inclusive/exclusive)
- Branding (logo upload, primary color)

## 11. Edge Cases

| Edge Case | Status | Details |
|-----------|--------|---------|
| Offline mode | Not handled (production) | No global offline detection. `OfflineBanner` component exists but unused. Design reference shows offline banner. |
| Timeout | Handled | Axios 12s timeout configured. Error alert shown on checkout. |
| Mock network failure | Configurable | `MOCK_FAIL_RATE=0` default. When set >0, `LatencyEngine` randomly throws `NetworkError` on mutations. |
| Expired session | Handled | 401/403 Axios interceptor calls `setSignOutHandler` → auth store `signOut()`. |
| Biometric unsupported | Handled | `hasHardwareAsync()` + `isEnrolledAsync()` check during enroll. Shows unsupported message. |
| Missing address on checkout | Not handled | No address guard on checkout flow. Empty address shown as placeholder. |
| Invalid product/category ID | Partial | Product screen checks `findProduct` existence (falls back to first product). Category does not validate ID. |
| Deep link bypasses auth/onboarding | Not handled | `app/index.tsx` checks auth on splash but individual routes are not guarded. Direct navigation to `/checkout` bypasses. |
| Corrupt AsyncStorage | Not handled | Platform store has version=1 but no migration or corruption handler. On version mismatch, persist middleware silently loads corrupt state. |
| SecureStore failure | Partial | `secureStore.ts` catches errors (returns null) but calling code in auth store/hooks does not handle null gracefully. |
| Missing merchant profile | Not handled | No guard before merchant screens in design reference. |
| KYC pending/rejected | Not handled | `kycStatus` exists on `Merchant` domain type but no UI checks. |
| Push notification tap | Not handled | `expo-notifications` configured but no `responseListener`. `deepLink` field in `Notification` type not consumed by router. |
| HTTP mode stubs | Default stubs | `EXPO_PUBLIC_API_MODE=http` activates all `Http*Repository` implementations that throw `NotImplementedError`. |
| Cart merchant conflict | Handled | `addItem` checks shop consistency. `/merchant-conflict` screen offers replace/keep. |
| Cart empty state | Handled | Empty cart screen with illustration + "Browse shops" CTA. |
| Promo code invalid | Handled | Shows "invalid or expired" message with retry option. |
| Wallet insufficient balance | Handled | Alert shown on `/wallet-pay`. User can navigate to top-up or change method. |
| SLA auto-reject | Handled | `MockOrderRepository.tick()` auto-rejects new orders after 5 min. |
| Invalid status transition | Handled | `MockOrderRepository.transition()` throws `ConflictError` for invalid moves. |
| Order placement empty items | Handled | `MockOrderRepository.place()` throws `ValidationError` if items empty. |

## Scenario Matrix

### Auth Scenarios

| ID | Trigger | Preconditions | Decision Logic | Next State | Next Screen | Failure Path |
|----|---------|---------------|----------------|------------|-------------|--------------|
| A-01 | App boot (cold start) | No stored token | `hydrateSession()` returns null + `hasAuthenticatedBefore=false` | new_user | `/intro` | Font/i18n init error → fallback init |
| A-02 | App boot (cold start) | No stored token, `hasAuthenticatedBefore=true` | Token null + flag true | returning_logged_out | `/auth` (or `/biometric` if enabled+supported) | — |
| A-03 | App boot (cold start) | Stored token exists | `hydrateSession()` returns token | customer_logged_in | branch on addresses/biometric | SecureStore failure → treat as no token |
| A-04 | User enters phone | On `/auth` screen | `normalizeEgyptianPhone()` validates | phone_otp_pending | `/otp` | Validation error → show error text. `mutateAsync` throws → haptics.warning + error msg |
| A-05 | User submits OTP | On `/otp` screen, code=6 digits | `useVerifyOtp` validates with `MockAuthRepository.verifyOtp()` | customer_logged_in | `/location-permission` | `InvalidOtpError` → haptics.warning + error + clear code. NetworkError → same. |
| A-06 | User resends OTP | On `/otp`, counter=0 | `useRequestOtp.mutateAsync()` | — | stay on `/otp` | Error → haptics.warning + error msg |
| A-07 | User signs out | On `/profile` | ConfirmDialog → `signOut()` | signed_out | `/` (splash → auth) | `signOutRemote()` swallow error → local clear still runs |
| A-08 | 401/403 from API | Any network call | Axios interceptor → `setSignOutHandler` | session_expired | → splash → auth | Token cleared locally |
| A-09 | User registers | On `/register`, name>=3, phone valid | `useRequestOtp` → navigate to OTP | phone_otp_pending | `/otp` | API error → swallow |
| A-10 | Returning user signs in | `hasAuthenticatedBefore=true`, on `/auth` | Phone + OTP flow | customer_logged_in | `/location-permission` | Same as A-04/A-05 |
| A-11 | Merchant auth (domain only) | N/A | `MockAuthRepository.verifyOtp(role='merchant')` | merchant_logged_in | No UI | — |

### Biometric Scenarios

| ID | Trigger | Preconditions | Decision Logic | Next State | Next Screen | Failure Path |
|----|---------|---------------|----------------|------------|-------------|--------------|
| B-01 | Splash routes to biometric | `authed=true`, `biometricEnabled=true`, HW+enrolled | `hasHardwareAsync()` + `isEnrolledAsync()` | supported_idle | `/biometric` | HW or enroll false → skip biometric, go to home |
| B-02 | User taps scan circle | `supported_idle` | `onScan()` → `setState('scanning')` | scanning | stay on `/biometric` | — |
| B-03 | Scan succeeds | scanning | `authenticateAsync().success=true` | success | after 700ms → `/home` | — |
| B-04 | Scan fails (wrong finger) | scanning | `authenticateAsync().success=false`, non-cancel error | fail | stay, show fail text | — |
| B-05 | User cancels scan | scanning | `authenticateAsync().error=user_cancel/system_cancel/app_cancel` | supported_idle | stay, show idle UI | — |
| B-06 | User enters biometric gate without enable | Navigates to `/biometric` | `biometricEnabled=false` | disabled | redirect to `/home` (authed) or `/auth` (unauthed) | — |
| B-07 | Biometric unsupported | `capability_checking` | HW or enrolled returns false | unsupported | show message, link to phone login | — |

### Onboarding Scenarios

| ID | Trigger | Preconditions | Decision Logic | Next State | Next Screen | Failure Path |
|----|---------|---------------|----------------|------------|-------------|--------------|
| O-01 | First-time user on splash | `authed=false, hasAuthenticatedBefore=false` | No session, no history | new_user | `/intro` | — |
| O-02 | Intro slide navigation | On `/intro`, slide i<2 | Tap Next or dot | — | next slide (i+1) | — |
| O-03 | Intro carousel complete | On `/intro`, slide i=2 | Tap "ابدأ" | — | `/welcome` | — |
| O-04 | Skip intro | On `/intro` | Tap "تخطي" | — | `/welcome` | — |
| O-05 | Welcome screen → register | On `/welcome` | Tap "أنشئ حساب جديد" | — | `/register` | — |
| O-06 | Welcome screen → login | On `/welcome` | Tap "عندي حساب" | — | `/auth` | — |
| O-07 | Welcome screen → biometric | On `/welcome`, biometric enabled+supported | Tap "دخول سريع بالبصمة" | — | `/biometric` | — |
| O-08 | Location permission granted | On `/location-permission` | Tap "استخدم موقعي الحالي" | — | `/address-setup` | — |
| O-09 | Location manual entry | On `/location-permission` | Tap "أدخل يدوي" | — | `/address-setup?manual=1` | — |
| O-10 | Address detection succeeds | `/address-setup` | `detectAddress()` returns address | — | confirm step | `detectAddress()` throws → show detectFailed screen |
| O-11 | Address detection retry | detectFailed screen | Tap "إعادة المحاولة" | — | detecting step again | Same fail path |
| O-12 | Address saved | confirm step, street filled | `addLocal()` → `router.replace('/')` | — | splash → home | — |
| O-13 | Returning user onboarding check | `hasCompletedOnboarding=true` | Skipped intro/welcome | — | `/auth` or `/biometric` | — |

### Customer Scenarios (Home, Search, Shop, Product, Cart)

| ID | Trigger | Preconditions | Decision Logic | Next State | Next Screen | Failure Path |
|----|---------|---------------|----------------|------------|-------------|--------------|
| C-01 | Tap category icon on home | Home screen | `router.push('/category', {key})` | — | `/category` | — |
| C-02 | Tap shop card | Any shop listing | `router.push('/shop', {id})` | — | `/shop` | — |
| C-03 | Tap product card | Shop screen or product listing | `router.push('/product', {id, shopId})` | — | `/product` | — |
| C-04 | Add product to cart (same shop) | On `/product`, has existing cart from same shop | `addItem()` → shopId matches | — | back to shop | — |
| C-05 | Add product to cart (different shop) | On `/product`, existing cart from different shop | `addItem()` → shopId mismatch | conflict | `/merchant-conflict` | — |
| C-06 | Replace cart on conflict | On `/merchant-conflict` | Tap "فضّي السلة وابدأ من جديد" | — | back to shop with new cart | — |
| C-07 | Keep cart on conflict | On `/merchant-conflict` | Tap "خلي السلة زي ما هي" | — | back to product | — |
| C-08 | Update product qty in cart | On `/cart`, stepper changed | `setItemQty(id, qty)` | — | stay on cart | — |
| C-09 | Remove product from cart | On `/cart`, stepper→0 or tap trash | ConfirmDialog → `setItemQty(id, 0)` | — | stay on cart | — |
| C-10 | Clear cart | On `/cart` | No direct clear (only via conflict replace or order success) | — | — | — |
| C-11 | Search for product | Search tab, enter text | Filter `PRODUCTS`/`SHOPS` locally | — | show results | Empty results → EmptyState |
| C-12 | View unavailable product | Navigate to `/product`, product.available=false | `useEffect` → redirect | — | `/unavailable` | — |
| C-13 | Favorite/Unfavorite product | On `/product`, tap heart | `toggleFavorite(product.id)` | — | — | — |

### Checkout & Payment Scenarios

| ID | Trigger | Preconditions | Decision Logic | Next State | Next Screen | Failure Path |
|----|---------|---------------|----------------|------------|-------------|--------------|
| P-01 | Proceed to checkout | Cart has items, tap Checkout | `router.push('/checkout')` | — | `/checkout` | Empty cart → show empty state |
| P-02 | Select cash payment | On `/checkout`, pay=cash | Place order → 900ms delay | — | `/order-success` | — |
| P-03 | Select card payment | On `/checkout`, pay=card | Place order → `router.push('/payment')` | — | `/payment` | — |
| P-04 | Submit card payment | On `/payment`, form valid | 900ms delay → `router.replace('/order-success')` | — | `/order-success` | Form invalid → button disabled |
| P-05 | Select wallet payment | On `/checkout`, pay=wallet | Place order → `router.push('/wallet-pay')` | — | `/wallet-pay` | — |
| P-06 | Confirm wallet payment (sufficient) | On `/wallet-pay`, balance >= total | `chargeWallet()` + 1100ms delay | — | `/order-success` | — |
| P-07 | Confirm wallet payment (insufficient) | On `/wallet-pay`, balance < total | Button disabled, alert shown | — | stay | — |
| P-08 | Apply promo code | On `/promo-code`, enter valid code | Match against `DEALS` array | — | shows success | Invalid → error message |
| P-09 | Apply promo "DELGATO10" | On checkout/cart | Hardcoded match | — | applies 10% or flat discount | — |
| P-10 | Schedule delivery | On `/checkout`, tap schedule | Navigate to `/scheduled-delivery` | — | pick slot, return | — |

### Order Scenarios

| ID | Trigger | Preconditions | Decision Logic | Next State | Next Screen | Failure Path |
|----|---------|---------------|----------------|------------|-------------|--------------|
| R-01 | Place order (cash/wallet) | Checkout submitted | Clear cart + add test order | order placed | `/order-success` | — |
| R-02 | Order success side-effects | `/order-success` mount | `clearCart()` + `addOrder(hardcoded)` | — | — | — |
| R-03 | Track order | On `/order-success`, tap Track | Navigate to `/tracking` | — | `/tracking` | — |
| R-04 | Order progress simulation | `/tracking` mount | `setTimeout` every 5s, step 0→1→2→3 | — | progress bar + courier card | — |
| R-05 | Courier appears | step >=2 | Render courier name, phone, chat buttons | — | courier card shown | — |
| R-06 | Order delivered | step=3 | Show "done" buttons + rate prompt | — | rate / home buttons | — |
| R-07 | View order history | Orders tab | `useOrdersStore.orders` list | — | filter: all/live/done | Empty → EmptyState |
| R-08 | Cancel order | Order detail/orders list | `cancelOrder(id)` → sets status to cancelled | cancelled | — | — |
| R-09 | Request refund | Order detail | `requestRefund()` → creates refund request | — | — | — |
| R-10 | Order rejected by merchant | SLA timeout (domain) | `MockOrderRepository.tick()` → auto-reject | rejected | — | — |
| R-11 | Order placed (domain) | Checkout submitted via OrderRepository | `place()` → store order, emit event | new | — | Empty items → ValidationError |

### Merchant Scenarios (Design Reference Only, No Production Code)

| ID | Trigger | Preconditions | Decision Logic | Next State | Next Screen | Failure Path |
|----|---------|---------------|----------------|------------|-------------|--------------|
| M-01 | Merchant login | Not implemented | Same OTP flow as customer | — | merchant dashboard | — |
| M-02 | Merchant dashboard | Not implemented | Orders summary, revenue KPI | — | dash | — |
| M-03 | Accept order | Not implemented | `orderRepo.accept(id)` | accepted | order queue | ConflictError if invalid transition |
| M-04 | Reject order | Not implemented | `orderRepo.reject(id, reason)` | rejected | order queue | — |
| M-05 | Start preparing | Not implemented | `orderRepo.startPreparing(id)` | preparing | order queue | — |
| M-06 | Mark ready | Not implemented | `orderRepo.markReady(id)` | ready | order queue | — |
| M-07 | Handover to driver | Not implemented | `orderRepo.handover(id, driverId)` | picked | order queue | — |
| M-08 | Product CRUD | Not implemented | create/update/delete product | — | products | — |
| M-09 | Toggle product availability | Not implemented | set available/unavailable | — | products | — |
| M-10 | Create promotion | Not implemented | promo type/value/dates | — | promotions | — |
| M-11 | Store hours change | Not implemented | Set per-day schedule | — | settings | — |
| M-12 | Temporary close | Not implemented | Toggle temp close + reason | — | settings | — |
| M-13 | View analytics | Not implemented | Charts: revenue, orders, top products | — | analytics | — |
| M-14 | Reply to review | Not implemented | Post response to customer review | — | reviews | — |
| M-15 | View payouts | Not implemented | Next payout + history | — | payouts | — |

### Settings Scenarios

| ID | Trigger | Preconditions | Decision Logic | Next State | Next Screen | Failure Path |
|----|---------|---------------|----------------|------------|-------------|--------------|
| S-01 | Toggle biometric on | Settings | `setBiometricEnabled(true)` | biometric enabled | — | — |
| S-02 | Toggle biometric off | Settings | `setBiometricEnabled(false)` | biometric disabled | — | — |
| S-03 | Change language to English | Settings/language | `setLanguage('en')` → i18n locale + RTL | 'en' locale | — | — |
| S-04 | Change language to Arabic | Settings/language | `setLanguage('ar')` → i18n locale + RTL | 'ar' locale | — | — |
| S-05 | Change password | `/change-password` | Mock form, no validation | — | — | No API |
| S-06 | Delete account | `/delete-account` | Mock confirmation, no API call | — | — | No API |
| S-07 | Logout | Profile | ConfirmDialog → `signOut()` → navigate to `/` | signed_out | splash → auth | API error swallowed |

### Edge Case Scenarios

| ID | Trigger | Preconditions | Decision Logic | Next State | Next Screen | Failure Path |
|----|---------|---------------|----------------|------------|-------------|--------------|
| E-01 | Mock fail rate triggered | `MOCK_FAIL_RATE>0`, mutation call | `LatencyEngine` throws `NetworkError` | error | error thrown to caller | UI shows error alert |
| E-02 | Axios 401/403 | Any HTTP request (HTTP mode) | Interceptor → `setSignOutHandler` → `signOut()` | session_expired | splash → auth | — |
| E-03 | API timeout | Any Axios call | 12s timeout → error | error | error alert | — |
| E-04 | Invalid order transition | Merchant tries illegal transition | `MockOrderRepository.transition()` → `ConflictError` | stays same | error thrown | — |
| E-05 | API_MODE=http activation | `process.env.EXPO_PUBLIC_API_MODE=http` | All `Http*Repository` wired → all throw `NotImplementedError` | — | app crashes on any data operation | Every repo method throws |
| E-06 | Direct deep link to `/checkout` unauthed | No session, navigate straight to `/checkout` | No guard → shows checkout with empty cart | — | `/checkout` empty cart | Empty state shown |
| E-07 | Platform store version mismatch | AsyncStorage data with old version | No migration handler in persist config | — | corrupt data loads silently | Unpredictable behavior |
| E-08 | Push notification received while killed | Notification arrives | `expo-notifications` registered | — | — | No `responseListener` to handle tap |
| E-09 | Navigate to `/category` with invalid key | Invalid key in params | `CATEGORIES.find()` falls back to first non-'all' category | — | categories[1] shown | — |
| E-10 | Demo merchant seed data | First boot after install | `hydratePlatformSeed()` applies SEED_BUNDLE | hydrated | — | — |
