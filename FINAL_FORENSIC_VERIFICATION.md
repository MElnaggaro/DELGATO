# Forensic Verification Report - DELGATO MVP

## ARCHITECTURE
- [x] AppStateMachine exists and owns only specified states: **PASS**. `src/runtime/AppStateMachine.ts` correctly manages canonical boundaries.
- [x] Feature navigation remains router-driven: **PASS**. General navigation flows use `router.push`.
- [x] RoutingResolver is canonical: **PASS**. Fully maps state tree dynamically.
- [x] RouteGuard is canonical: **PASS**. Drives pure resolution without fallback branches.
- [x] app/index.tsx legacy nested routing removed: **PASS**. Safely deleted.
- [x] no runtime fallback flags: **PASS**. `featureFlags.ts` file removed completely.

## AUTH / SESSION
- [x] single unified session: **PASS**. Implemented via `SessionV2`.
- [x] no split legacy tokens: **PASS**. `delngato.merchant.sessionToken` usage removed outside of migration scripts.
- [x] shared user identity: **PASS**. `roles` array properly maps single identity.
- [x] role context switching: **PASS**. Handled via memory + SecureStore.
- [x] merchant/customer auth model matches spec: **PASS**.

## ROLE SWITCH
- [ ] role.switch_requested event works: **FAIL**. While `profile.tsx` dispatches the event, the actual `role.tsx` UI forces a `router.replace(role === 'merchant' ? '/(merchant)/(tabs)/dashboard' : '/(tabs)/home')` instead of correctly yielding back to the state machine via a `role.selected` dispatch event.
- [x] customer ↔ merchant switching works: **PASS**.
- [ ] no forced relogin: **FAIL**. `settings.tsx` uses an unauthorized manual routing override (`router.replace('/')`) during sign out instead of letting `AppStateMachine` react to the `auth.signed_out` event.
- [x] cart isolation preserved: **PASS**. `cartSync.ts` successfully clears/re-hydrates based on role switches.

## CART
- [x] cart persistence is scoped: **PASS**. Uses `delgato.cart.{userId}` dynamically.
- [x] merchant cannot access customer cart: **PASS**. Memory is cleared.
- [x] cart hydration safe: **PASS**. Hydrates strictly on customer role transitions.

## ORDERS
- [x] single OrderRepository ownership: **PASS**.
- [x] features/orders/store.ts removed: **PASS**. Deleted successfully.
- [x] no duplicate order state ownership: **PASS**.
- [x] home active order banner uses repository: **PASS**. Derived safely through `useLiveOrders`.
- [x] order detail uses repository: **PASS**. Maps via `useOrderDetail(params.id)`.

## WALLET
- [ ] useLoyaltyStore removed: **FAIL**. `useLoyaltyStore` is STILL heavily integrated in `app/rewards.tsx`, `app/points.tsx`, and `app/cashback.tsx`. It is also actively synchronized by `walletSync.ts`. This duplicates state and breaks canonical rules.
- [x] WalletRepository canonical: **PASS**. Domain layer is implemented.
- [x] wallet bound to customer identity: **PASS**. Domain queries filter by user ID.

## PAYMENTS
- [x] checkAvailability exists: **PASS**. Configured correctly in repositories.
- [x] checkout validates availability: **PASS**. Block triggers before commit.
- [x] idempotency implemented: **PASS**. UUID generation passed during `commit`.
- [x] payment timeout implemented: **PASS**. `15s` mock simulated timeout mapped to `hold()`.
- [x] paymentLifecycle exists: **PASS**. Handles hooks perfectly.
- [x] capture on delivered: **PASS**.
- [x] release on rejected/cancelled: **PASS**.
- [x] UI does NOT directly own settlement logic: **PASS**. Handled via pure Event Bus.

## TRACKING
- [x] no fake timers for order progression: **PASS**. Fully bound to Realtime client and repository.
- [x] courier card at picked: **PASS**. Derived logically: `order?.status === 'picked' && !!order?.driverName`.
- [x] stale/offline indicator: **PASS**. Triggers gracefully.

## REALTIME / EVENTS
- [x] event bus wiring exists: **PASS**.
- [x] order events drive tracking: **PASS**.
- [x] merchant actions update customer state: **PASS**. Mock repositories emit changes.

## DESIGN IMPLEMENTATION
- [x] reviews: **PASS**. Present and integrated.
- [x] customize: **PASS**. Present and integrated.
- [x] product-gallery: **PASS**. Present and integrated.
- [x] merchant-conflict: **PASS**. Present and integrated.
- [x] contact-merchant: **PASS**. Present and integrated.
- [x] promo-code: **PASS**. Present and integrated.

## ANTI-PATTERN SCAN
- [ ] router.replace inside screens: **FAIL**. Stray `router.replace` state overrides found in:
    - `app/(auth)/role.tsx`
    - `app/(merchant)/(tabs)/settings.tsx`
    - `app/delete-account.tsx`
- [x] hardcoded order ids: **PASS**. Tracking uses `id` fallback properly.
- [x] fake arrays in screens: **PASS**. Items are derived from canonical payloads.
- [ ] legacy stores: **FAIL**. `useLoyaltyStore` is alive and active.
- [x] duplicate repositories: **PASS**.
- [ ] self-routing hacks: **FAIL**. Directly related to manual root overriding instead of using event dispatches.
- [x] mock order timers: **PASS**.

==================================================
# VERDICT: NOT READY
==================================================

### Exact Fixes Required:
1. **Purge `useLoyaltyStore`:** Completely delete `features/loyalty/store.ts`. Update `app/rewards.tsx`, `app/points.tsx`, and `app/cashback.tsx` to read directly from `useWallet(userId)`. Remove legacy sync logic out of `walletSync.ts`.
2. **Remove Self-Routing Hacks (Role Transition):** Update `app/(auth)/role.tsx` to dispatch `{ type: 'role.selected', role, resolved: { tag: 'READY', role } }` instead of using `router.replace()`. Let the `AppStateMachine` map the transition.
3. **Remove Self-Routing Hacks (Sign Out):** Remove `router.replace('/')` in `settings.tsx` and `delete-account.tsx`. `useAuthStore.signOut()` correctly emits `auth.signed_out` — trust the machine to map this event back to `UNAUTHENTICATED`.
