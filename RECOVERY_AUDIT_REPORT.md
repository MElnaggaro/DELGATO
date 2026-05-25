# DELGATO — Recovery Audit Report

**Generated:** 2026-05-24
**Auditor:** Antigravity (recovery mode)
**Sources:** Canonical Flow Spec + Migration Plan + full codebase inspection

---

## 1. Phase Status Summary

| Phase | Name | Status | Notes |
|---|---|---|---|
| 0 | Audit validation | ✅ DONE | Verified at start of previous session |
| 1 | Architecture foundation | ✅ DONE | All 7 runtime files present and correct |
| 2 | Storage / auth migration | ✅ DONE | SecureStore v2, auth store extensions, PaymentRepo, CartRepo, WalletRepo hold/release/capture, payment_pending status — all present |
| 3 | Startup / routing migration | ✅ DONE | All onboarding screens emit canonical AppStateMachine events. runtimeV2 flag still OFF (flipped in Phase 7 after regression). |
| 4 | Biometric migration | ✅ DONE | Synthetic scan on toggle enable. 10min background re-prompt hook wired into RootStack. |
| 5 | Shared state migration | ✅ DONE | walletSync event handler bridges platform wallet → loyalty store. |
| 6 | Order / payment / wallet refactor | ✅ DONE | tracking.tsx reads from platform store, placeOrder uses repos, all hardcoded IDs eliminated. |
| 7 | Customer regression validation | 🔶 PENDING | Blocked until runtimeV2 flag flip + manual regression |
| 8 | Merchant foundation | ✅ DONE | role.tsx, locked.tsx, kyc-pending.tsx, suspended.tsx, merchant tabs shell all present. |
| 9 | Merchant impl + deep links/notifications | 🔶 PARTIAL | DeepLinkRouter + ResponseListener + session-expired modal all wired. Merchant secondary screens + push token registration remain. |

---

## 2. Detailed Audit Per Subsystem

### ✅ CORRECT — Keep As-Is

| Module | Status | Assessment |
|---|---|---|
| `src/runtime/AppStateMachine.ts` | ✅ DONE | Full state union, complete transition table, universal transitions (session.expired, network.offline/online, fatal). Singleton + subscriber pattern correct. |
| `src/runtime/RoutingResolver.ts` | ✅ DONE | Pure resolve function. `resolveHydratedState` helper. All state→route mappings present per spec §2.4. |
| `src/runtime/BootSequence.ts` | ✅ DONE | Three hooks (start/markHydrating/finish). Biometric probe. Correct store reads. |
| `src/runtime/RouteGuard.tsx` | ✅ DONE | Feature-flag gated. Subscribes AppState + stores. Modal vs replace routing. |
| `src/runtime/PendingDeepLink.ts` | ✅ DONE | Single-slot queue. Push/peek/drain API correct. |
| `src/runtime/useAppState.ts` | ✅ DONE | useSyncExternalStore pattern. |
| `src/features/role/store.ts` | ✅ DONE | activeRole, lastActiveRole, switchRole, setFromSession. |
| `src/features/auth/store.ts` | ✅ DONE | SessionV2 migration, setActiveRole with bus emit, hydrateSession calls migrateSessionV1ToV2, signOut clears all keys and dispatches event. |
| `src/services/storage/secureStore.ts` | ✅ DONE | Legacy + v2 APIs. SessionV2 type. migrateSessionV1ToV2 idempotent. |
| `src/domain/repositories/PaymentRepository.ts` | ✅ DONE | authorize/capture/release/refund. CardTokenizedInput. |
| `src/domain/repositories/CartRepository.ts` | ✅ DONE | revalidate with CartLineDiff, shopBlock, promoBlock. |
| `src/domain/repositories/WalletRepository.ts` | ✅ DONE | hold/capture/releaseHold/availableBalance. WalletHold type. |
| `src/domain/types/order.ts` | ✅ DONE | payment_pending added. PlaceOrderInput correct. TimelineEntry present. |
| `src/infrastructure/container.ts` | ✅ DONE | PaymentRepo + CartRepo bound. MockPaymentRepository with MOCK_PAYMENT_FAIL_RATE. |
| `src/infrastructure/repositories/mock/MockOrderRepository.ts` | ✅ DONE | Calls OrderRepository.place via platform store. Emits bus events. Tick hook advances timers. SLA auto-reject. ALLOWED_NEXT transition map includes payment_pending. |
| `src/infrastructure/featureFlags.ts` | ✅ DONE | runtimeV2 + merchantSelfSignup flags. Env-based resolution. |
| `src/infrastructure/notifications/DeepLinkRouter.ts` | ✅ DONE | All canonical /_dl/ paths mapped per spec §13.4. Role-aware. |
| `src/infrastructure/notifications/ResponseListener.tsx` | ✅ DONE | Notification tap + foreground receipt + Linking listener + initial URL + drain-on-READY. |
| `src/features/checkout/placeOrder.ts` | ✅ DONE | placeOrder (cash), placeOrderWithCard (authorize→place), placeOrderWithWallet (hold→place→release-on-fail). Uses OrderRepository.place. |
| `app/_layout.tsx` | ✅ DONE | Mounts RouteGuard + ResponseListener. Calls startBootSequence/markHydratingStarted/finishHydration. |
| `app/checkout.tsx` | ✅ DONE | Uses placeOrder use case. Routes via result.orderId. No setTimeout hack. |
| `app/payment.tsx` | ✅ DONE | Uses placeOrderWithCard. Synthetic cardToken. No setTimeout hack. |
| `app/wallet-pay.tsx` | ✅ DONE | Uses placeOrderWithWallet. Insufficient balance check. No setTimeout hack. |
| `app/order-success.tsx` | ✅ DONE | Stateless. Reads orderId from params. No clearCart/addOrder side effects. |
| `app/(auth)/role.tsx` | ✅ DONE | Two tiles, remember toggle, calls setActiveRole. Design-system styled. |
| `app/(auth)/locked.tsx` | ✅ DONE | 60s cooldown countdown. Retry or phone-login escape hatch. |
| `app/_modals/session-expired.tsx` | ✅ DONE | Modal design. Sign-out + re-auth CTA. |
| `app/(merchant)/kyc-pending.tsx` | ✅ DONE | Merchant KYC waiting screen. |
| `app/(merchant)/suspended.tsx` | ✅ DONE | Merchant suspended screen. |
| `app/(merchant)/(tabs)/*` | ✅ DONE | Dashboard, orders, products, settings tabs exist. |
| Settings store `hasSeenIntro` | ✅ DONE | Added with migration from hasCompletedOnboarding. |

---

### 🔴 BROKEN — Must Fix

| # | Module | Issue | Severity | Status |
|---|---|---|---|---|
| B-1 | `app/tracking.tsx` | **Was using 5s setTimeout** | **CRITICAL** | ✅ FIXED — Now subscribes to platform store via `usePlatformStore`/`selectOrderById` |
| B-2 | `app/tracking.tsx` | **Hardcoded ORDER_ITEMS array** | **CRITICAL** | ✅ FIXED — Reads `Order.items` from domain |
| B-3 | `app/refund.tsx` | **Hardcoded `DLN-٢٠٤٧` fallback** | **HIGH** | ✅ FIXED — Button disabled when no orderId; reads items from platform store |
| B-4 | `app/chat.tsx` | **Hardcoded `DLN-٢٠٤٧`** | **MEDIUM** | ✅ FIXED — Uses dynamic orderId from params |
| B-5 | Onboarding screens event-emit | All screens already dispatch canonical events | **RESOLVED** | ✅ VERIFIED — intro→`intro_dismissed`, otp→`otp_verified`, bio→`bio.verified`, address→`address.completed` |

---

### 🟡 INCOMPLETE — Must Complete

| # | Module | What's Missing | Phase | Status |
|---|---|---|---|---|
| I-1 | `featureFlags.runtimeV2` still OFF | Resolver wired but dormant. Flip after regression matrix. | 3/7 | 🔶 Deferred to Phase 7 |
| I-2 | Biometric enrollment-verify-at-toggle | Synthetic scan now runs before persisting enable. | 4 | ✅ FIXED |
| I-3 | Biometric foreground re-prompt | `useBiometricRePrompt` hook monitors background 10min threshold. | 4 | ✅ FIXED |
| I-4 | Loyalty store wallet balance | `installWalletSyncHandler` bridges platform wallet → loyalty store. | 5 | ✅ FIXED |
| I-5 | Tracking screen status from Order | tracking.tsx reads from `usePlatformStore`/`selectOrderById`. | 6 | ✅ FIXED |
| I-6 | Merchant secondary screens | Catalog, promotions, analytics, reviews, staff, payouts. | 9 | ⬜ Remaining |
| I-7 | Push token registration | expo-notifications permission + registerDevice. | 9 | ⬜ Remaining |
| I-8 | `_modals/_layout.tsx` | Already configured with transparentModal + fade. | 9 | ✅ Verified |
| I-9 | Cross-role sync verification | Customer→merchant→tracking flow test. | 9 | ⬜ Remaining |

---

## 3. Priority Fix Order

### IMMEDIATE — Fix Broken Items

1. **B-1 + B-2 + I-5: tracking.tsx realtime + domain data** (CRITICAL)
   - Remove 5s setTimeout step advancement
   - Remove hardcoded ORDER_ITEMS
   - Subscribe to order from platform store via OrderRepository.byId
   - Map `Order.status` → UI step
   - Render order items from `Order.items`

2. **B-3: refund.tsx hardcoded fallback**
   - Remove `'DLN-٢٠٤٧'` fallback

3. **B-4: chat.tsx hardcoded order reference**
   - Use dynamic orderId

### THEN — Continue Remaining Migration

4. **Phase 3 completion**: Onboarding event-emit migration (B-5)
5. **Phase 4**: Biometric enrollment verify + foreground re-prompt (I-2, I-3)
6. **Phase 5**: Loyalty store wallet balance source migration (I-4)
7. **Phase 6 completion**: Validate all order flows end-to-end
8. **Phase 8-9**: Merchant secondary screens + push registration

---

## 4. Execution Plan

Proceeding now to fix broken items and continue implementation.

---

## 5. Progress Tracker

- [x] Fix tracking.tsx — remove timer, subscribe to realtime, use domain Order
- [x] Fix refund.tsx — remove DLN-٢٠٤٧ fallback + wire items from platform store
- [x] Fix chat.tsx — dynamic order reference
- [x] Phase 3: Onboarding event-emit migration (all screens verified)
- [x] Phase 4: Biometric synthetic scan + foreground re-prompt
- [x] Phase 5: Wallet balance sync handler
- [ ] Phase 7: Flip runtimeV2 flag + regression matrix
- [ ] Phase 9: Merchant secondary screens + push registration
