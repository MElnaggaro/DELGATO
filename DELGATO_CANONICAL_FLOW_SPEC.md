# DELGATO — Canonical Application Flow Specification

**Status:** Source of truth for implementation
**Scope:** Customer + Merchant — full behavioral architecture
**Audience:** Engineering, Product, Design
**Supersedes:** All previous routing/flow assumptions inside `delngato-app/app/index.tsx`, `(onboarding)/*`, ad-hoc auth gates, and the simulated tracking pipeline.
**Constraint:** Visual design is locked to `design/design-reference` and `design/design-system`. This document only governs *behavior, routing, state, and side effects.*

---

## 0. How To Read This Document

- Every state is a **finite, named symbol** — not a boolean flag combination.
- Every transition is **deterministic** — given (state, event, context) the next state is fixed.
- Every screen has **exactly one routing authority** — the **Routing Resolver** (Section 2.4). Screens never decide where to go on mount.
- **"MUST / SHOULD / MAY"** follow RFC 2119.
- All async behavior is **idempotent**. Re-entering any flow MUST converge on the same state.
- Mock infrastructure MUST behave like the production contract — never short-circuit logic that the real backend will enforce.

---

## 1. Executive Architectural Decisions

These are the load-bearing decisions. Everything downstream depends on them.

### 1.1 Two products, one binary, one identity

| Decision | Choice | Why |
|---|---|---|
| App split | **Single binary** with role-scoped runtime shells | Same OTA, same auth identity, allows multi-role users (a merchant who also orders food). |
| Identity model | **One `User`, many `RoleProfiles`** (`customer`, `merchant`, future: `courier`) | A phone number is a person. Roles are *capabilities* on that person, not separate accounts. Avoids duplicate KYC, duplicate wallets, duplicate notifications. |
| Token model | **One refreshable session token + active `roleContext`** | A user with both roles holds *one* session. Switching roles is a context switch, not a re-login. (Replaces today's split `delngato.sessionToken` / `delngato.merchant.sessionToken`.) |
| Default role on cold start | **Last active role**, falling back to `customer` if ambiguous | Matches user intent 99% of the time. New installs always start as customer. |

### 1.2 Routing model

| Decision | Choice | Why |
|---|---|---|
| Source of truth | **`AppState` machine** (Section 2) drives a single **Routing Resolver** | Eliminates the current flag-juggling in `app/index.tsx`. No screen decides routing — they emit events; the resolver routes. |
| Route guards | **Centralized in resolver**, not per-screen | Deep links cannot bypass auth/onboarding/role gates. Today's checkout is reachable while logged out — that ends. |
| Splash | **Always shown** for branding (≥800ms) + **work hidden behind it** until `AppState` resolves | No flash-of-wrong-screen, no double-route. |

### 1.3 Domain vs UI parity

| Decision | Choice | Why |
|---|---|---|
| Single order reality | **All order state comes from `OrderRepository`** — UI never invents orders | Today's `order-success.tsx` hardcoding `DLN-2047` and `tracking.tsx` running its own 5-second timer is a parallel reality. It MUST be deleted. |
| Realtime first | **Subscriptions** (`order.*`, `stock.*`, `payout.*`) feed both customer and merchant UIs | Mock realtime client already exists. Use it. UI re-renders from events, not from local timers. |
| Optimistic UI only at the *action* level | Add-to-cart, accept-order, etc. may render optimistic — server reconciles in <2s | Avoids ghost orders and ghost stock. |

### 1.4 Failure posture

| Decision | Choice | Why |
|---|---|---|
| Offline | **First-class state**, surfaced as a global banner + per-action degradation | The `OfflineBanner` already exists; today it is unused. |
| Session expiry | **Hard interrupt** to a *session-expired* modal, not a silent boot back to splash | Users currently lose context on 401 — destructive. |
| Mock = production contract | Mock repos MUST throw the same shape of errors (`ValidationError`, `ConflictError`, `NotFoundError`, `NetworkError`, `AuthError`) the HTTP layer will throw | Today HTTP stubs throw `NotImplementedError` everywhere — that is acceptable for a stubbed-out mode, but mock repos MUST simulate full failure modes so screens are tested against them. |

### 1.5 What we are explicitly NOT doing

- **No separate merchant binary.** One app, two shells.
- **No biometric for merchants** on first release (merchants log in less frequently; biometric here is low-value, high-friction; revisit post-launch).
- **No "guest" customer mode** on first release. Browsing requires no login *up to the cart*; checkout requires phone-verified identity. (Today's app already behaves this way; we're codifying it.)
- **No password for customers.** Customer auth = phone + OTP only. Merchants get phone + password + optional OTP (per design reference).

---

## 2. Startup State Machine

### 2.1 The canonical `AppState`

```
AppState ::=
  | UNKNOWN
  | BOOTING
  | HYDRATING
  | FIRST_RUN
  | UNAUTHENTICATED
  | AUTH_OTP_PENDING        { phone, role, resendInSec }
  | BIOMETRIC_REQUIRED      { role }
  | ROLE_SELECTION_REQUIRED { availableRoles[] }
  | PROFILE_SETUP_REQUIRED  { role, missingFields[] }
  | ADDRESS_SETUP_REQUIRED       (customer only)
  | MERCHANT_SETUP_REQUIRED { missingFields[] }  (merchant only)
  | MERCHANT_KYC_PENDING         (merchant only, soft block)
  | MERCHANT_SUSPENDED           (merchant only, hard block)
  | READY                  { role: 'customer' | 'merchant' }
  | SESSION_EXPIRED
  | LOCKED_OUT             { reason, until? }
  | OFFLINE_DEGRADED       { previousState }
  | FATAL                  { code, recoverable }
```

> `READY` is the only state with a tab bar. Every other state is a full-screen route owned by the resolver.

### 2.2 Boot sequence

```
NATIVE_BOOT
  └─► BOOTING        (fonts, i18n, RTL)
        └─► HYDRATING (DI container, platform store, session restore, role context)
              └─► RESOLVE() → one of the AppStates above
                    └─► SPLASH hides only after RESOLVE() returns a terminal state
```

**Splash MUST NOT hide on a timer.** It hides when `AppState != BOOTING && AppState != HYDRATING`. A 800–1400ms *minimum hold* is permitted for brand polish, but the hold runs *parallel* to hydration, not before it.

### 2.3 State transitions

| From | Event | Guard | To |
|---|---|---|---|
| `UNKNOWN` | `boot.start` | — | `BOOTING` |
| `BOOTING` | `boot.fonts_ready` ∧ `boot.i18n_ready` | — | `HYDRATING` |
| `HYDRATING` | `hydrate.complete` | no session ∧ no `hasAuthenticatedBefore` | `FIRST_RUN` |
| `HYDRATING` | `hydrate.complete` | no session ∧ `hasAuthenticatedBefore` | `UNAUTHENTICATED` |
| `HYDRATING` | `hydrate.complete` | session valid | `RESOLVE_AUTHED()` |
| `FIRST_RUN` | `onboarding.intro_dismissed` | — | `UNAUTHENTICATED` |
| `UNAUTHENTICATED` | `auth.otp_requested` | — | `AUTH_OTP_PENDING` |
| `AUTH_OTP_PENDING` | `auth.otp_verified` | — | `RESOLVE_AUTHED()` |
| `AUTH_OTP_PENDING` | `auth.cancelled` | — | `UNAUTHENTICATED` |
| `*` | `session.expired` | — | `SESSION_EXPIRED` |
| `SESSION_EXPIRED` | `auth.otp_verified` | — | `RESOLVE_AUTHED()` |
| `*` | `network.offline` | — | `OFFLINE_DEGRADED { previous }` |
| `OFFLINE_DEGRADED` | `network.online` | — | `previous` |
| `READY{role}` | `role.switch_requested` | user has other role | `ROLE_SELECTION_REQUIRED` |
| `READY{role}` | `auth.signed_out` | — | `UNAUTHENTICATED` |
| `READY{merchant}` | `merchant.suspended` | — | `MERCHANT_SUSPENDED` |

### 2.4 The Routing Resolver

A single pure function:

```
resolve(appState, context) → Route
```

| `AppState` | Route |
|---|---|
| `BOOTING` / `HYDRATING` | `/_splash` (native splash overlay still up) |
| `FIRST_RUN` | `/(onboarding)/intro` |
| `UNAUTHENTICATED` | `/(onboarding)/welcome` |
| `AUTH_OTP_PENDING` | `/(auth)/otp` |
| `BIOMETRIC_REQUIRED` | `/(auth)/biometric` |
| `ROLE_SELECTION_REQUIRED` | `/(auth)/role` |
| `PROFILE_SETUP_REQUIRED` | `/(onboarding)/profile?role={role}` |
| `ADDRESS_SETUP_REQUIRED` | `/(onboarding)/address` |
| `MERCHANT_SETUP_REQUIRED` | `/(onboarding)/merchant-setup?step={firstMissing}` |
| `MERCHANT_KYC_PENDING` | `/(merchant)/kyc-pending` |
| `MERCHANT_SUSPENDED` | `/(merchant)/suspended` |
| `READY{customer}` | `/(customer)/(tabs)/home` |
| `READY{merchant}` | `/(merchant)/(tabs)/dashboard` |
| `SESSION_EXPIRED` | modal `/_modals/session-expired` over current route, blocking |
| `OFFLINE_DEGRADED` | persistent banner; route unchanged |
| `LOCKED_OUT` | `/(auth)/locked` |
| `FATAL{recoverable}` | `/_error` with retry |

> Screens MUST observe `AppState` and let the resolver navigate. A screen that calls `router.replace` on mount based on its own derived logic is a **bug**.

### 2.5 `RESOLVE_AUTHED()` — the post-auth fan-out

Pure function over the authenticated user's profile:

```
RESOLVE_AUTHED(user, lastRole):
  if !user.profileComplete(currentRole): return PROFILE_SETUP_REQUIRED
  if user.roles.length == 0: return PROFILE_SETUP_REQUIRED  # bootstrap
  if user.roles.length == 1: targetRole = user.roles[0]
  else:
    if lastRole && user.hasRole(lastRole): targetRole = lastRole
    else: return ROLE_SELECTION_REQUIRED

  if targetRole == 'customer':
    if !user.customer.addresses.length: return ADDRESS_SETUP_REQUIRED
    if settings.biometricEnabled && bio.supported && !session.biometricVerifiedThisSession:
      return BIOMETRIC_REQUIRED{customer}
    return READY{customer}

  if targetRole == 'merchant':
    if user.merchant.kycStatus == 'rejected' || user.merchant.suspended: return MERCHANT_SUSPENDED
    if user.merchant.kycStatus == 'pending': return MERCHANT_KYC_PENDING
    if !user.merchant.profileComplete: return MERCHANT_SETUP_REQUIRED
    return READY{merchant}
```

---

## 3. Auth Architecture

### 3.1 Identity model

```
User {
  id, phone (unique, verified),
  displayName, email?, avatar?,
  createdAt,
  roles: Role[]              # ['customer'] | ['merchant'] | ['customer','merchant']
  customer?: CustomerProfile  # addresses, favorites, wallet, loyalty
  merchant?: MerchantProfile  # store(s), kycStatus, suspended, payoutAccount
  security: { biometricEnabled, passwordSetAt?, lastLoginAt }
}
```

**Phone is the universal primary key.** A user with both roles has one User row, one phone, one wallet (the customer wallet), one notification preference set.

### 3.2 Session

```
Session {
  userId, accessToken, refreshToken,
  issuedAt, expiresAt,
  activeRole: 'customer' | 'merchant',
  biometricVerifiedThisSession: bool,
  deviceId
}
```

Stored in `SecureStore` under a single key: `delgato.session.v2`. The legacy split (`delngato.sessionToken` / `delngato.merchant.sessionToken`) is **deprecated** — migrated on first launch of new version.

### 3.3 Customer auth — phone + OTP

```
Welcome
 ├─ "أنشئ حساب" → Register (name, phone, optional email, T&Cs) → OTP → RESOLVE_AUTHED
 └─ "عندي حساب" → Login (phone) → OTP → RESOLVE_AUTHED
```

- OTP: 6 digits, 60s resend lockout, 5 attempts then 30-min lockout.
- Successful OTP for an **existing** phone signs in to that User regardless of which role they had — `RESOLVE_AUTHED` handles role fan-out.
- Successful OTP for a **new** phone via the "Login" entrypoint MUST be treated as registration (zero-friction sign-up). Show a one-tap "Welcome — let's set your name" step. This eliminates the dead-end of users tapping "login" first and getting an error.

### 3.4 Merchant auth — phone + password + step-up OTP

Per design reference (`merchant/screens/Auth.jsx`):

```
MerchantSplash
 └─ Login (phone + password)
       ├─ Known device      → RESOLVE_AUTHED
       └─ New device / risk → OTP step-up → RESOLVE_AUTHED
```

- Password required (≥8 chars, breach-checked at registration). Merchants are operating businesses; password establishes operator continuity.
- "Forgot password" → phone OTP → set new password.
- Merchant **registration** is *not* in-app on day one. Onboarding is a separate sales-driven flow (web form + KYC). The app's merchant login screen MUST NOT offer self-registration unless `featureFlags.merchantSelfSignup` is on.

### 3.5 Single user, dual roles

If a phone owns both roles:

- One password (for merchant operator continuity).
- Customer side still uses OTP, ignoring the password.
- After OTP/password success → if `lastActiveRole` is set, route into that role's shell; otherwise `ROLE_SELECTION_REQUIRED`.
- Role switch from inside the app is a **context switch**, not a logout: `setActiveRole(role)` → resolver re-runs → routes to the other shell. Session token is unchanged.

### 3.6 Logout

| Trigger | Effect |
|---|---|
| User taps logout (customer profile or merchant settings) | Confirm dialog → revoke session server-side (best-effort) → clear `delgato.session.v2` → clear in-memory stores → `AppState = UNAUTHENTICATED` (preserve `hasAuthenticatedBefore=true`) |
| `session.expired` from API interceptor | Show **modal** (not full nav reset). User taps "Sign in again" → opens auth flow → on success returns to the route they were on (`returnTo`) |
| User changes phone | Same as logout, then redirect into registration with new phone pre-filled |

### 3.7 Session refresh

- Background refresh ≤5 min before `expiresAt`.
- 401/403 from any call → attempt one refresh → on failure, `session.expired`.
- Refresh failures MUST NOT silently navigate the user. The modal is the contract.

---

## 4. Role Architecture

### 4.1 Role selection screen

Shown only when a user has both roles **and** `lastActiveRole` is unset (first login, or after explicit "switch role" action).

Two tiles, large, design-system styled:

```
┌───────────────┐  ┌───────────────┐
│   🛒          │  │   🏪          │
│   عميل        │  │   صاحب محل    │
│   اطلب…      │  │   ادر محلك… │
└───────────────┘  └───────────────┘
        [tick] تذكر اختياري        ← persists lastActiveRole
```

Selection writes `lastActiveRole`, runs `RESOLVE_AUTHED`.

### 4.2 Role switching from inside the app

| Location | Entry point |
|---|---|
| Customer profile screen | "Switch to merchant" tile — only visible if `user.hasRole('merchant')` |
| Merchant settings | "Switch to customer view" — only visible if `user.hasRole('customer')` |

Behavior:

1. Confirm dialog ("سيتم الانتقال إلى تطبيق التاجر — متابعة؟")
2. `setActiveRole(newRole)`
3. Clear role-scoped in-memory caches (cart for customer-leaving, order queue subscription for merchant-leaving). **Persisted** state is untouched.
4. Resolver re-runs → routes to the new shell with a brand-consistent transition (fade through splash logo, ≤600ms).

### 4.3 Role-scoped state

| Store | Scope | Cleared on role switch? |
|---|---|---|
| Cart | Customer | No (persists) |
| Addresses | Customer | No |
| Wallet | Customer | No |
| Order queue (merchant) | Merchant | Subscription closed, data retained |
| Selected store (for multi-store merchants) | Merchant | No |
| Settings (language, biometric) | User-level | No (shared) |
| Notification prefs | User-level, but with per-role channels | No |

### 4.4 Multi-store merchants (forward-compat)

`MerchantProfile.stores: Store[]`. If a merchant owns >1 store, after entering merchant shell show a one-tap store picker on first launch of session; persist `lastActiveStoreId`. All merchant screens operate within `activeStoreId`. Day-one MVP assumes one store per merchant; the data model leaves the door open.

---

## 5. Onboarding Architecture

### 5.1 First-run intro

Shown **exactly once** in a device's lifetime, gated by `settings.hasSeenIntro: bool` (persisted). 3 slides; "skip" and "start" both set the flag and go to welcome.

> **Fix vs current:** today the gating logic is muddled across `hasAuthenticatedBefore`, `hasCompletedOnboarding`, and the splash branch. Replace with the single flag above.

### 5.2 Welcome (unauthenticated hub)

Shown to every unauthenticated user (post-intro). It is the canonical home of `UNAUTHENTICATED`.

Surfaces:
- "Create account" → register
- "I already have an account" → login
- "Quick login with biometric" — *only if* `settings.biometricEnabled && bio.supported && hasAuthenticatedBefore`
- Small "I'm a merchant" link → merchant login (or merchant info page if self-signup off)

Welcome MUST NOT be shown to authed users. Direct navigation to `/welcome` while authed redirects via resolver.

### 5.3 Profile setup

Triggered when `PROFILE_SETUP_REQUIRED`. One screen per missing field, no more. For customer day-one the field list is just `displayName` (collected at registration); this state exists for forward-compat (avatar, DOB, preferences).

### 5.4 Address setup (customer)

Triggered when `ADDRESS_SETUP_REQUIRED`. Two-step:

1. Location permission request (with rationale screen).
2. Auto-detect → confirm/edit → label (home/work/other) → save → `RESOLVE_AUTHED`.

Permission denied → manual entry flow. The user MUST be able to skip with a "أضف عنواناً لاحقاً" link **only if** they will be blocked at checkout (we MUST NOT let them through checkout without an address).

### 5.5 Merchant setup

Triggered when `MERCHANT_SETUP_REQUIRED`. Multi-step wizard with progress bar:

1. Store profile (name, category, description, logo)
2. Working hours (per-day schedule)
3. Delivery radius, prep time
4. Payment preferences (cash/card/wallet accepted)
5. Bank/payout account
6. First product (optional, can skip)

Every step is independently saveable. Resuming mid-flow (app killed and reopened) MUST land on the first missing step, never restart from step 1.

### 5.6 What MUST NOT trigger onboarding

- Coming back from background.
- Session refresh.
- Role switch (when both roles are already complete).
- Settings changes.

Each of these is currently a foot-gun in flag-based routing; the state machine eliminates them.

---

## 6. Biometric Architecture

### 6.1 Scope

- **Customer only** at MVP.
- Biometric is a **session unlock**, not an auth factor. It does not bypass OTP — it bypasses *re-typing nothing.* The user must have completed OTP at least once on this device.

### 6.2 States

```
BiometricState ::=
  | DISABLED              (settings.biometricEnabled=false)
  | UNSUPPORTED           (no HW or no enrollment)
  | SUPPORTED_IDLE
  | SCANNING
  | VERIFIED              (writes session.biometricVerifiedThisSession=true)
  | FAILED                (retryable)
  | LOCKED                (too many failures, 60s cooldown)
```

### 6.3 When biometric is asked

| Trigger | Behavior |
|---|---|
| Cold start, authed, `biometricEnabled=true`, supported | Show biometric gate before resolver returns READY |
| Backgrounded ≥10min then foregrounded | Re-prompt biometric |
| Sensitive action (wallet top-up >500 EGP, delete account) | Step-up biometric regardless of session flag |
| `biometricEnabled=false` | Skip entirely; never show |
| `unsupported` | Skip entirely; never block. Show in settings as "غير متاح على هذا الجهاز" disabled toggle |

### 6.4 Failure handling

- 3 consecutive failures → `LOCKED` for 60s → after cooldown, allow retry **or** "Sign in with phone" escape hatch.
- "Sign in with phone" = full OTP flow, after which biometric becomes available again.
- Cancel (user/system/app) → return to `SUPPORTED_IDLE`. Never auto-skip past biometric on cancel — that defeats the gate.

### 6.5 Enabling biometric

In Settings → toggle on. App MUST:
1. Run capability check immediately.
2. If unsupported → snackbar, toggle stays off.
3. If supported → perform one-time enrollment scan to confirm enrollment works.
4. On success → persist `biometricEnabled=true`. Next cold start gates on biometric.

> **Fix vs current:** today the settings toggle persists without verifying enrollment works on this device. New gate prevents users from locking themselves out.

### 6.6 Merchant biometric

Out of scope for MVP. Toggle does not appear in merchant settings. Re-evaluate post-launch with usage data.

---

## 7. Customer Canonical Journeys

> Every screen below is a route under `app/(customer)/`. Tab bar lives only in `READY{customer}`.

### 7.1 Browse → Discover → Buy (the spine)

```
home ─┬─► search ─────► results ──┐
      ├─► category[key] ──────────┤
      ├─► featured / nearby ──────┼─► shop[id] ──► product[id]
      └─► active-order banner ────┴───────────────┘
                                                       │
                                       ┌── unavailable ┤
                                       │               ▼
                                       │       cart (single-shop guarantee)
                                       │               │
                                       │   conflict ◄──┤ different shop
                                       │       │       │
                                       └───────┘       ▼
                                                  checkout
                                                       │
                                              ┌────────┼────────┐
                                              ▼        ▼        ▼
                                            cash     card    wallet
                                              │        │        │
                                              └────► place ◄────┘
                                                       │
                                                  order-success
                                                       │
                                                       ▼
                                                  tracking ◄── (also from home banner / orders tab)
```

### 7.2 Home

- Resolver guarantees: authed customer, addresses≥1, biometric verified if required.
- Sections (top-down): address bar, search field (tap → `/search`), categories strip, **active-order banner** (only if `orders.live.length > 0`, tap → tracking for most recent live order), hero deal, quick-access tiles, nearby shops.
- All data comes from repositories with realtime subscriptions; no hardcoded arrays.

### 7.3 Search

- Debounced (300ms) call to `DiscoveryRepository.search(query)`.
- Local recent searches persisted (last 8, dedup, oldest evicted).
- Empty results state per current design.
- Trending searches come from `DiscoveryRepository.trending()`, not hardcoded.

### 7.4 Shop & Category

- Both screens fetch from repositories with realtime stock subscription so an item going out-of-stock disables its Add button live (no refresh needed).
- Sort/filter is server-side. Client preserves last-used filters per category.

### 7.5 Product detail

- Fetches product by id; if `available=false` → resolver redirects to `/(customer)/unavailable` with shop context.
- Variants/modifiers supported (data model ready; UI per design reference's `ProductExtras.jsx`).
- Add to cart:
  - Same shop → adds, animates badge.
  - Different shop → routes to `/(customer)/merchant-conflict` with `pending: {productId, shopId, qty, modifiers}` so on "replace cart" we know what to add after clearing.

### 7.6 Cart

- Single-shop invariant **enforced by repository**, not by UI politeness.
- Cart line edits and removals call the repository; optimistic UI, server reconciles.
- Cart persists across sessions and across role switches.
- Cart MUST be revalidated when entering checkout: re-fetch product availability and prices. Any change → modal "Some items have changed" with diff, user confirms or edits.

### 7.7 Checkout

Required to proceed:
- Address selected (default address auto-applied; if none, route into address picker).
- Payment method selected.
- All items still available.
- Shop currently open (or scheduling slot picked for closed-but-schedulable).

Place Order:

1. **Pre-flight** (synchronous): cart revalidation, address valid, shop open or scheduled, total matches displayed.
2. **Reserve inventory** (server-side hold, expires in 90s).
3. **Payment routing**:
   - Cash → skip payment, `OrderRepository.place(...)` → `order-success`.
   - Card → `/(customer)/payment` → on tokenize success → `OrderRepository.place(... paymentToken)` → `order-success`.
   - Wallet → `/(customer)/wallet-pay` → confirm → `WalletRepository.hold(amount, orderId)` → `OrderRepository.place(... walletHoldId)` → `order-success`. (Hold, not charge — see Section 12.)
4. Failure at any step → release reservation, return to checkout with explicit error, no ghost orders.

### 7.8 Order success → tracking

- `order-success` is **stateless on its own**. It receives `orderId` from the place-order result. It does **not** clear the cart or insert orders into stores — `OrderRepository.place` does both as part of its commit.
- Tap "Track Order" → `/(customer)/tracking?orderId={id}`.
- Tap "Back home" → home; active-order banner picks up the new live order.

> **Fix vs current:** today `order-success.tsx` calls `clearCart()` and inserts a hardcoded `DLN-2047` into the orders store on mount. Both are deleted.

### 7.9 Tracking

- Subscribes to `order.{orderId}.updates` realtime channel.
- Status mapped from canonical `OrderStatus` (Section 10) → UI step (received → preparing → on the way → delivered).
- Courier card appears when `OrderStatus >= picked` AND `order.courier` is populated.
- Map renders driver location from `courier.location` updates (mock can emit synthetic moves; real backend emits true GPS).
- No local timers driving status. All movement comes from the realtime channel.

### 7.10 Orders history

- Tabs: `live` / `done` / `all`.
- `live` = `pending|accepted|preparing|ready|picked`.
- `done` = `delivered|cancelled|rejected|refunded`.
- Tap order:
  - Live → tracking.
  - Done → order detail (read-only) with reorder, reviewreport-issue, refund-status.

### 7.11 Reorder

`OrderRepository.reorder(orderId)`:
1. Snapshot items, validate availability, validate shop open.
2. If all OK → drop items into cart (replacing existing cart with conflict prompt) → navigate to cart.
3. If partial → show "Some items unavailable" sheet, user confirms partial reorder.

### 7.12 Profile, settings, support

Behavioral notes (UI per design reference):

- Edit profile is in-place; phone change forces re-verification (see 3.6).
- Language switch (`ar`/`en`) is instant; RTL flip without restart.
- Delete account is two-step: confirm → 7-day grace period (account marked `pending_deletion`); user can cancel by signing in during the window.
- Support: chat opens a real ticket via `SupportRepository.createTicket`; FAQs come from CMS. (No more "coming soon" alerts.)

### 7.13 Notifications & deep links

See Section 13.

### 7.14 Reviews

- Triggered by `order.delivered` event → 24h window to leave review.
- Customer profile shows past reviews.
- Submission posts to `ReviewRepository`; merchant sees in their reviews screen.

### 7.15 Referrals

- Code generated server-side, stable per user, fetched from `LoyaltyRepository.referralCode()`.
- Share intent uses native share with a `/(deeplinks)/r/{code}` URL.
- New user joining via referral link → code captured at registration → reward credited to both on first successful customer order (`order.delivered`).

---

## 8. Merchant Canonical Journeys

> All screens under `app/(merchant)/`. Tab bar lives only in `READY{merchant}`.

### 8.1 Auth

Per Section 3.4. Splash → login (phone + password) → optional OTP step-up → `RESOLVE_AUTHED` → dashboard (or KYC/suspended/setup gates).

### 8.2 Dashboard

- **KPIs** (today): orders count, revenue, avg order value, prep time average.
- **Live order queue summary**: count of `pending` (needs accept/reject), `preparing`, `ready` (needs handover).
- **Acceptance toggle**: `acceptingOrders: bool` — pause/resume new orders. Pausing does not affect in-flight orders; customers see shop as "temporarily not accepting orders" in discovery.
- Quick actions: products, analytics, settings, payouts.
- Realtime: subscribes to `store.{storeId}.orders` so dashboard updates without refresh.

### 8.3 Orders

Tabs: `new` (= `pending`), `accepted`, `preparing`, `ready`, `done`.

Per order:

| Status | Actions |
|---|---|
| `pending` | Accept (with confirmed prep time), Reject (with reason from dropdown) |
| `accepted` | Start preparing, Cancel (with reason — penalty applies) |
| `preparing` | Mark ready |
| `ready` | Handover (assigns to courier — picks from in-app courier pool or "self-delivery" if merchant runs own driver) |
| `picked` / `delivered` | View only |

Every action calls `OrderRepository.transition(...)` which:
- Validates status transition (see 10.2).
- Throws `ConflictError` on invalid → UI shows inline error, no state change.
- On success → emits domain event → customer's tracking subscription updates → notification dispatched.

**SLA**: `pending` orders auto-reject after `STORE.responseTimeoutSec` (default 300s). Domain handles this on `tick()`. UI shows countdown.

### 8.4 Products

CRUD per design reference. Edits propagate via `product.updated` event so customer-side product/shop/search screens reflect immediately.

Availability toggle is debounced (rapid toggle stays consistent) and emits `stock.{productId}.changed` for customer subscriptions.

### 8.5 Catalog

Categories CRUD. Reorder via drag (persisted as `displayOrder`). Deleting a category requires re-assigning or unassigning its products (modal).

### 8.6 Promotions

Per design reference. Create promo → server validates (date range, no overlap with same-code, usage limit ≥1). Activation toggle. Customer-side cart applies via `PromoRepository.validate(code, cart)` — same code path the customer hits when entering a promo.

### 8.7 Analytics

Read-only views over `AnalyticsRepository` queries. Mock returns deterministic synthetic data; real backend returns aggregates from data warehouse. No client-side aggregation.

### 8.8 Reviews

Subscribe to `store.{storeId}.reviews`. Reply is a single mutation; replies appear under the review on customer side.

### 8.9 Wallet & Payouts

- "Wallet" for merchant = **earnings ledger** (not a top-up wallet).
- Sections: pending earnings, next payout (amount + ETA), payout history.
- Payouts triggered server-side on schedule (weekly default). Merchant cannot trigger an ad-hoc payout in MVP.
- Bank account is editable but requires re-verification.

### 8.10 Staff

Staff list with roles (`owner`, `manager`, `staff`). Owner-only can add/remove. Each staff member is a User with role `merchant` and a `staffProfile` linked to the store; they log in with their own phone.

### 8.11 Settings

Per design reference. Behavioral notes:
- **Temporary close**: sets `store.temporarilyClosed=true` until time picker value; customer discovery filters it out automatically.
- **Working hours**: live edits do not retroactively cancel scheduled orders.
- **Payment preferences**: toggling off "cash" means customer checkout hides cash option immediately.
- **Tax**: changes apply to *new* orders only; historic orders show their tax-at-time.

### 8.12 Support

Ticket-based, same `SupportRepository` as customer.

---

## 9. Customer ↔ Merchant Interaction Flows

This is the heart of the application. Each interaction is a **named contract** between the two shells, mediated by domain events.

| # | Customer action | Merchant effect | Mechanism |
|---|---|---|---|
| I-1 | Place order | New order in merchant queue + sound + push | `order.placed` → realtime + notification |
| I-2 | Cancel before accept | Order disappears from merchant new queue | `order.cancelled` |
| I-3 | Request refund (post-delivery) | Refund ticket in merchant orders tab; merchant approves/disputes | `order.refund_requested` |
| I-4 | Submit review | Review appears in merchant reviews | `review.posted` |
| I-5 | Apply promo at checkout | Usage count increments on merchant's promo | `promo.applied` |
| # | Merchant action | Customer effect | Mechanism |
| I-6 | Accept order | Customer tracking advances to "accepted"; ETA displayed | `order.accepted` |
| I-7 | Reject order | Customer notified with reason; refund triggered if pre-paid | `order.rejected` + `refund.initiated` |
| I-8 | Start preparing | Tracking advances; prep timer shown | `order.preparing.started` |
| I-9 | Mark ready | Tracking advances; "courier en route" preview if dispatched | `order.ready` |
| I-10 | Handover to courier | Tracking shows courier + live map | `order.picked` + `courier.assigned` |
| I-11 | Toggle product unavailable | Product card disables Add button in real time; if in someone's cart, item flagged at checkout revalidation | `stock.changed` |
| I-12 | Edit product price | New price shows in shop/search; existing carts revalidated at checkout (price-change modal) | `product.updated` |
| I-13 | Create promo | Customer can enter code; appears in deals if marked `featured` | `promo.created` |
| I-14 | End/expire promo | Active applications remain valid until checkout; new attempts fail | `promo.ended` |
| I-15 | Temporarily close shop | Shop marked closed in discovery; orders-in-flight unaffected; new orders blocked | `store.closed` |
| I-16 | Reply to review | Reply visible in customer reviews list | `review.replied` |
| I-17 | Refund approved | Wallet credit issued + customer notified | `wallet.credited` + `order.refunded` |
| # | System | Effect | Mechanism |
| I-18 | SLA expiry on `pending` | Auto-reject; customer notified + refund if pre-paid | `order.auto_rejected` |
| I-19 | Reservation hold expires (90s) | Order place fails; customer prompted to retry | client-side timeout + re-validate |
| I-20 | Payment provider webhook (`paid`) | Order moves from `payment_pending` → `pending` on merchant side | `payment.confirmed` → `order.activated` |

### 9.1 Authority rules

- **Status transitions**: merchant authoritative for `pending → accepted/rejected → preparing → ready → picked`. System authoritative for `picked → delivered` (courier app or auto-delivered on cash-on-delivery confirmation). Customer authoritative for `pending|accepted|preparing → cancelled` (with cooldown rules).
- **Prices/stock**: merchant authoritative. Customer cart prices are advisory until checkout revalidation.
- **Refunds**: customer-initiated, merchant approves/disputes, system arbitrates after 48h.

---

## 10. Order Lifecycle

### 10.1 Canonical `OrderStatus`

```
OrderStatus ::=
  | payment_pending   (card/wallet not yet captured)
  | pending           (with merchant, awaiting accept/reject — visible in merchant queue)
  | accepted          (merchant accepted, not yet preparing)
  | preparing
  | ready             (ready for pickup/handover)
  | picked            (courier has it)
  | delivered
  | cancelled         (cancelled before delivery, by any actor)
  | rejected          (merchant rejected — distinct from cancelled for analytics)
  | refund_pending
  | refunded
  | issue_reported    (customer raised dispute, post-delivery)
```

> **Note**: `payment_pending` is new. Today the customer flow conflates payment and order — bad. Card payment fails *after* order placement currently leave a ghost. New flow: payment is captured/held *before* order goes to `pending` for the merchant.

### 10.2 Allowed transitions

| From | To | Actor | Notes |
|---|---|---|---|
| `payment_pending` | `pending` | system | on payment captured/held |
| `payment_pending` | `cancelled` | system/customer | on payment fail/timeout |
| `pending` | `accepted` | merchant | within SLA |
| `pending` | `rejected` | merchant | within SLA, with reason |
| `pending` | `cancelled` | customer | free cancel allowed |
| `pending` | `rejected` | system | SLA expiry → auto-reject |
| `accepted` | `preparing` | merchant | |
| `accepted` | `cancelled` | customer | free cancel allowed (5-min grace) |
| `accepted` | `cancelled` | merchant | with reason; counts against merchant SLA |
| `preparing` | `ready` | merchant | |
| `preparing` | `cancelled` | customer | requires confirmation; partial refund per policy |
| `preparing` | `cancelled` | merchant | with reason; full refund |
| `ready` | `picked` | merchant | handover |
| `picked` | `delivered` | system/courier | |
| `picked` | `issue_reported` | customer | "didn't receive" raised |
| `delivered` | `issue_reported` | customer | within 24h |
| `delivered` | `refund_pending` | customer | refund request |
| `refund_pending` | `refunded` | merchant/system | approved |
| `refund_pending` | `delivered` | merchant | declined (still delivered) |

Any other transition throws `ConflictError`.

### 10.3 Actors

| Actor | Capabilities |
|---|---|
| Customer | place, cancel (per rules), request refund, report issue, review |
| Merchant | accept, reject, start preparing, mark ready, handover, cancel (with penalty), refund-approve/decline |
| System | auto-reject on SLA, mark delivered (cash COD), expire holds, escalate disputes |
| Payment provider (webhook) | confirm/fail payment, confirm refund |
| Courier | mark picked (handover acknowledgement), mark delivered (with proof: signature/photo/PIN) |

### 10.4 SLA timers

| Status | Timer | On expiry |
|---|---|---|
| `payment_pending` | 90s | → `cancelled` (refund hold released) |
| `pending` | `store.responseTimeoutSec` (default 300s) | → `rejected` (system) |
| `accepted` | `store.startPrepTimeoutSec` (default 600s) | warn merchant; auto-cancel after 2× timeout |
| `preparing` | merchant-quoted `prepTimeMin` | warn customer if exceeded; no auto-action |
| `ready` | 1800s | warn merchant; escalate to ops |

### 10.5 Event emissions

Every transition emits a typed `DomainEvent`. Subscribers:
- Customer tracking screen for that order
- Merchant orders screen for that store
- Notification dispatcher (push + in-app)
- Analytics pipeline
- Wallet/payment engine (for holds, captures, refunds)

---

## 11. Payment Lifecycle

### 11.1 Methods

| Method | Flow | Capture timing |
|---|---|---|
| Cash on delivery | No upfront capture | Confirmed on delivery (`order.delivered`) |
| Card | Tokenize → authorize (hold) → capture on `order.delivered` | Hold at place, capture at deliver |
| Wallet | Hold at place, capture at deliver | Same |

### 11.2 States

```
PaymentState ::=
  | not_started
  | authorizing     (talking to PSP / wallet)
  | held            (funds reserved)
  | captured        (settled)
  | failed
  | released        (hold cancelled, no charge — on order cancel)
  | refunded
  | refund_pending
```

### 11.3 Place-order interaction

```
Customer taps "Place Order"
  ├─ Cash:
  │   OrderRepository.place(... payment={method:'cash'}) → order in pending
  ├─ Card:
  │   1. navigate /payment, tokenize → paymentToken
  │   2. PaymentRepository.authorize(token, amount, orderDraftId) → paymentRef (held)
  │   3. OrderRepository.place(... payment={method:'card', ref:paymentRef}) → order in pending
  │   4. on success → order-success; on failure → release hold, return to checkout
  └─ Wallet:
      1. WalletRepository.hold(amount, orderDraftId) → holdId
      2. OrderRepository.place(... payment={method:'wallet', ref:holdId}) → order in pending
      3. on failure → wallet.releaseHold(holdId)
```

### 11.4 Capture on delivery

`order.delivered` triggers `PaymentRepository.capture(ref)` for card/wallet. Failures here are *server-side problems*; customer is not blocked. Background reconciliation retries.

### 11.5 Refunds

- Customer request → `refund_pending`. Merchant has 24h to approve/decline; auto-approves after 24h for orders < EGP 500.
- Approved → `PaymentRepository.refund(ref, amount)`:
  - Card → refund to source.
  - Wallet → credit back to wallet (instant).
  - Cash → credit to wallet (since cash can't be reversed).
- Partial refunds supported (per-item).

### 11.6 Failure handling

| Failure | Behavior |
|---|---|
| Tokenization fail (card) | Stay on payment screen, show error, allow retry |
| Authorization decline | Same, with PSP message surfaced |
| Authorization timeout (>15s) | Treat as failure; release any partial state |
| Capture fail post-delivery | Order stays `delivered`; payment marked `failed`; ops queue handles |
| Refund fail | Stay `refund_pending`; ops queue retries; customer notified of delay, not error |

---

## 12. Wallet Lifecycle

### 12.1 Ledger model

A `Wallet` is an append-only ledger keyed by `userId`. Balance is derived: `sum(credits) - sum(debits) - sum(active_holds)`.

Transactions:

```
WalletTx ::= { id, userId, type, amount, balanceAfter, ref, createdAt, status }
type ::= topup | charge | refund | hold | release | adjustment | referral_bonus | loyalty_credit
status ::= pending | settled | reversed
```

### 12.2 Operations

| Op | Rules |
|---|---|
| Top-up (card) | `WalletRepository.topup(amount, paymentToken)` → authorize+capture in one step → `topup` tx, `settled` |
| Top-up (cash) | Not supported in MVP (no agent network). Removed from current app. |
| Hold (for order) | `hold(amount, orderId)` → `hold` tx, status `pending`; reduces available balance |
| Capture hold | On `order.delivered` → flip to `charge` tx, `settled` |
| Release hold | On `order.cancelled` → `release` tx, hold reversed |
| Refund | Credit back, `refund` tx, `settled` |
| Adjustment | Ops-only, audit-logged |

### 12.3 Insufficient funds

At checkout, wallet method is **disabled** if `availableBalance < total`. Customer sees "رصيدك غير كافٍ — اشحن المحفظة" with one-tap to top-up screen pre-filled to the needed amount.

### 12.4 Merchant payouts (separate ledger)

`PayoutRepository.next(storeId)` and `.history(storeId)`. Not the same primitive as customer wallet — merchant earnings flow to a bank account on a schedule. UI per design reference; behavior in 8.9.

### 12.5 Concurrency

- All mutations go through repository methods that take `ConditionalUpdate` semantics (compare-and-set on a wallet version). Two concurrent charges cannot double-spend.
- Mock MUST simulate this: include `version` field; reject mutations with stale version.

---

## 13. Notifications & Deep Links

### 13.1 Channels

| Channel | Customer | Merchant |
|---|---|---|
| Order updates | accepted, preparing, ready, picked, delivered, cancelled, rejected | new order, customer cancelled, customer issue, refund |
| Wallet | top-up confirmed, refund credited, low balance | — |
| Promotions | featured promo, personalized offer | — |
| System | session expiry, app update available | suspension, payout completed |
| Account | login from new device, password change | — |

User-controllable per category in settings. Push and in-app are separate switches per category.

### 13.2 Push payload contract

```
{
  type: 'order.status' | 'wallet.tx' | 'promo' | 'system' | 'account',
  deepLink: '/_dl/...'   // canonical deep link path
  title, body, data: { ... typed by type ... }
  requireAuth: bool,
  requireRole?: 'customer' | 'merchant'
}
```

### 13.3 Tap handling

Single registered `notification.response` listener at app root resolves:

```
on push tap:
  if AppState != READY:
    queue deepLink as pendingDeepLink
    let resolver navigate normally
    after AppState becomes READY → consume pendingDeepLink
  else:
    if deepLink.requireRole && session.activeRole != deepLink.requireRole:
      prompt: "هذا الإشعار يتطلب التبديل إلى تطبيق التاجر/العميل — تبديل؟"
      on confirm: setActiveRole(...) then consume deepLink
    else:
      router.push(deepLink.path)
```

### 13.4 Deep link map

| Path | Role | Routes to |
|---|---|---|
| `/_dl/order/{id}` | customer | `/(customer)/tracking?orderId={id}` |
| `/_dl/order/{id}` | merchant | `/(merchant)/orders/detail?orderId={id}` |
| `/_dl/wallet` | customer | `/(customer)/wallet` |
| `/_dl/promo/{code}` | customer | `/(customer)/cart` with promo pre-applied (or `/(customer)/deals/{code}` if no cart) |
| `/_dl/r/{ref}` | (any) | register screen with referral code stashed |
| `/_dl/merchant/orders` | merchant | `/(merchant)/(tabs)/orders` |
| `/_dl/merchant/payouts` | merchant | `/(merchant)/payouts` |

### 13.5 Deep link while logged out

The resolver's `pendingDeepLink` queue persists across `UNAUTHENTICATED → AUTH_OTP_PENDING → READY`. After authentication, queued deep link is consumed exactly once. If the deep link requires a role the user doesn't have, show a graceful error sheet, do not loop.

### 13.6 In-app notifications

- `useNotificationsStore` is fed by realtime `notification.received` events.
- Mark-as-read on individual open OR explicit "mark all read".
- Tapping an in-app notification follows the same `deepLink` contract as push.

---

## 14. Edge Case Behavior

| # | Scenario | Correct behavior |
|---|---|---|
| E-1 | App opened offline | `OFFLINE_DEGRADED` overlay. Persisted state still browsable (cart, addresses, past orders). Network-required actions disabled with explanation. |
| E-2 | Goes offline mid-checkout | Place-order button disabled, banner shown; cart preserved; on reconnect, revalidate cart. |
| E-3 | Goes offline during tracking | Last known status shown with "آخر تحديث: HH:MM" stale marker; auto-resubscribe on reconnect. |
| E-4 | Session expired (401) | `SESSION_EXPIRED` modal over current screen; "Sign in to continue" → OTP → `returnTo`. |
| E-5 | Session expired during payment | Modal; on success, payment screen re-tokenizes (token is single-use anyway). |
| E-6 | Biometric supported then disabled by OS | On next gate: detect, write `biometricEnabled=false`, skip silently, log analytics. |
| E-7 | Biometric repeatedly fails | After 3 fails → 60s cooldown; "Sign in with phone" always available. |
| E-8 | Deep link → checkout while logged out | Resolver routes to welcome → after auth → consumes deep link → checkout if cart non-empty, else home. |
| E-9 | Deep link → merchant route while in customer role | Prompt role switch; if user lacks merchant role, show "هذا الرابط للتجار فقط" sheet. |
| E-10 | Customer deletes account with active orders | Block deletion with list of blocking orders; only allow after they're terminal. |
| E-11 | Merchant suspended mid-session | Realtime `merchant.suspended` → resolver moves to `MERCHANT_SUSPENDED`; in-flight orders frozen for ops. |
| E-12 | Merchant incomplete setup tries to go live | Cannot toggle `acceptingOrders=true` until `MERCHANT_SETUP_REQUIRED` is resolved. |
| E-13 | Customer missing address at checkout | Resolver routes through `ADDRESS_SETUP_REQUIRED` mini-flow, returns to checkout via `returnTo`. |
| E-14 | Payment timeout (>15s) | Treat as failure; release any holds; surface PSP message. |
| E-15 | Inventory conflict (out-of-stock at checkout) | Modal "X is no longer available" — user can remove and continue or abort. |
| E-16 | Stale cart (price changed) | Modal shows diff; user must confirm new prices to proceed. |
| E-17 | Duplicate submit (place order tapped twice fast) | Mutation idempotency key from cart hash + first tap timestamp; second call returns same order. |
| E-18 | Race: merchant accepts while customer cancels | Whichever lands first wins; the other gets `ConflictError` → UI updates from realtime event. |
| E-19 | Push received while in foreground | Display as in-app toast/banner; tap behavior identical to push tap. |
| E-20 | Push tap while app killed | Cold start → resolver runs → `pendingDeepLink` consumed after `READY`. |
| E-21 | Token refresh fails | One retry with backoff; then `SESSION_EXPIRED`. Never silently sign out without surfacing. |
| E-22 | Corrupt persisted state | Persist middleware version check; on mismatch, run migration; on migration failure, wipe that slice with telemetry. Never crash boot. |
| E-23 | SecureStore unavailable | Treat as no session → `UNAUTHENTICATED`; toast "Secure storage unavailable on this device — sessions won't persist". |
| E-24 | Language switch mid-flow | Apply instantly; current screen re-renders; persisted forms preserve values. |
| E-25 | RTL ↔ LTR toggle | Same as E-24; layout flip handled by I18nManager + design system primitives. |
| E-26 | Customer role switch with non-empty cart | Cart preserved; no warning needed (it'll be there when they come back). |
| E-27 | Merchant role switch while order accept pending | Allow; pending SLA timer continues server-side; merchant gets push if SLA expires before they return. |
| E-28 | Reservation hold expires during slow checkout | At place-order tap, server returns `HoldExpiredError`; client re-reserves and continues. |
| E-29 | Wallet hold + parallel top-up | Top-up settles immediately; hold remains; balance reflects both. No deadlock. |
| E-30 | Promo redeemed twice | Server-side single-use enforcement; second attempt fails `ConflictError`; client shows "code already used". |
| E-31 | Mock fail rate enabled in dev | All retry paths exercise normally; UI MUST handle gracefully (no white screens). |
| E-32 | App update available (forced) | On boot, version check → if `< minSupported` → `FATAL{recoverable:false}` → store link screen, no bypass. |

---

## 15. Scenario Matrix (Selected Critical Paths)

### 15.1 Auth scenarios

| ID | Trigger | Preconditions | Decision | Next AppState | Next Route |
|---|---|---|---|---|---|
| A-1 | Cold boot, fresh install | no session, no `hasAuthenticatedBefore`, no `hasSeenIntro` | `RESOLVE` | `FIRST_RUN` | `/(onboarding)/intro` |
| A-2 | Cold boot, has seen intro, never authed | `hasSeenIntro=true`, no session | `RESOLVE` | `UNAUTHENTICATED` | `/(onboarding)/welcome` |
| A-3 | Cold boot, returning user, customer only, biometric off | session valid, addresses≥1, biometric off | `RESOLVE_AUTHED` | `READY{customer}` | `/(customer)/(tabs)/home` |
| A-4 | Cold boot, returning user, biometric on | session valid, addresses≥1, biometric on+supported | `RESOLVE_AUTHED` | `BIOMETRIC_REQUIRED{customer}` | `/(auth)/biometric` |
| A-5 | Cold boot, returning user, dual-role, lastActiveRole=merchant | session valid, merchant setup complete | `RESOLVE_AUTHED` | `READY{merchant}` | `/(merchant)/(tabs)/dashboard` |
| A-6 | Cold boot, returning user, dual-role, no lastActiveRole | both roles complete | `RESOLVE_AUTHED` | `ROLE_SELECTION_REQUIRED` | `/(auth)/role` |
| A-7 | OTP submitted successfully (new user via "login") | phone not in system | sign-up implicit | `PROFILE_SETUP_REQUIRED` | `/(onboarding)/profile?role=customer` |
| A-8 | OTP submitted successfully (existing user) | phone exists | route by `RESOLVE_AUTHED` | per profile | per resolver |
| A-9 | 401 from API mid-session | any | `session.expired` | `SESSION_EXPIRED` | modal over current |
| A-10 | Logout from profile | confirm | `auth.signed_out` | `UNAUTHENTICATED` | `/(onboarding)/welcome` |
| A-11 | Merchant login with new device | known phone+password | risk engine triggers | `AUTH_OTP_PENDING{role:merchant}` | `/(auth)/otp` |

### 15.2 Order scenarios

| ID | Trigger | Pre | Behavior | End state |
|---|---|---|---|---|
| O-1 | Customer places cash order | cart valid, shop open | `OrderRepository.place(payment:cash)` → emits `order.placed` | order `pending`, merchant notified, customer at order-success |
| O-2 | Customer places card order | cart valid, card tokenized OK | authorize hold → place → notify | order `pending`, hold active |
| O-3 | Card auth declined | tokenized but PSP declines | release any state, surface error | back on `/payment`, no order |
| O-4 | Wallet insufficient at checkout | balance < total | wallet method disabled with CTA to top-up | stay on `/checkout` |
| O-5 | Merchant accepts within SLA | `pending` order, action: accept | `OrderRepository.transition(accepted)` | order `accepted`, customer notified |
| O-6 | Merchant rejects with reason | `pending` order | transition→`rejected` + emit `refund.initiated` if pre-paid | order `rejected`, refund pending |
| O-7 | SLA expires before merchant acts | `pending` >300s | system `tick()` → auto-reject | order `rejected`, refund pending, both notified |
| O-8 | Customer cancels in grace window | `accepted`, <5 min after acceptance | free cancel | order `cancelled`, full refund |
| O-9 | Customer cancels during preparing | `preparing` | confirm dialog with partial refund | order `cancelled`, partial refund per policy |
| O-10 | Merchant marks ready | `preparing` | transition | order `ready`, courier dispatched |
| O-11 | Handover to courier | `ready` | transition + assign courier | order `picked`, customer sees courier card |
| O-12 | Courier marks delivered | `picked` | transition + capture payment | order `delivered`, payment captured |
| O-13 | Customer requests refund post-delivery | `delivered`, <24h | `refund_pending` | merchant notified |
| O-14 | Merchant approves refund | `refund_pending` | `PaymentRepository.refund` | order `refunded` |
| O-15 | Merchant rejects refund | `refund_pending` | back to `delivered` with reason | customer can escalate to support |
| O-16 | Order delivered triggers review prompt | `order.delivered` | 24h window for review | review available in profile |

### 15.3 Role/biometric scenarios

| ID | Trigger | Pre | Behavior |
|---|---|---|---|
| RB-1 | Dual-role user opens app, switches role | `READY{customer}`, taps switch | confirm → `setActiveRole(merchant)` → resolver → `READY{merchant}` |
| RB-2 | User enables biometric in settings | toggle on, supported | enrollment test scan → success → `biometricEnabled=true` |
| RB-3 | User enables biometric, no enrollment | toggle on, unsupported | scan fails → toast → toggle stays off |
| RB-4 | User authed, biometric required, 3 fails | gate active | `LOCKED` 60s → cooldown → retry or "Sign in with phone" |
| RB-5 | App backgrounded 15min, foregrounded | `READY{customer}`, biometric on | re-prompt biometric |

### 15.4 Merchant scenarios

| ID | Trigger | Pre | Behavior |
|---|---|---|---|
| M-1 | Merchant first launch post-signup | KYC pending | resolver → `MERCHANT_KYC_PENDING` → status screen |
| M-2 | Merchant first launch post-KYC | setup incomplete | resolver → `MERCHANT_SETUP_REQUIRED` → wizard |
| M-3 | Merchant tries to go live | profile incomplete | toggle disabled with tooltip listing missing fields |
| M-4 | Merchant marks product unavailable | product in 2 carts | event emitted; customer carts revalidate at checkout |
| M-5 | Merchant creates promo "DEALS10" | valid form | promo active; customer can use it |
| M-6 | Merchant suspends shop temporarily | toggle + time | shop disappears from discovery; in-flight unaffected |
| M-7 | Merchant gets push for new order while in customer role | dual-role | tap → role switch prompt → on confirm → orders tab with that order pre-opened |

---

## 16. Implementation Guidance

This is non-prescriptive about file layout but prescriptive about contracts.

### 16.1 New modules to introduce

```
src/
├── runtime/
│   ├── AppStateMachine.ts          # the state machine in Section 2
│   ├── RoutingResolver.ts          # resolve(state) → route
│   ├── RouteGuard.tsx              # wraps screens; subscribes to AppState
│   ├── PendingDeepLink.ts          # queue + consume after READY
│   └── BootSequence.ts             # owns Splash hide, replaces today's ad-hoc init
├── features/role/
│   ├── store.ts                    # activeRole, lastActiveRole, switchRole()
│   └── selectors.ts
├── features/auth/v2/               # superset; deprecate v1
│   ├── identity.ts                 # User with roles[]
│   ├── session.ts                  # single token model
│   └── migration.ts                # legacy → v2 SecureStore migration
├── infrastructure/notifications/
│   ├── DeepLinkRouter.ts
│   └── ResponseListener.ts         # single, root-mounted
└── infrastructure/realtime/
    └── subscriptions/
        ├── orderUpdates.ts
        ├── storeOrders.ts
        ├── stockChanges.ts
        └── walletEvents.ts
```

### 16.2 Files to delete (or radically reduce) in `delngato-app`

| File | Action | Why |
|---|---|---|
| `app/index.tsx` (current routing tree) | Replace body with mount-point that boots `AppStateMachine`; let resolver navigate | Today's nested if-tree is unmaintainable |
| `app/order-success.tsx` | Remove `clearCart()` + hardcoded `addOrder` side-effects | Side-effects belong in `OrderRepository.place` |
| `app/tracking.tsx` local 5s timer | Replace with realtime subscription | Parallel reality bug |
| `app/(onboarding)/biometric.tsx` redirect logic | Remove self-routing; let resolver decide | Per Section 2.4 |
| `app/(tabs)/notifications.tsx` hardcoded list | Wire to realtime + notifications store | Today is fake |
| Anything that reads `SEED_BUNDLE` directly | Funnel through `hydratePlatformSeed` (already exists) | Already correct; just enforce |

### 16.3 Files to add (route shells)

```
app/
├── _layout.tsx                    # mounts AppStateMachine + RoutingResolver + ToastHost
├── _splash.tsx                    # branded splash (formerly index.tsx)
├── (onboarding)/
│   ├── intro, welcome, profile, address, merchant-setup/[step]
├── (auth)/
│   ├── login, register, otp, role, biometric, locked
├── (customer)/
│   ├── (tabs)/{home, search, orders, profile}
│   ├── shop/[id], product/[id], cart, checkout, payment, wallet-pay, wallet, wallet-topup, tracking, ...
├── (merchant)/
│   ├── (tabs)/{dashboard, orders, products, settings}
│   ├── catalog, promotions, analytics, reviews, staff, payouts, suspended, kyc-pending
└── _modals/session-expired.tsx
```

### 16.4 Repository contract changes (mock + future HTTP)

| Repository | Required additions |
|---|---|
| `AuthRepository` | `getCurrentUser(): User`, `setActiveRole(role)`, `requestStepUp(role): OtpChallenge` |
| `OrderRepository` | `place(...)` returns `{ orderId }` AND emits `order.placed` AND clears cart atomically — no client-side side effects |
| `PaymentRepository` | `authorize(token, amount, ref): Hold`, `capture(ref)`, `release(ref)`, `refund(ref, amount)` |
| `WalletRepository` | `hold(amount, ref): HoldId`, `releaseHold(HoldId)` |
| `CartRepository` (new, replacing direct store mutation at the edges) | `revalidate(): {priceChanges, removed, addedConstraints}` |

Mocks MUST throw the documented errors. Mocks MUST run the realtime emissions so subscriptions can be exercised against them.

### 16.5 Realtime contract

Existing `realtime` client gets named channels:

```
order.{orderId}.updates
store.{storeId}.orders
store.{storeId}.reviews
product.{productId}.stock
user.{userId}.notifications
user.{userId}.wallet
```

Mock realtime client publishes synthetic events on transitions to keep dev UX faithful.

### 16.6 Testing requirements

Each scenario in Section 15 MUST have an integration test exercising:
1. The mock repositories.
2. The `AppStateMachine`.
3. The `RoutingResolver`.
4. The screen that ends up rendered.

E2E (Detox or equivalent) covers the seven critical paths:
1. First-run customer registration → first order delivered.
2. Returning customer → biometric → reorder → tracking.
3. Merchant cold-start → accept → preparing → handover.
4. Dual-role user → role switch → both shells reachable.
5. Session expiry mid-action → re-auth → returnTo.
6. Offline → online → state convergence.
7. Push tap (cold) → deep link consumption → correct screen.

### 16.7 Migration plan (high level)

Phase 1 — **Foundations**
- Add `AppStateMachine`, `RoutingResolver`, `RouteGuard`. Keep current screens; just route through the resolver. Ship behind flag `runtime.v2`.

Phase 2 — **Single auth/session**
- Migrate SecureStore keys (`delgato.session.v2`). Add role context to session. Add `(auth)/role` screen. Add merchant login screen (gated; dark-shipped).

Phase 3 — **Merchant shell**
- Port `(merchant)/*` from design reference. Wire to existing domain (most of it exists).

Phase 4 — **Realtime + repository tightening**
- Move order/payment/wallet side-effects into repositories. Delete client-side parallel-reality code (tracking timer, order-success side-effects).

Phase 5 — **Deep links + notifications**
- Single response listener, pending-deep-link queue, role-aware routing.

Phase 6 — **Edge case hardening + suspension/KYC states**
- Implement Section 14 in full. Run all Section 15 scenarios as E2E.

Each phase is independently shippable; the runtime flag flips off-to-on per surface.

---

## Appendix A — Glossary

- **AppState** — the canonical finite state of the running app (Section 2).
- **Routing Resolver** — the pure function that maps `AppState` to a route.
- **Role Context** — the `activeRole` field on the session; determines which shell is mounted.
- **Hold** — a reserved-but-not-captured amount on card or wallet.
- **SLA timer** — a server-enforced countdown that triggers automatic transitions.
- **Pending deep link** — a deep link captured while the app cannot yet act on it; consumed after `READY`.

## Appendix B — Non-goals (out of scope)

- Guest checkout
- Customer biometric on iOS Face ID with multiple users (single profile only)
- Merchant biometric
- Merchant self-signup in-app
- Multi-currency
- Multi-language beyond ar/en
- Customer-to-customer interactions (gifting, group orders)
- Live chat between customer and merchant (use ticket-based support)
- Schedulable orders for closed shops on day one (data model ready; UI gated)
