# DELGATO — Canonical Flow Migration Plan

> **Note for archival.** This is the planning artifact written during plan mode. On approval, the same content should be saved as `D:\PROJECTS\DELGATO\DELGATO_CANONICAL_FLOW_MIGRATION_PLAN.md` (the project's canonical migration document).

> **Sources of truth.**
> - Canonical target: `D:\PROJECTS\DELGATO\DELGATO_CANONICAL_FLOW_SPEC.md`
> - Current audit: `D:\PROJECTS\DELGATO\DELGATO_FLOW_MAP.md`
> - Design lock: `design/design-system` + `design/design-reference` (UI behavior unchanged)

---

## Context

DELGATO has a partially-working customer app, a freshly-written canonical flow spec, and zero merchant UI shipped. The architecture audit revealed a much healthier baseline than the spec assumed: **all 16 repositories already exist** (mocks functional, HTTP stubs throw `NotImplementedError`), the **event bus already declares the canonical event union** (including `role.switched`, `order.*`, `wallet.*`, `auth.session-*`), domain `User` already has `roles: Role[]`, `Merchant` already has `kycStatus`, per-role SecureStore (`getRoleSessionToken('merchant')`) is already implemented, and the realtime client (`MockRealtimeClient` + `WebSocketRealtimeClient`) is wired with `publish` / `subscribe`. The platform store already namespaces with a versioned persist key.

The real gaps cluster in three places:
1. **Routing** — `app/index.tsx` is a flag-tree, onboarding screens self-navigate.
2. **Customer "parallel reality"** — `order-success.tsx` hardcodes `DLN-٢٠٤٧`, `tracking.tsx` runs its own 5s timer, `payment.tsx` and `wallet-pay.tsx` have stub `setTimeout` delays instead of calling repositories.
3. **Untouched surfaces** — no merchant shell routes, no role selection / switcher UI, no Linking listener, no deep-link queue, no `SESSION_EXPIRED` modal, no `payment_pending` order status, no wallet `hold/release`.

Migration is therefore **surgical and phased**, not a rewrite. The customer app must not regress at any phase boundary.

---

## 1. Executive Summary

| Aspect | Assessment |
|---|---|
| Codebase maturity vs. canonical spec | **~60% structurally aligned.** Domain + repository + event layers are spec-compliant. Routing + customer mutation paths + merchant shell are not. |
| Migration complexity | **Medium.** No domain redesign; mostly route consolidation, store-mutation → repository-call refactors, and adding net-new modules (resolver, deep-link queue, merchant shell). |
| Highest risks | (1) Breaking the cash-checkout happy path while wiring it to `OrderRepository.place`. (2) SecureStore key rename evicting logged-in users. (3) Removing the local tracking timer before realtime emission is verified end-to-end. (4) Onboarding regression if resolver doesn't preserve `hasCompletedOnboarding`/`hasAuthenticatedBefore` semantics. |
| Recommended strategy | **Strangler-pattern in 9 phases**, gated by a `runtime.v2` feature flag. Each phase has a customer-regression checkpoint. No merchant shell until customer is stable on v2 routing. |

---

## 2. Current vs. Canonical Gap Analysis

| # | Subsystem | CURRENT | TARGET | GAP | RISK | ACTION |
|---|---|---|---|---|---|---|
| 1 | Startup | `_layout.tsx` async chain; splash hidden when fonts+i18n ready | Same chain, but splash hides only when `AppState` resolves | None for the chain itself; needs `AppState` hook | Low | PATCH |
| 2 | Routing | `app/index.tsx` flag tree; onboarding screens `router.replace` themselves | Single `AppStateMachine` + `RoutingResolver`; screens are passive | No state machine, no resolver | High (regression) | NEW + REPLACE `app/index.tsx` |
| 3 | Auth | `useAuthStore` single-role; `setSession(token, user)` flips `authed=true` | Add `activeRole`, `lastActiveRole`, dual-role aware session | Missing role context on session | Medium | PATCH |
| 4 | Session persistence | `delngato.sessionToken` + `delngato.sessionToken.merchant` separate slots | Unified `delgato.session.v2` blob with active role inside | Two keys → one key | Medium (eviction) | PATCH + one-time migration |
| 5 | Roles | `Role` type exists, `role.switched` event exists, no UI consumer | Role selection screen + in-app role switch tiles | UI missing entirely | Low | NEW (UI only) |
| 6 | Biometric | Toggle persists without enrollment verification; works on cold start | Verify enrollment at toggle-time; foreground re-prompt after 10min | Verification + foreground hook missing | Low | PATCH |
| 7 | Onboarding | `markOnboardingComplete()` called on welcome mount; mixed flags | Single `hasSeenIntro` flag; resolver-owned routing | Flag rename + indirection | Low | PATCH |
| 8 | Customer browse/cart | Repositories + stores already wired correctly | Same | None | None | KEEP |
| 9 | Customer checkout | `app/checkout.tsx` decides on `pay`, then `setTimeout(...900ms)` → `order-success` | Call `OrderRepository.place(...)` → navigate with real `orderId` | Repository never invoked from UI | High | REPLACE |
| 10 | Customer order-success | Hardcoded `addOrder({ id: 'DLN-٢٠٤٧', ... })` + `clearCart()` in `useEffect` | Stateless: receives real `orderId` param; repository handled cart clear | Side effects in wrong layer | High | REMOVE |
| 11 | Customer tracking | Local `setInterval` 5s step 0→1→2→3; hardcoded items; fallback `orderId='DLN-٢٠٤٧'` | Subscribe to `order.{id}.updates` channel; render from `Order` domain object | No subscription, no realtime consumption | High | REPLACE |
| 12 | Payments | `payment.tsx` `setTimeout(900ms)`; `wallet-pay.tsx` calls `chargeWallet` on loyalty store + `setTimeout(1100ms)`; **no `PaymentRepository`** | `PaymentRepository.authorize → capture/release`; wallet uses `hold/release/capture` | PaymentRepository missing; wallet has no hold concept | High | NEW + PATCH |
| 13 | Wallet | `WalletRepository` has `topUp`/`charge`; loyalty store mutates balance synchronously | Add `hold(amount, ref)`, `releaseHold(id)`, `capture(holdId)`; store reads from repo | Hold/release missing; UI bypasses repo | Medium | PATCH (interface + mock + UI wiring) |
| 14 | Orders | `OrderRepository.place/accept/...` exist in domain + mock; UI doesn't call them from customer side | UI calls repo; status `payment_pending` added | UI wiring missing; one status missing | High | PATCH |
| 15 | Notifications | `push.ts` handler logs in `__DEV__` only; no `expo-notifications` listener | Single root-mounted `responseListener` + in-app stream | Listener missing entirely | Medium | NEW |
| 16 | Deep links | No `Linking.addEventListener` anywhere | `DeepLinkRouter` + `pendingDeepLink` queue + role-aware consumption | Listener + queue missing | Medium | NEW |
| 17 | Shared state | `usePlatformStore` for entities + per-feature Zustand stores; well-bounded | Same | None | None | KEEP |
| 18 | Repositories | 16 interfaces + mocks exist; HTTP stubs throw `NotImplementedError` | Add `PaymentRepository`, add `CartRepository.revalidate()`, extend Wallet/Order signatures | Three small additions | Low | PATCH (interfaces) + NEW (`PaymentRepository`) |
| 19 | Session expiry | 401 → silent `signOut()` → splash reroutes | Modal over current route with `returnTo` | Modal missing | Medium (UX) | NEW |
| 20 | Merchant shell | Zero routes under `app/(merchant)/` | Full shell per design reference | Entirely missing | Out-of-scope until customer is stable | NEW (later phases) |

---

## 3. Codebase Classification Matrix

### Keep as-is (do not touch)
| Component | Why |
|---|---|
| `src/domain/repositories/*` (16 interfaces) | Already shape-correct |
| `src/infrastructure/repositories/Mock*` | Behaviour-correct; tests rely on them |
| `src/infrastructure/events/types.ts` (DomainEvent union) | All canonical events present |
| `src/infrastructure/events/EventBus.ts` | Solid; only need to add new handlers |
| `src/domain/stores/platform.ts` | Versioned, well-namespaced |
| `src/services/api/client.ts` (request/response wiring) | Interceptor pattern correct; only the `setSignOutHandler` callback target changes |
| `src/services/i18n/*` + `applyRtlForLocale` | RTL already correct |
| `src/features/cart/store.ts` merchant-conflict logic | Behavior matches spec |
| `src/features/addresses/store.ts` | Selector + CRUD pattern matches |
| All `design/design-system` and `design/design-reference` | Locked |

### Patch (extend, don't replace)
| Component | Change |
|---|---|
| `app/_layout.tsx` | Mount `AppStateMachine` + `RoutingResolver` + global `DeepLinkRouter`; keep font/i18n/container init |
| `src/features/auth/store.ts` | Add `activeRole`, `lastActiveRole`; rewrite `setSession` to write unified blob; keep `hasAuthenticatedBefore` |
| `src/services/storage/secureStore.ts` | Add `delgato.session.v2` accessors; keep legacy ones during migration window |
| `src/features/settings/store.ts` | Add `hasSeenIntro` (default = current value of `hasCompletedOnboarding`); deprecate `hasCompletedOnboarding` after migration |
| `app/(onboarding)/biometric.tsx` | Remove self-routing; emit `bio.verified` event; let resolver navigate |
| `app/(onboarding)/welcome.tsx` | Stop calling `markOnboardingComplete()` on mount (resolver/event-driven instead); buttons emit events not pushes |
| `app/(onboarding)/intro.tsx` | "Start"/"Skip" mark `hasSeenIntro=true` and emit event, no `router.replace` |
| `src/features/loyalty/store.ts` | Read balance from `WalletRepository.forUser(userId)`; remove direct mutation in `topUp`/`charge` |
| `src/features/cart/store.ts` | Add `revalidate()` selector that calls `CartRepository.revalidate()` |
| `src/domain/types/order.ts` | Add `payment_pending` to `OrderStatus` union; ensure transition map allows `payment_pending → pending` and `payment_pending → cancelled` |
| `src/domain/repositories/WalletRepository.ts` | Add `hold(amount, ref): HoldId`, `releaseHold(id)`, `capture(holdId)` |
| `src/infrastructure/repositories/MockWalletRepository.ts` | Implement hold/release/capture with version-based concurrency |
| `src/infrastructure/repositories/MockOrderRepository.ts` | Confirm `place(...)` accepts `payment: {method, ref?}` and emits `order.placed` atomically with cart clear (or document that UI clears cart on success) |
| `src/infrastructure/events/handlers/push.ts` | Replace stub with `expo-notifications` registration + token reporting |

### Replace (delete + rewrite)
| Component | Why |
|---|---|
| `app/index.tsx` (the splash flag tree) | Becomes `app/_splash.tsx` — pure presentation; routing moves to resolver |
| `app/tracking.tsx` step `setInterval` | Replace with realtime subscription |
| `app/order-success.tsx` hardcoded `addOrder` + `clearCart` `useEffect` | Replace with reading `orderId` from params; rendering from repository |
| `app/checkout.tsx` `setTimeout(900ms)` cash path | Replace with `OrderRepository.place(...)` |
| `app/payment.tsx` `setTimeout(900ms)` submit | Replace with `PaymentRepository.authorize(...)` |
| `app/wallet-pay.tsx` `setTimeout(1100ms)` + hardcoded `'DLN-٢٠٤٧'` | Replace with `WalletRepository.hold` → `OrderRepository.place` chain |

### Remove (delete outright)
| Component | Why |
|---|---|
| Hardcoded `ORDER_ITEMS` in `app/tracking.tsx:27-31` | Comes from repo |
| Hardcoded fallback `orderId='DLN-٢٠٤٧'` in `app/tracking.tsx:38` | Force valid param; if missing, resolver routes elsewhere |
| Legacy `delngato.sessionToken.merchant` SecureStore key | After migration window (phase 9) |
| `hasCompletedOnboarding` flag (after migration) | Superseded by `hasSeenIntro` |

### New (net-additions)
| Module | Purpose |
|---|---|
| `src/runtime/AppStateMachine.ts` | Canonical state union + transition table |
| `src/runtime/RoutingResolver.ts` | Pure `resolve(state) → Route` |
| `src/runtime/RouteGuard.tsx` | Mounts resolver subscription at root; intercepts unauthorized pushes |
| `src/runtime/BootSequence.ts` | Orchestrates `BOOTING → HYDRATING → resolved` |
| `src/runtime/PendingDeepLink.ts` | Queue + consume-after-READY pattern |
| `src/features/role/store.ts` | `activeRole`, `lastActiveRole`, `switchRole()` |
| `src/features/role/selectors.ts` | Hooks for current-role-aware UIs |
| `src/domain/repositories/PaymentRepository.ts` | `authorize / capture / release / refund` (currently missing entirely) |
| `src/infrastructure/repositories/MockPaymentRepository.ts` | Configurable success/failure/decline modes |
| `src/domain/repositories/CartRepository.ts` | `revalidate() → {priceChanges[], removed[]}` |
| `src/infrastructure/repositories/MockCartRepository.ts` | Cart revalidation against current product/store state |
| `src/infrastructure/notifications/DeepLinkRouter.ts` | Parses `/_dl/...` paths into routes (role-aware) |
| `src/infrastructure/notifications/ResponseListener.ts` | Single-mount `Notifications.addNotificationResponseReceivedListener` + `Linking.addEventListener` |
| `app/_splash.tsx` | Replaces current `app/index.tsx` body (presentation only) |
| `app/(auth)/role.tsx` | Role selection screen |
| `app/(auth)/locked.tsx` | Biometric lock cooldown screen |
| `app/_modals/session-expired.tsx` | Session-expiry modal |
| `app/(merchant)/**` | Full merchant shell (phases 8–9) |

---

## 4. Storage Migration Plan

### Current keys
| Key | Type | Owner |
|---|---|---|
| `delngato.sessionToken` | SecureStore | customer auth |
| `delngato.sessionToken.merchant` | SecureStore | merchant auth (unused in UI) |
| `delngato.platform.v1` | AsyncStorage | platform entities |
| `delngato.auth` | AsyncStorage | `useAuthStore` persist |
| `delngato.settings` | AsyncStorage | `useSettingsStore` persist |
| `delngato.addresses` | AsyncStorage | `useAddressStore` persist |
| `delngato.cart` | AsyncStorage | `useCartStore` persist |
| (and per-feature stores) | AsyncStorage | various |

### Target keys
| Key | Type | Notes |
|---|---|---|
| `delgato.session.v2` | SecureStore | JSON blob: `{ accessToken, refreshToken, userId, activeRole, lastActiveRole, deviceId, issuedAt, expiresAt }` |
| `delgato.platform.v2` | AsyncStorage | Same shape; bumped on migration completion |
| `delgato.auth.v2` | AsyncStorage | Slimmer: `{ hasAuthenticatedBefore, phone, user }` (session moves to SecureStore) |
| `delgato.settings.v2` | AsyncStorage | Adds `hasSeenIntro`; deprecates `hasCompletedOnboarding` |
| Others | unchanged | Renamed `delngato.* → delgato.*` opportunistically with migration helpers |

> The brand-name typo correction (`delngato → delgato`) is opt-in; if owner prefers to keep the existing namespace for stability, drop it from the rename and only do the structural `.v2` bumps.

### Migration strategy
1. On boot, before `hydrateSession`, run `migrateSessionV1ToV2()`:
   - If `delgato.session.v2` exists → use it.
   - Else if `delngato.sessionToken` exists → wrap into v2 blob with `activeRole='customer'`; write v2; delete v1.
   - Else if only `delngato.sessionToken.merchant` exists → same with `activeRole='merchant'`.
   - Else if both → keep customer as active, merge into v2.
2. Settings migration: on first read of `useSettingsStore`, if `hasSeenIntro` is undefined, set it = current `hasCompletedOnboarding`.
3. Platform store: bump version key from `v1` to `v2` with passthrough migration (no data shape change); leaves `v1` untouched for rollback window.

### Rollback safety
- Migration is **non-destructive for two releases**: legacy keys are read but not deleted until the migration has shipped in production for ≥30 days.
- Each migration function is idempotent and gated by a `migrationVersion` marker in `usePlatformStore`.
- If migration throws, fall back to "treat as fresh install but preserve cart" — never crash boot.

---

## 5. Auth + Identity Migration Plan

### New session shape
```
Session {
  accessToken, refreshToken,
  userId,
  activeRole: 'customer' | 'merchant',
  lastActiveRole?: 'customer' | 'merchant',
  deviceId,
  issuedAt, expiresAt,
  biometricVerifiedThisSession: bool  // in-memory only, not persisted
}
```

### `useAuthStore` deltas
| Field | Status |
|---|---|
| `authed` | KEEP (derived: `session != null`) |
| `phone` | KEEP |
| `user` | KEEP (extended with `roles[]`) |
| `sessionToken` | REPLACE → `session` object |
| `hasAuthenticatedBefore` | KEEP |
| **NEW** `activeRole`, `lastActiveRole`, `setActiveRole(role)` | for role switching |

### Role switching
- `switchRole(newRole)`:
  1. Assert `user.roles.includes(newRole)`.
  2. Update session in memory + SecureStore (`activeRole=newRole`, `lastActiveRole=oldRole`).
  3. Close role-scoped realtime subscriptions (orders queue for merchant, tracking for customer).
  4. Emit `role.switched` event (already in DomainEvent union — handlers wired).
  5. Trigger resolver re-run.

### Session restore
`hydrateSession()` now:
1. Run migration (Section 4).
2. Read `delgato.session.v2` → set in-memory.
3. If `expiresAt` in past, attempt refresh (`AuthRepository.refresh(refreshToken)`); on failure → clear, emit `auth.session-ended`.
4. Resolver picks up state.

### Session expiry (401/403 from interceptor)
- Today: silent `signOut()` → splash reroutes.
- Target: dispatch `session.expired` to `AppStateMachine`. Resolver shows `app/_modals/session-expired.tsx` over current route. Modal CTA → opens phone-OTP flow → on success, dismiss modal and `returnTo` original route.
- `signOut()` itself is unchanged for explicit user action.

### Merchant auth (currently no UI)
- Mock repo already differentiates by role param.
- New screen `app/(auth)/merchant-login.tsx` per design reference (phone + password + step-up OTP).
- Self-signup remains gated by a feature flag (`featureFlags.merchantSelfSignup`, default off).

---

## 6. Routing Migration Plan

### Current
- `app/_layout.tsx` runs boot, then renders `RootStack`.
- `app/index.tsx` is mounted as the index route, displays splash, then runs the flag tree to `router.replace(...)`.
- Onboarding screens (`intro`, `welcome`, `auth`, `biometric`) each call `router.push/replace` based on local checks.

### Target
- `app/_layout.tsx` mounts `BootSequence` + `RoutingResolver` + `DeepLinkRouter` at root.
- `app/_splash.tsx` is a **passive** screen rendering brand visuals; it does NOT decide routing.
- `RoutingResolver` subscribes to `AppStateMachine`; on each terminal state, calls `router.replace(resolve(state))`.
- Onboarding screens emit semantic events (`onboarding.intro_dismissed`, `auth.otp_requested`, `bio.verified`, etc.); they never `router.replace` themselves.

### Migration sequence (within Phase 3)
1. Introduce `AppStateMachine` + `RoutingResolver` behind `runtime.v2` flag (default off). Resolver no-ops when off.
2. Reproduce the current flag tree as the **initial implementation** of `RESOLVE_AUTHED()` — bit-identical routes, so v2-off and v2-on yield the same navigation for current users.
3. Flip flag for dev/staging. Run scenario matrix. Verify no regression.
4. Migrate onboarding screens one by one to emit events instead of self-routing.
5. After all screens migrated, default flag to on. Remove `app/index.tsx` flag tree; promote `app/_splash.tsx`.

### Files impacted
- `app/_layout.tsx` (mount runtime modules; small)
- `app/index.tsx` (full rewrite, becomes `_splash.tsx`)
- `app/(onboarding)/intro.tsx` (remove `router.replace`)
- `app/(onboarding)/welcome.tsx` (remove `markOnboardingComplete` side-effect; replace button pushes)
- `app/(onboarding)/auth.tsx` (after-OTP request emits event, no `router.push`)
- `app/(onboarding)/otp.tsx` (after-verify emits event, no `router.replace`)
- `app/(onboarding)/biometric.tsx` (no settings-gate redirect; emit `bio.verified` or `bio.skipped`)
- `app/(onboarding)/location-permission.tsx` and `address-setup.tsx` (same pattern)
- `app/(tabs)/profile.tsx` logout → emit `auth.signed_out`, resolver navigates

---

## 7. Repository Migration Plan

| Repository | Status | Action |
|---|---|---|
| `AuthRepository` | Exists | PATCH: add `setActiveRole(role)`, `getCurrentUser()`; document `verifyOtp` returning either existing or implicit-registered user |
| `UserRepository` | Implicit (lives in `CustomerRepository`/`MerchantRepository`) | OPTIONAL: extract `me()` into common `UserRepository` for shared profile mutations |
| `CustomerRepository` | Exists (`me`, `update`, `delete`) | KEEP |
| `MerchantRepository` | Exists | KEEP |
| `ProductRepository` | Exists with `subscribeByStore` | KEEP; consume from merchant shell |
| `CategoryRepository` | Exists | KEEP |
| `CartRepository` | **MISSING** | NEW: `revalidate() → {priceChanges[], removed[], shopClosed?}`; mock implementation reads platform store |
| `OrderRepository` | Exists with `place/accept/reject/.../subscribeForCustomer/subscribeForStore` | KEEP interfaces; PATCH `place(...)` to accept `payment: {method, ref?}` and add `payment_pending → pending` transition; PATCH `place(...)` to atomically clear cart (or document the contract that UI clears on success event) |
| `PaymentRepository` | **MISSING** | NEW: `authorize(token, amount, ref) / capture(ref) / release(ref) / refund(ref, amount)`; mock returns deterministic success unless `MOCK_PAYMENT_FAIL_RATE>0` |
| `WalletRepository` | Exists (`forUser/history/topUp/charge`) | PATCH: add `hold(amount, ref) → HoldId`, `releaseHold(id)`, `capture(holdId)`; version-based concurrency in mock |
| `NotificationRepository` | Exists | KEEP; wire to root response listener |
| `ReviewRepository` | Exists | KEEP |
| `PromotionRepository` | Exists | KEEP |
| `TrackingRepository` | (Folded into `OrderRepository.subscribeForCustomer`) | KEEP — no separate repository needed |
| `DeepLinkRepository` | Not needed | DeepLinkRouter is an infrastructure service, not a repository |
| `AddressRepository` | Exists | KEEP |
| `PayoutRepository` | Exists | KEEP (for merchant shell) |
| `AnalyticsRepository` | Exists | KEEP (for merchant shell) |
| `SupportRepository` | Exists | KEEP |
| `StaffRepository` | Exists | KEEP (for merchant shell) |
| `ModifierRepository` | Exists | KEEP |

### Mock vs HTTP discipline
- All HTTP variants will continue to throw `NotImplementedError` until the real backend is ready.
- Mock variants MUST throw the same domain errors (`ValidationError`, `ConflictError`, `NotFoundError`, `UnauthorizedError`, `NetworkError`) — already the case for most; verify the new `CartRepository` and `PaymentRepository` mocks.
- No new HTTP work in this migration; it is purely a mock→spec alignment exercise.

---

## 8. Shared State Migration Plan

### State ownership (target)
| Slice | Owner | Mutator |
|---|---|---|
| Entities (products, orders, stores, wallets, etc.) | `usePlatformStore` | Repositories only (already enforced via lint) |
| Active session | SecureStore + `useAuthStore` (in-memory mirror) | `AuthRepository` + auth store actions |
| Cart | `useCartStore` (persisted) | Cart store actions; `CartRepository.revalidate` reads platform |
| Settings (biometric, language, hasSeenIntro, prefs) | `useSettingsStore` (persisted) | Direct user action |
| Addresses | `useAddressStore` (persisted) | `AddressRepository` |
| Loyalty (points + favorites) | `useLoyaltyStore` (persisted) | `LoyaltyRepository` (extract from current); **balance moves out — read from `WalletRepository.forUser`** |
| Active role | `useRoleStore` (in-memory derived from session) | `AuthRepository.setActiveRole` |
| Notifications | `useNotificationsStore` (read-only mirror) | Filled by realtime + `NotificationRepository.list` |
| App state | `useAppStateStore` (in-memory) | `AppStateMachine.dispatch` only |

### Event ownership
- Repositories emit on the bus.
- Stores subscribe and update their slices.
- UI subscribes to selectors.
- One direction only: **UI → action → repository → event → store → UI**. No UI→store→UI shortcuts for entity mutations.

### Selectors to introduce
- `useActiveRole()` (from session)
- `useCurrentUser()` (from session userId → platform/customer/merchant repo)
- `useActiveOrders(role)` (role-scoped: customer = mine; merchant = my store's)
- `useWalletBalance()` (from `WalletRepository.forUser`)
- `useAppState()` (canonical state for resolver consumption)

---

## 9. Customer Regression Protection Plan

### Fragile flows (must verify after every phase)
1. **Splash → home** (returning customer, biometric off)
2. **Splash → biometric → home** (returning customer, biometric on, supported)
3. **First install → intro → welcome → register → OTP → location → address → home**
4. **Login → OTP → home**
5. **Browse → add to cart → checkout (cash) → success → tracking**
6. **Browse → add to cart → checkout (card) → success → tracking**
7. **Browse → add to cart → checkout (wallet, sufficient balance) → success → tracking**
8. **Add to cart from different shop → merchant-conflict screen → replace cart**
9. **Logout → splash → welcome**
10. **Settings → language toggle (ar/en) → RTL flip without restart**
11. **Settings → biometric toggle on/off**
12. **App backgrounded then foregrounded → no state loss**

### Regression checklist (per phase)
- [ ] Cold-start times unchanged (±10%)
- [ ] No new console errors in dev mode
- [ ] All persisted stores still load
- [ ] No screen renders in LTR by mistake
- [ ] Animations on welcome/biometric/intro unchanged
- [ ] Tab bar shows correct active state
- [ ] Cart persists across kill+relaunch
- [ ] All flows above complete successfully

### Snapshot tests
- Persist current store payloads as fixtures.
- After migration, hydrate fixtures and assert shape adapter still works.

---

## 10. Merchant Foundation Plan

Merchant work is **gated by customer stabilization**. The shell is added in Phases 8–9.

### Dependency order
1. ✅ Domain `Merchant` + `Store` types — exist
2. ✅ `MerchantRepository`, `OrderRepository.subscribeForStore`, `ProductRepository.subscribeByStore`, `PromotionRepository`, `PayoutRepository`, `AnalyticsRepository`, `StaffRepository`, `ReviewRepository` — exist
3. **AppStateMachine + Resolver supports merchant states** (`MERCHANT_KYC_PENDING`, `MERCHANT_SETUP_REQUIRED`, `MERCHANT_SUSPENDED`) — must land in Phase 3
4. **Unified session with `activeRole`** — Phase 2
5. **Merchant auth UI** (`app/(auth)/merchant-login.tsx`) per design reference — Phase 8
6. **Merchant setup wizard** (`app/(onboarding)/merchant-setup/[step].tsx`) — Phase 8
7. **Merchant tabs shell** (`app/(merchant)/(tabs)/{dashboard,orders,products,settings}.tsx`) — Phase 9
8. **Merchant secondary screens** (catalog, promotions, analytics, reviews, staff, payouts, suspended, kyc-pending) — Phase 9 per design reference
9. **Cross-role sync verification** (customer places order → appears in merchant queue ≤2s) — Phase 9 validation

### Cross-role sync test plan
- Two dev devices (or two emulator instances) signed into same demo dataset.
- Device A = customer, places order.
- Device B = merchant, observes order in `pending` queue within mock realtime tick (≤2s).
- Device B accepts → Device A tracking advances.
- Device B marks ready → handover → Device A sees courier card.

---

## 11. Order / Payment / Wallet Refactor Plan

This is the highest-risk refactor because it touches the customer cash path. Sequence:

### Step 1 — Add interfaces without touching UI
- Add `PaymentRepository` interface + mock (Phase 2).
- Add `WalletRepository.hold/release/capture` to interface + mock (Phase 2).
- Add `payment_pending` to `OrderStatus` + transition map (Phase 2).
- Add `CartRepository` interface + mock (Phase 2).
- No UI changes yet → no regression possible.

### Step 2 — Rewire cash checkout (lowest risk)
- `app/checkout.tsx`: cash path calls `CartRepository.revalidate()` → if dirty, prompt; else `OrderRepository.place({ payment: { method: 'cash' } })` → on success, navigate to `/order-success?orderId={id}`.
- `app/order-success.tsx`: read `orderId` from params; render `Order` from `OrderRepository.byId(orderId)`; **remove** `addOrder({...hardcoded})` and `clearCart()` (cart cleared inside `OrderRepository.place` mock).
- Validate: place cash order, see real order in orders list, see real order on tracking.

### Step 3 — Rewire tracking to realtime
- `app/tracking.tsx`: on mount, subscribe to `order.{orderId}.updates` via `OrderRepository.subscribeForCustomer` (or new `subscribeToOrder(id)` helper).
- Render `Order` from store; remove local `setInterval`; remove hardcoded items; remove `DLN-٢٠٤٧` fallback.
- Mock realtime client's `tick()` already advances order status — wire mock to emit `order.{id}.status_changed` events on transitions.
- Validate: cash order placed → status auto-advances → tracking reflects without refresh.

### Step 4 — Rewire card payment
- `app/payment.tsx`: on submit, `PaymentRepository.authorize(token, amount, draftOrderId)` → on success, `OrderRepository.place({ payment: { method: 'card', ref } })` → navigate to `/order-success`.
- Order starts in `payment_pending`; mock payment repo immediately resolves to `pending` after 800ms (replaces current `setTimeout`).
- Failure path: surface PSP error; stay on screen.

### Step 5 — Rewire wallet payment
- `app/wallet-pay.tsx`: on confirm, `WalletRepository.hold(total, draftOrderId)` → on success, `OrderRepository.place({ payment: { method: 'wallet', ref: holdId } })` → success.
- Mock wallet repo decrements `available` (balance minus active holds) immediately; `capture` flips hold to charge on `order.delivered`; `release` undoes on cancel.

### Step 6 — Top-up
- `app/wallet-topup.tsx`: cash top-up is removed (per spec, no agent network in MVP).
- Card top-up: `PaymentRepository.authorize → capture` → `WalletRepository.topUp(amount)` → balance updates.
- Loyalty store stops mutating wallet balance; reads from `WalletRepository.forUser`.

### Step 7 — Refund flow
- New screen `app/order-refund.tsx` (or inline modal): `OrderRepository.requestRefund(orderId)` → status `refund_pending`.
- Mock auto-approves after 24h simulated tick OR via merchant-side approve action.

> **Order matters.** Steps 2–3 prove the pipeline end-to-end before touching card/wallet. If Step 2 regresses, halt; don't proceed.

---

## 12. Deep Link / Notification Plan

### Step 1 — Single root listener
- New `src/infrastructure/notifications/ResponseListener.ts` mounts:
  - `Notifications.addNotificationResponseReceivedListener` (push tap)
  - `Notifications.addNotificationReceivedListener` (foreground push)
  - `Linking.addEventListener('url', ...)` + initial-URL check
- Mounted from `app/_layout.tsx` exactly once.

### Step 2 — Deep link router
- `DeepLinkRouter.parse(url) → { path, role?, requireAuth }`.
- Canonical paths per spec Section 13.4 (`/_dl/order/{id}`, `/_dl/wallet`, etc.).

### Step 3 — Pending deep link queue
- `PendingDeepLink.push(deepLink)` if `AppState != READY`.
- `AppStateMachine` notifies on `READY` → drain queue.
- Role mismatch → show role-switch prompt sheet.

### Step 4 — Push registration
- Replace `infrastructure/events/handlers/push.ts` no-op with real `expo-notifications` permission request + token retrieval + report to `NotificationRepository.registerDevice(token)`.
- Run on first successful auth, not at boot (avoid spurious permission prompts).

### Step 5 — Channel-mapped notifications
- Subscribe to `user.{userId}.notifications` via realtime client → push to in-app notifications store.
- Tap in-app notification → same `DeepLinkRouter.consume(deepLink)` code path.

---

## 13. Edge Case Risk Matrix

| # | Edge case | Risk during migration | Mitigation |
|---|---|---|---|
| E-1 | Offline | Existing `OfflineBanner` component is unmounted; banner state never set | Wire `NetInfo` in Phase 1; show banner; degrade payment-related actions; do NOT mutate `AppState` to `OFFLINE_DEGRADED` until Phase 5 |
| E-2 | Network timeout | Already handled by 12s axios timeout | Surface domain error; ensure each new mutation path catches `NetworkError` |
| E-3 | Expired session mid-checkout | Modal blocks → user re-auths → cart preserved (already persisted), `returnTo=/checkout` | Verify `returnTo` consumption works |
| E-4 | Biometric fail then lock | Lock screen new in Phase 4 | Until lock screen lands, keep 3-fail → "use phone" fallback (current behavior) |
| E-5 | Unsupported biometric device | Capability check already in place | Toggle goes inactive (disabled) post-Phase 4 |
| E-6 | Storage migration corruption | Could brick boot | Idempotent migration; try/catch; on failure → fresh state + telemetry; never throw |
| E-7 | Legacy SecureStore key still present after migration | Stale session lingers | Don't delete legacy keys until Phase 9 (≥30 days post-deploy); read-order = v2 first |
| E-8 | Role mismatch via deep link | User on customer shell taps merchant push | Prompt sheet; never auto-switch silently |
| E-9 | Merchant suspended mid-action | Currently no detection | Phase 9 only; until then, n/a |
| E-10 | Payment race (double-tap place) | High risk during Step 4–5 refactor | Add idempotency key to `OrderRepository.place(... idempotencyKey)`; mock dedupes within 10s |
| E-11 | Stale cart at checkout | Currently no revalidation | `CartRepository.revalidate()` lands in Phase 6; gates "Place Order" |
| E-12 | Inventory mismatch | Same as above | Revalidation surfaces removed items |
| E-13 | Concurrent wallet hold + top-up | Possible during Step 6 | Version-based optimistic concurrency in mock; reject stale writes |
| E-14 | Mock fail rate flag flipped in CI | All migration phases must still pass with `MOCK_FAIL_RATE>0` | Add to Phase 7 validation matrix |
| E-15 | App update available (forced) | No version check exists | Out of scope for this migration; track as separate ticket |
| E-16 | Push permission denied | Currently never asked | Phase 9: ask after first auth; gracefully skip if denied |
| E-17 | Deep link arrives while in onboarding | Today: ignored | Pending queue covers this in Phase 9 |
| E-18 | Migration rolled back | Need to support v1 reading v2 keys briefly | Keep legacy reads available for one release after rollback boundary |

---

## 14. Phased Execution Plan

> Each phase is independently shippable behind feature flags. Each phase ends at a customer-regression checkpoint (Section 9). No phase progresses without sign-off.

### PHASE 0 — Audit validation (no code changes)
**Scope.** Confirm the inventory in Sections 2–3 against current `main`. Reproduce any ambiguous behavior in a dev build.
**Deliverable.** Sign-off checklist (this document marked verified).
**Risks.** None.
**Validation.** Manual walk-through of customer flows on current main.

### PHASE 1 — Architecture foundation
**Scope.** Land net-new modules with no callers:
- `src/runtime/AppStateMachine.ts`
- `src/runtime/RoutingResolver.ts`
- `src/runtime/RouteGuard.tsx`
- `src/runtime/BootSequence.ts`
- `src/runtime/PendingDeepLink.ts`
- `src/features/role/store.ts` (in-memory only; no SecureStore writes yet)
- `featureFlags.runtime.v2` (default OFF)

**Files impacted.** Only new files + 1-line import in `app/_layout.tsx` to mount runtime (no-op when flag OFF).
**Dependencies.** None.
**Risks.** Minimal (dead code until flag flips).
**Validation.** Unit tests for state machine transitions; resolver pure-function tests; CI green.

### PHASE 2 — Storage / auth migration
**Scope.**
- Add `delgato.session.v2` SecureStore accessors.
- Implement `migrateSessionV1ToV2()` (idempotent).
- Extend `useAuthStore` with `activeRole`, `lastActiveRole`, `setActiveRole`.
- Extend `AuthRepository` with `setActiveRole`, `getCurrentUser`.
- Add `hasSeenIntro` flag to settings (default = `hasCompletedOnboarding`).
- Add `PaymentRepository` interface + mock.
- Add `CartRepository` interface + mock.
- Extend `WalletRepository` with `hold/release/capture` + mock impl.
- Add `payment_pending` to `OrderStatus`.

**Files impacted.**
- `src/services/storage/secureStore.ts` (patch)
- `src/features/auth/store.ts` (patch)
- `src/features/settings/store.ts` (patch)
- `src/domain/repositories/PaymentRepository.ts` (new)
- `src/infrastructure/repositories/MockPaymentRepository.ts` (new)
- `src/domain/repositories/CartRepository.ts` (new)
- `src/infrastructure/repositories/MockCartRepository.ts` (new)
- `src/domain/repositories/WalletRepository.ts` (patch)
- `src/infrastructure/repositories/MockWalletRepository.ts` (patch)
- `src/domain/types/order.ts` (patch — `payment_pending`)
- `src/infrastructure/repositories/MockOrderRepository.ts` (patch — new transitions)
- `src/infrastructure/container.ts` (bind new repos)

**Dependencies.** Phase 1.
**Risks.** SecureStore migration on first launch of new build. Mitigation: idempotent, try/catch, fallback to legacy.
**Validation.**
- Existing customer signed-in users still authed after upgrade (migration fixture).
- New repos all return mock data successfully.
- All existing tests pass.

### PHASE 3 — Startup / routing migration (high-risk)
**Scope.**
- Wire `AppStateMachine` to `useAuthStore` + `useSettingsStore` + biometric capability.
- Implement initial `RESOLVE_AUTHED()` to reproduce current splash tree exactly.
- Promote `app/index.tsx` body → `app/_splash.tsx` (presentation only).
- Mount `RoutingResolver` at root.
- Migrate onboarding screens to event-emit (no `router.replace`).
- Flip `runtime.v2 = on` in dev/staging.
- After regression checkpoint, default ON in prod.

**Files impacted.**
- `app/_layout.tsx` (mount runtime)
- `app/index.tsx` → `app/_splash.tsx` (rewrite)
- `app/(onboarding)/intro.tsx` (remove self-routing)
- `app/(onboarding)/welcome.tsx` (remove `markOnboardingComplete` on mount; replace button pushes with events)
- `app/(onboarding)/auth.tsx` (post-OTP-request emits event)
- `app/(onboarding)/otp.tsx` (post-verify emits event)
- `app/(onboarding)/biometric.tsx` (no settings-gate redirect)
- `app/(onboarding)/location-permission.tsx` (event-emit)
- `app/(onboarding)/address-setup.tsx` (event-emit)
- `app/(tabs)/profile.tsx` (logout emits event)

**Dependencies.** Phase 1, Phase 2.
**Risks.** HIGH — routing regression. Mitigation: bit-identical resolver initially; flag-gated rollout; scenario matrix run before flip.
**Validation.** Full customer regression checklist (Section 9). All 12 fragile flows pass.

### PHASE 4 — Biometric migration
**Scope.**
- Verify enrollment at toggle-on time (synthetic scan).
- Re-prompt biometric after 10min background.
- Add `app/(auth)/locked.tsx` cooldown screen after 3 fails.
- Sensitive-action step-up hook (used by wallet top-up in Phase 6).

**Files impacted.**
- `app/(tabs)/profile.tsx` settings (verify-on-toggle)
- `app/(onboarding)/biometric.tsx` (cooldown handling)
- `app/(auth)/locked.tsx` (new)
- `src/runtime/AppStateMachine.ts` (background detection via `AppState` RN API)

**Dependencies.** Phase 3.
**Risks.** Low.
**Validation.** Biometric on/off toggle, fail-fail-fail-lock-cooldown-retry, foreground re-prompt.

### PHASE 5 — Shared state migration
**Scope.**
- Loyalty store stops owning wallet balance; reads from `WalletRepository.forUser`.
- Notifications store becomes read-only mirror filled by realtime.
- Address store + cart store unchanged.
- `useAppStateStore` becomes single source for resolver consumption.

**Files impacted.**
- `src/features/loyalty/store.ts` (patch)
- `src/features/loyalty/selectors.ts` (or new)
- `src/features/notifications/store.ts` (if exists; else new mirror)
- `src/runtime/useAppState.ts` (new selector hook)

**Dependencies.** Phase 2 (wallet hold/release lands first).
**Risks.** Medium — wallet balance display source-of-truth change.
**Validation.** Wallet balance correct on settings, profile, wallet-pay screen. Top-up updates balance after `WalletRepository` resolves.

### PHASE 6 — Order / payment / wallet refactor (high-risk)
**Scope.** Section 11, Steps 2–7.

**Files impacted.**
- `app/checkout.tsx` (replace cash setTimeout with `OrderRepository.place`)
- `app/order-success.tsx` (remove hardcoded `addOrder`/`clearCart`; render from repo)
- `app/tracking.tsx` (subscribe to `order.{id}.updates`; remove timer + hardcoded items)
- `app/payment.tsx` (use `PaymentRepository`)
- `app/wallet-pay.tsx` (use `WalletRepository.hold` → `OrderRepository.place`)
- `app/wallet-topup.tsx` (remove cash; card uses `PaymentRepository`)
- `src/infrastructure/repositories/MockOrderRepository.ts` (emit `order.{id}.status_changed` on `tick()`)
- `src/infrastructure/repositories/MockRealtimeClient.ts` (ensure subscription delivery)
- `src/features/cart/store.ts` (revalidate selector)

**Dependencies.** Phase 2 (repos exist), Phase 5 (shared state ready).
**Risks.** HIGH — customer checkout regression. Mitigation: step-by-step (Section 11); cash before card before wallet; canary on dev with mock fail-rate exercised.
**Validation.** Place cash order → success → tracking advances via realtime → delivered. Repeat for card. Repeat for wallet. Refund flow.

### PHASE 7 — Customer regression validation gate
**Scope.** No new code; full regression run.

**Validation.** Full Section 9 checklist; full Section 15 scenario matrix from this document; mock fail-rate ≥0.1 across all flows; offline toggle in dev; RTL/LTR toggle; performance benchmarks.

**Gate.** Phase 8 cannot start until this gate is signed off.

### PHASE 8 — Merchant foundation
**Scope.**
- Add merchant-specific `AppState` branches (`MERCHANT_KYC_PENDING`, `MERCHANT_SETUP_REQUIRED`, `MERCHANT_SUSPENDED`).
- `app/(auth)/role.tsx` role selection.
- Role switch UI in customer profile + merchant settings.
- `app/(auth)/merchant-login.tsx` (phone + password + step-up OTP, per design reference).
- `app/(onboarding)/merchant-setup/[step].tsx` wizard.
- `app/(merchant)/kyc-pending.tsx` and `app/(merchant)/suspended.tsx`.

**Files impacted.** New files only + resolver patches.

**Dependencies.** Phases 1–7.
**Risks.** Low (additive).
**Validation.** Dual-role demo user can switch roles. Merchant-only demo user can complete setup wizard. KYC-pending demo user sees waiting screen.

### PHASE 9 — Merchant implementation + deep links/notifications
**Scope.**
- Full `app/(merchant)/(tabs)/{dashboard,orders,products,settings}.tsx` per design reference.
- `app/(merchant)/{catalog,promotions,analytics,reviews,staff,payouts}.tsx` per design reference.
- Wire merchant screens to existing repositories.
- Mount `ResponseListener` at root.
- `DeepLinkRouter` + `PendingDeepLink` consumption on `READY`.
- `expo-notifications` permission ask after first auth.
- `app/_modals/session-expired.tsx`.
- Cross-role sync verification (Section 10).

**Files impacted.** Many new merchant files; small additions to runtime.

**Dependencies.** All prior phases.
**Risks.** Medium (cross-role sync correctness).
**Validation.** Full scenario matrix (Section 15) including merchant + cross-role + deep-link scenarios.

---

## 15. QA / Validation Plan

### Scenario matrix (run after every phase that touches the relevant subsystem)

| # | Scenario | Phase that must pass |
|---|---|---|
| Q-1 | First install → intro → welcome → register → OTP → location → address → home | 3 |
| Q-2 | Returning user, logged out, biometric off → welcome → login → OTP → home | 3 |
| Q-3 | Returning user, logged in, biometric off → splash → home | 3 |
| Q-4 | Returning user, logged in, biometric on (supported) → splash → biometric → home | 4 |
| Q-5 | Biometric fail × 3 → lock 60s → retry or phone fallback | 4 |
| Q-6 | Biometric toggle on (no enrollment) → toast → toggle stays off | 4 |
| Q-7 | Role switch (dual-role user) → confirm → other shell | 8 |
| Q-8 | Session expiry mid-action → modal → re-auth → returnTo same route | 9 |
| Q-9 | Checkout cash → real `OrderRepository.place` → success → tracking advances via realtime | 6 |
| Q-10 | Checkout card → `PaymentRepository.authorize` succeeds → place → success | 6 |
| Q-11 | Checkout card → `PaymentRepository.authorize` declines → stay on screen with error | 6 |
| Q-12 | Checkout wallet (sufficient) → `hold` → place → success | 6 |
| Q-13 | Checkout wallet (insufficient) → wallet method disabled, top-up CTA | 6 |
| Q-14 | Tracking realtime: place order → see status advance without app interaction | 6 |
| Q-15 | Tracking realtime: merchant accepts → customer tracking updates ≤2s | 9 |
| Q-16 | Tracking realtime: merchant marks ready/handover → courier card appears | 9 |
| Q-17 | Inventory: merchant marks product unavailable → customer cart revalidation flags it | 9 |
| Q-18 | Wallet refund: customer requests → merchant approves → balance credited | 9 |
| Q-19 | Deep link: push tap (cold start) → resolver consumes after READY → correct screen | 9 |
| Q-20 | Deep link: push tap (foreground) → in-app toast → tap → correct screen | 9 |
| Q-21 | Deep link: customer push to merchant deep link → role-switch prompt | 9 |
| Q-22 | RTL: language toggle ar→en → layout flips, no restart | 3 (verify), 7 (regression) |
| Q-23 | Offline: airplane mode → banner shown → place-order disabled → reconnect → flows resume | 5 (banner), 7 (regression) |
| Q-24 | Mock fail rate 0.2: every flow recovers gracefully (no white screen, no crash) | 7 |
| Q-25 | Storage migration: install v1 build with active session → upgrade to v2 → still authed | 2 |
| Q-26 | Merchant first launch post-signup, KYC pending → kyc-pending screen | 8 |
| Q-27 | Merchant setup wizard resume mid-flow after kill → lands on first missing step | 8 |

### Per-phase regression checklist
Run all flows from Section 9 after each phase. Capture screenshots for design QA.

### Automated coverage targets
- Unit: state machine transitions, resolver mapping, migration functions, wallet hold/release concurrency.
- Integration: each fragile flow (Q-1, Q-2, Q-3, Q-9, Q-10, Q-12, Q-14).
- E2E (Detox or Maestro): Q-1, Q-4, Q-9, Q-14, Q-15, Q-19 minimum.

---

## 16. Go / No-Go Review

### Must be approved before Phase 1 starts
- [ ] Plan reviewed by tech lead + product lead.
- [ ] Confirmation of brand-name SecureStore namespace decision (keep `delngato.*` or move to `delgato.*`). **Recommended: keep `delngato.*` namespace; only bump version suffix.** Rationale: avoids second migration risk; the typo is in the namespace string, not user-visible.
- [ ] Confirmation of whether `runtime.v2` flag should ship dark in production or stay dev-only until Phase 7 gate.
- [ ] Decision on `payment_pending` order status: include in MVP or add as Phase 9 polish? **Recommended: include in MVP**, because card path will be unreliable without it.

### Must be approved before Phase 6 starts (high-risk)
- [ ] Phase 5 regression checklist passed.
- [ ] Mock realtime client verified emitting `order.{id}.status_changed` deterministically.
- [ ] Rollback procedure documented (revert flag, delete new files, revert mutations on customer screens).

### Must be approved before Phase 8 starts
- [ ] Phase 7 gate signed off (all customer scenarios in matrix pass).
- [ ] Merchant design reference walked through and confirmed pixel-accurate where it diverges from customer.
- [ ] Decision on merchant self-signup feature flag default (recommend OFF for MVP).

### Must be approved before production deploy of Phase 9
- [ ] All Q-1 through Q-27 scenarios pass on dev + staging.
- [ ] Push notification permission copy + Arabic translation reviewed.
- [ ] Cross-role demo dataset prepared and tested (`demo-merchant-customer` user with both roles).
- [ ] Storage migration tested with three fixture states: fresh install, v1 customer-only session, v1 dual-key (customer + merchant) session.
- [ ] App store metadata updated if needed (new permissions).
- [ ] Rollback plan: feature flag can disable merchant shell + revert routing to pre-v2 in one config push.

---

## Critical files map (quick reference)

### Files to be created
```
src/runtime/AppStateMachine.ts
src/runtime/RoutingResolver.ts
src/runtime/RouteGuard.tsx
src/runtime/BootSequence.ts
src/runtime/PendingDeepLink.ts
src/runtime/useAppState.ts
src/features/role/store.ts
src/features/role/selectors.ts
src/domain/repositories/PaymentRepository.ts
src/infrastructure/repositories/MockPaymentRepository.ts
src/domain/repositories/CartRepository.ts
src/infrastructure/repositories/MockCartRepository.ts
src/infrastructure/notifications/DeepLinkRouter.ts
src/infrastructure/notifications/ResponseListener.ts
app/_splash.tsx
app/(auth)/role.tsx
app/(auth)/locked.tsx
app/(auth)/merchant-login.tsx
app/_modals/session-expired.tsx
app/(merchant)/(tabs)/dashboard.tsx
app/(merchant)/(tabs)/orders.tsx
app/(merchant)/(tabs)/products.tsx
app/(merchant)/(tabs)/settings.tsx
app/(merchant)/{catalog,promotions,analytics,reviews,staff,payouts,kyc-pending,suspended}.tsx
app/(onboarding)/merchant-setup/[step].tsx
```

### Files to be patched (load-bearing lines from audit)
```
app/_layout.tsx                                   # mount runtime modules
src/services/storage/secureStore.ts:15-20         # new v2 accessors + migration
src/features/auth/store.ts:35-72                  # activeRole, unified session
src/features/settings/store.ts:36-56              # hasSeenIntro
src/features/loyalty/store.ts:36-52               # remove direct mutation; read from WalletRepository
src/features/cart/store.ts:92-103, 119            # revalidate selector; remove clearCart from order-success
src/domain/types/order.ts                         # OrderStatus += payment_pending
src/domain/repositories/WalletRepository.ts       # + hold/release/capture
src/infrastructure/repositories/MockWalletRepository.ts # impl + concurrency
src/infrastructure/repositories/MockOrderRepository.ts  # transitions + status events
src/infrastructure/repositories/MockRealtimeClient.ts   # deliver order updates
src/infrastructure/container.ts:101-159           # bind PaymentRepository + CartRepository
src/infrastructure/events/handlers/push.ts        # real expo-notifications wiring
app/(onboarding)/intro.tsx                        # event-emit, no router.replace
app/(onboarding)/welcome.tsx:20, 100, 121, 145    # remove markOnboardingComplete on mount; event-emit buttons
app/(onboarding)/auth.tsx:31, 43                  # event-emit
app/(onboarding)/otp.tsx                          # event-emit post-verify
app/(onboarding)/biometric.tsx:37-43, 71-73, 260  # remove settings-gate; event-emit
app/(onboarding)/location-permission.tsx          # event-emit
app/(onboarding)/address-setup.tsx                # event-emit
app/(tabs)/profile.tsx (logout)                   # event-emit
app/index.tsx:32-83                               # rewrite → app/_splash.tsx (presentation only)
```

### Files to be replaced (rewrite content)
```
app/index.tsx           → becomes presentational app/_splash.tsx
app/tracking.tsx        → realtime subscription; remove timer + hardcoded items + DLN-٢٠٤٧ fallback
app/order-success.tsx   → param-driven render; no hardcoded addOrder/clearCart
app/checkout.tsx        → real OrderRepository.place + revalidation
app/payment.tsx         → real PaymentRepository.authorize
app/wallet-pay.tsx      → WalletRepository.hold → OrderRepository.place
app/wallet-topup.tsx    → card via PaymentRepository; remove cash
src/infrastructure/events/handlers/push.ts → real expo-notifications
```

---

## Verification (end-to-end after Phase 9)

Run on dev build with `EXPO_PUBLIC_API_MODE=mock` and `MOCK_FAIL_RATE=0.1`:

1. **Cold start (fresh install)** — confirm intro → welcome → register flow per Q-1.
2. **Cold start (returning logged-in)** — confirm Q-3 / Q-4 based on biometric setting.
3. **Place cash order** — confirm Q-9 + Q-14 (realtime status changes visible).
4. **Place card order with declines** — toggle mock fail-rate; confirm Q-10 + Q-11.
5. **Place wallet order** — confirm Q-12 + Q-13.
6. **Role switch (dual-role demo user)** — confirm Q-7 + Q-15.
7. **Push deep link (cold start)** — schedule a local notification with `/_dl/order/{id}`; kill app; tap notification; confirm correct route per Q-19.
8. **Session expiry** — force-expire session token via dev menu; confirm modal + returnTo per Q-8.
9. **Offline transitions** — toggle airplane mode mid-checkout; confirm Q-23.
10. **Storage migration** — install old build → log in → upgrade build → confirm still authed per Q-25.

All ten end-to-end runs must pass before production deploy.
