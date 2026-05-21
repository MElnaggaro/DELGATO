# دلنجاتُو · Delngato (mobile app)

Arabic-first local ordering & delivery app for **El-Delngat**, Egypt.
Implementation of `/design/design-system/` against the [approved Phase 0 plan](../../.claude/plans/fetch-this-design-file-harmonic-nebula.md).

## Stack

- Expo SDK 54 · React Native 0.76 · TypeScript (strict)
- Expo Router v6 (file-based, typed routes)
- NativeWind v4 + Tailwind 3 (tokens from `src/shared/theme/tokens.ts`)
- Zustand · TanStack Query v5 · React Hook Form + Zod
- React Native Reanimated · Gesture Handler
- i18next · expo-localization · expo-updates (for RTL re-locks)
- expo-secure-store · expo-notifications · expo-haptics · expo-blur · expo-font

## Setup

```bash
cd delngato-app
npm install
cp .env.example .env
npm run start
```

Then press `i` for iOS Simulator or `a` for Android. Scan the QR with Expo Go on a real device (RTL behaves correctly in Expo Go for a single session — see notes below).

> **Heads up:** because the app is RTL-by-default, testing the **language toggle** (M5) reliably requires a dev client (`eas build --profile development`). Expo Go resets `I18nManager.forceRTL` between launches.

## What's in here (M0 + partial M1)

- **Brand splash** at `app/index.tsx` — olive surface, ivory monogram, Arabic-over-Latin wordmark.
- **Onboarding carousel skeleton** at `app/(onboarding)/welcome.tsx`.
- **Shared primitives** at `src/shared/ui/` — Button, Badge, Chip, Card, Section, Row, Divider, AppBar, BottomTabBar, SearchField, Stepper, OrderProgress, EmptyState, Spinner, OfflineBanner, PressableScale, Icon (Lucide), IconBack/Forward (direction-aware).
- **Motion primitives** at `src/shared/motion/` — FadeUp, Rise, Pop. All 150/300ms · ease-out / ease-in. No springs.
- **Design tokens** at `src/shared/theme/tokens.ts` (source of truth; `tailwind.config.ts` is generated from this).
- **i18n** at `src/services/i18n/` — Arabic-default (Egyptian colloquial), English secondary. Canonical copy from `design/design-system/brand/voice.md`.
- **Kitchen sink** at `/(dev)/_dev/kit` — DEV route rendering every primitive variant.

## What's next

Per the [approved plan](../../.claude/plans/fetch-this-design-file-harmonic-nebula.md):

- **M2** — Auth flow (phone, OTP, location permission, address setup) end-to-end against the mock backend.
- **M3** — Catalog read path: Home, Search, Category, Shop, Product.
- **M4** — Cart, Checkout, Payment, Success, Tracking.
- **M5** — Orders history, Notifications, Profile, Addresses CRUD, Language toggle.
- **M6** — Production readiness (real push, deep links, EAS profile, real map SDK, real OTP provider).

## Conventions

- **No `left`/`right` styles.** Use `start`/`end` (or `insetInlineStart`/`insetInlineEnd`). This is enforced by an eslint rule planned for M1.
- **No emoji** in product strings. Marketing/social only.
- **Gold is an accent only.** Never a button background unless the button is the offer CTA (`solid-gold` variant — exists for that purpose, rare).
- **One `!` per screen, max.**
- **Cards have `border` OR `shadow`, never both.** `Card` enforces this with `elevated` prop.

## Sources of truth

- Brand book: `../design/design-system/README.md`
- Voice + Five Laws: `../design/design-system/brand/voice.md`
- HTML reference for parity: `../design/design-reference/app/index.html`
- Mock data: `../design/design-reference/app/data.jsx` (to be ported to `src/services/api/mocks/`)
