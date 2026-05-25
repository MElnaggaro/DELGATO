# Delgato Final Prototype Recovery Implementation Plan (Strict Rules)

We will stabilize the DELGATO app by removing all biometric authentication, resolving the routing/navigation loops, fixing the splash brand reveal sequence, synchronizing role switching with the AppStateMachine, resolving circular dependencies, ensuring reference-stable selectors with local `useMemo`, and implementing the full merchant orders management queue.

## User Review Required

> [!IMPORTANT]
> Biometric authentication is being completely removed from the codebase. All related screens (`biometric.tsx`, `locked.tsx`), event triggers (`bio.verified`, `bio.skipped`), and package dependencies (`expo-local-authentication`) will be deleted.

> [!WARNING]
> The RouteGuard is being redesigned to check **route boundary compatibility** using `useSegments()` rather than doing strict path matches. This prevents users from getting trapped on a single page when they navigate within valid tabs or sub-screens.

> [!IMPORTANT]
> **No useShallow for derived arrays:** In accordance with the execution rules, components will select only reference-stable raw store objects (such as `s.orders` or `s.products`) and perform array transformations (like `Object.values` or `.filter`) inside local component `useMemo` blocks.

> [!WARNING]
> **Complete Notification Disable:** Notification bootstrap is being disabled entirely. Both the global `initNotificationListeners()` in layout boot scope and `usePushRegistration()` will be commented out / stubbed as direct no-ops.

## Proposed Changes

### Component 1: Runtime & Routing Guard

Redesign `RouteGuard` and `RoutingResolver` to cleanly support boundary checks and remove biometric logic.

#### [MODIFY] [RoutingResolver.ts](file:///D:/PROJECTS/DELGATO/delngato-app/src/runtime/RoutingResolver.ts)
- Remove `biometricEnabled` and `biometricSupported` from `ResolverContext`.
- Remove `BIOMETRIC` and `SESSION_EXPIRED_MODAL` routes.
- Update `resolve()` to map state tags to canonical landing routes, removing `BIOMETRIC_REQUIRED` and `LOCKED_OUT`.
- Update `resolveHydratedState()` to bypass address checking if `activeRole === 'merchant'` so merchants restore session directly to the dashboard.
- Remove biometric options from `resolveHydratedState()`.

#### [MODIFY] [RouteGuard.tsx](file:///D:/PROJECTS/DELGATO/delngato-app/src/runtime/RouteGuard.tsx)
- Use `useSegments()` to construct the current path including route groups (e.g. `/(tabs)/home`).
- Implement `isRouteCompatible(stateTag, role, path)` boundary check to allow free tab/sub-screen browsing while preventing unauthorized transitions.
- Only trigger `router.replace` when the current path is incompatible with the state tag.
- Remove biometric store reads and properties.

#### [MODIFY] [AppStateMachine.ts](file:///D:/PROJECTS/DELGATO/delngato-app/src/runtime/AppStateMachine.ts)
- Remove `BIOMETRIC_REQUIRED` and `LOCKED_OUT` from state tag and states.
- Remove `bio.verified` and `bio.skipped` from events.
- Update transitions:
  - Remove transition logic for `BIOMETRIC_REQUIRED`.
  - Let `FIRST_RUN` transition on `onboarding.intro_dismissed` to `ROLE_SELECTION_REQUIRED` so new users see the role selector.
  - Under `READY`, allow `role.selected` to transition to the new target role (`READY`) so role switches in the app sync with the state machine.

#### [MODIFY] [BootSequence.ts](file:///D:/PROJECTS/DELGATO/delngato-app/src/runtime/BootSequence.ts)
- Remove `expo-local-authentication` import and references.
- Remove biometric verification probes.
- Update `finishHydration()` to call `resolveHydratedState()` without biometric flags.

---

### Component 2: Circular Dependency & Reference-Stable Selectors

Directly import items from target files instead of parent index packages to resolve require cycle warnings. Ensure selectors return stable references and filter locally.

#### [MODIFY] [store.ts](file:///D:/PROJECTS/DELGATO/delngato-app/src/features/auth/store.ts)
- Change import of `dispatchAppEvent` from `'@/runtime'` to `'@/runtime/AppStateMachine'` to break index.ts circular reference.
- In `setActiveRole`, dispatch `role.selected` with `READY` state on successful role switch, or `UNAUTHENTICATED` if not authed.

#### [MODIFY] [ResponseListener.ts](file:///D:/PROJECTS/DELGATO/delngato-app/src/infrastructure/notifications/ResponseListener.ts)
- Change imports of `getAppState`, `subscribeAppState`, `pushPendingDeepLink`, etc. to direct files rather than `@/runtime`.

#### [MODIFY] [store.ts](file:///D:/PROJECTS/DELGATO/delngato-app/src/features/settings/store.ts)
- Remove `biometricEnabled` state and `setBiometricEnabled` action.

#### [DELETE] [useBiometricToggle.ts](file:///D:/PROJECTS/DELGATO/delngato-app/src/features/auth/useBiometricToggle.ts)
- Delete hook completely.

#### [DELETE] [useBiometricRePrompt.ts](file:///D:/PROJECTS/DELGATO/delngato-app/src/features/auth/useBiometricRePrompt.ts)
- Delete hook completely.

#### [MODIFY] [Zustand select arrays](file:///D:/PROJECTS/DELGATO/delngato-app/app) (various screens)
- Refactor selectors returning arrays (like `Object.values(s.products)` or `Object.values(s.orders)`) to return the raw stable dictionary (like `s.products` or `s.orders`), and run `Object.values` and `.filter` inside local `useMemo` blocks to guarantee render stability and prevent selector-induced infinite loops.

---

### Component 3: Notification Startup Bypass

#### [MODIFY] [NotificationBootstrap.ts](file:///D:/PROJECTS/DELGATO/delngato-app/src/infrastructure/notifications/NotificationBootstrap.ts)
- Stub `initNotificationListeners()` to return immediately.

#### [MODIFY] [PushRegistration.ts](file:///D:/PROJECTS/DELGATO/delngato-app/src/infrastructure/notifications/PushRegistration.ts)
- Stub `usePushRegistration()` to return immediately.

#### [MODIFY] [_layout.tsx](file:///D:/PROJECTS/DELGATO/delngato-app/app/_layout.tsx)
- Disable (comment out) the root layout calls to `initNotificationListeners()` and `usePushRegistration()`.

---

### Component 4: Complete Merchant Orders Flow

#### [MODIFY] [orders.tsx](file:///D:/PROJECTS/DELGATO/delngato-app/app/(merchant)/(tabs)/orders.tsx)
- Rebuild the Orders screen to include a stateful view router (queue, detail, reject, issue).
- Subscribe to the mock order repository via container (`orderRepo.subscribeForStore`).
- Implement the tab layouts matching design reference ("جديد", "بنحضّر", "جاهز/تسليم", "منتهي") with count badges.
- Render dynamic list of orders, tapping an order reveals detail overlay showing:
  - Customer profile, phone (with linking to call), address, items, note, prices, subtotal, and total.
  - Active action progress bar: "قبول الطلب" (Accepts order), "رفض" (goes to Reject sub-view), "ابدأ التحضير" (Starts preparing), "الطلب جاهز للاستلام" (Marks ready), "استلم الكابتن الطلب" (Marks picked).
  - Sub-views for selecting rejection reason or reporting an issue.
- Updating an order in `MockOrderRepository` automatically writes to the platform store cache, triggering instant real-time updates in the customer tracking screen (`tracking.tsx`) to achieve total prototype realism.

---

### Component 5: Screens & Layout

#### [MODIFY] [_layout.tsx](file:///D:/PROJECTS/DELGATO/delngato-app/app/_layout.tsx)
- Remove `useBiometricRePrompt` imports and usages.
- Update initialization sequence to set `i18nReady = true` *before* awaiting `finishHydration()` so the JS Splash screen can mount and play its reveal animation while hydration finishes.

#### [DELETE] [biometric.tsx](file:///D:/PROJECTS/DELGATO/delngato-app/app/(onboarding)/biometric.tsx)
- Delete biometric screen completely.

#### [DELETE] [locked.tsx](file:///D:/PROJECTS/DELGATO/delngato-app/app/(auth)/locked.tsx)
- Delete lockout screen completely.

#### [MODIFY] [welcome.tsx](file:///D:/PROJECTS/DELGATO/delngato-app/app/(onboarding)/welcome.tsx)
- Remove local authentication and biometric toggles/CTAs.

#### [MODIFY] [otp.tsx](file:///D:/PROJECTS/DELGATO/delngato-app/app/(onboarding)/otp.tsx)
- Remove biometric resolution checks from OTP verify code.
- Clean up router redirects so RouteGuard handles it.

#### [MODIFY] [security.tsx](file:///D:/PROJECTS/DELGATO/delngato-app/app/security.tsx)
- Remove the biometric toggle switch from the Security screen.

#### [MODIFY] [role.tsx](file:///D:/PROJECTS/DELGATO/delngato-app/app/(auth)/role.tsx)
- Update role chosen handler to check `authed` status and dispatch `role.selected` with the correct next state (`READY` if authed, `UNAUTHENTICATED` if not).

#### [MODIFY] [dashboard.tsx](file:///D:/PROJECTS/DELGATO/delngato-app/app/(merchant)/(tabs)/dashboard.tsx)
- Remove manual `router.replace` when switching role, letting `setActiveRole` and `RouteGuard` handle it.

#### [MODIFY] [suspended.tsx](file:///D:/PROJECTS/DELGATO/delngato-app/app/(merchant)/suspended.tsx)
- Remove manual `router.replace` when escaping suspended role.

#### [MODIFY] [kyc-pending.tsx](file:///D:/PROJECTS/DELGATO/delngato-app/app/(merchant)/kyc-pending.tsx)
- Remove manual `router.replace` when escaping pending KYC role.

---

### Component 6: Dependencies

#### [MODIFY] [package.json](file:///D:/PROJECTS/DELGATO/delngato-app/package.json)
- Remove `"expo-local-authentication": "~55.0.14"` from dependencies.

---

## Verification Plan

### Automated Verification
- Verify that the app builds and starts without TS compilation errors.
- Run typecheck command: `npm run typecheck`
- Run linting: `npm run lint`

### Manual Verification
- **Cold Boot (New User)**: Verify Splash works, navigates to Intro, then Role Selection, then Welcome, then Auth/OTP, then Home.
- **Cold Boot (Returning Customer)**: Restore session, go straight to Customer Home.
- **Cold Boot (Returning Merchant)**: Restore session, go straight to Merchant Dashboard.
- **Role Switching**: Switch role from Customer Profile to Merchant, verify it lands on Merchant Dashboard. Switch role from Merchant Settings to Customer, verify it lands on Customer Home.
- **Real-Time Order Cycle**: Place order as Customer -> go to Tracking screen. Switch to Merchant -> open Orders Tab -> see incoming order -> accept, start preparing, mark ready, handover. Switch back to Customer -> verify tracking updates dynamically.
