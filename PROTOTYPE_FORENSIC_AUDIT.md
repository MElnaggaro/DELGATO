# Executive Summary

Prototype status: RED

The current prototype implementation is blocked by critical runtime infinite loops, double navigation bugs, and a broken startup splash sequence. These must be resolved before any design validation can occur, as the app will either crash or loop endlessly upon returning users.

# Startup Flow (actual)

1. `_layout.tsx` starts the `BootSequence`.
2. Expo Splash is held while fonts, i18n, and stores are hydrated.
3. `finishHydration()` determines the initial `AppState`.
4. `RoutingResolver` maps `AppState` to a route (e.g. `/(tabs)/home`).
5. **BUG:** `RouteGuard` intercepts and performs `router.replace(href)`. However, `usePathname()` returns normalized paths without groups (e.g., `/home`), which fails the `route.path === pathname` check. This triggers an infinite routing loop.
6. **BUG:** The JS Splash (`app/index.tsx`) brand reveal animation is bypassed completely because `RouteGuard` navigates away immediately before the 760ms animations can play.

# Scenario Matrix

| Scenario | Expected | Actual | Problems |
| --- | --- | --- | --- |
| **New User** | Splash -> Intro -> Welcome -> Auth | Splash bypassed -> Intro -> Welcome -> Auth | Splash animation is skipped. |
| **Returning Customer** | Splash -> Home | Infinite loop on Home | `RouteGuard` continuously replaces `/(tabs)/home` due to path mismatch. |
| **Biometric Enabled** | Splash -> Biometric -> Home | Double navigation & possible loop | `biometric.tsx` navigates, and `RouteGuard` navigates simultaneously on `bio.verified`. |
| **Merchant** | Splash -> Merchant Dashboard | Infinite loop on Dashboard | Similar route loop as customer home. |

# Crash / Loop Root Causes

1. **RouteGuard Infinite Loop:**
   - Cause: `usePathname()` strips route groups (returns `/home`), but `RoutingResolver` returns paths with groups (returns `/(tabs)/home`). The equality check `route.path === pathname` fails, causing continuous `router.replace` calls.
2. **Double Navigation (Biometric):**
   - Cause: `biometric.tsx` calls `router.replace('/(tabs)/home')` in a timeout, while concurrently dispatching `bio.verified` which causes `RouteGuard` to navigate to the same route immediately.
3. **Missing Splash Animation:**
   - Cause: The `RouteGuard` does not account for the purely visual `app/index.tsx` screen and navigates immediately. The legacy tree allowed the screen to render.

# UI Design Mismatches

- **Splash Screen:** Completely bypassed due to early navigation.
- **Biometric Prompts:** Multiple overlapping prompts can happen if the component remounts rapidly due to routing instability.

# Broken Buttons

- Any button triggering a state transition monitored by `RouteGuard` might cause double navigation or get stuck in the `RouteGuard` loop.

# Missing Flows

- Role switching UI is absent, so `ROLE_SELECTION_REQUIRED` is unreachable.
- Merchant setup edge cases might hit the same infinite loop if their paths contain groups.

# Prototype Blockers

1. **Route loops on Home/Dashboard** - Blockers user from doing anything.
2. **Missing Splash Sequence** - Fails to impress users.
3. **Biometric Race Conditions** - Blocks returning users.

# Recommended Fix Plan

**P0 (Must Fix Now):**
- Fix `RouteGuard` path normalization to compare normalized paths (e.g. strip `/\/\([^)]+\)/g`) to stop infinite loops.
- Remove explicit `router.replace` from `biometric.tsx` and let `RouteGuard` handle it cleanly.
- Fix Splash sequence: Introduce a delay or a visual state in `AppStateMachine` so `app/index.tsx` can finish its animation before `RouteGuard` navigates away.

**P1 (Should Fix):**
- Fix duplicate navigation calls across the app where state changes and explicit routing collide.

**P2 (Later):**
- Ensure 100% design parity using the reference HTML.
- Role switching logic in UI.
