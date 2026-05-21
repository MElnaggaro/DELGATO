 Here is Claude's plan:
╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
 Delngato (وتُاجنلد) Mobile App — Phase 0 Implementation Plan

 ▎ Arabic-first local ordering + delivery app for El-Delngat, Egypt.
 ▎ Stack: Expo SDK 54 · React Native · TypeScript · Expo Router v6 · Zustand · TanStack Query v5 · NativeWind v4 · Reanimated v4 · i18next.

 ---
 1. Context

 The repo currently contains only design assets under design/design-system/ (tokens, fonts, brand voice, HTML preview cards) and design/design-reference/ (an
 HTML/JSX click-through prototype of all primary screens, including a tweaks-panel). The Claude design source file at
 https://api.anthropic.com/v1/design/h/O5LTRdq3FotH2GvZo7wEJA is a gzip archive whose decompressed contents are already present locally — fetching is
 satisfied.

 No app code exists yet. .gitignore already lists delngato-app/node_modules, indicating the app should be scaffolded into delngato-app/ as a sibling of
 design/.

 Goal: transform the HTML-only reference into a production-quality native mobile app that preserves the visual language exactly, while introducing real
 architecture (typed contracts, state separation, RTL-safe primitives, premium motion). The HTML prototype is a spec, not code to port. We re-implement against
  the documented tokens, copy canon, and the Five Laws.

 Why Phase 0 first: the feature surface is wide (16+ screens, 5 mock domains, 4 stateful flows: auth, cart, order, address) and the spec is opinionated (RTL
 default, gold-as-accent-only, no gradients on chrome, motion confined to 150/300ms with no springs). A scaffold-and-go approach would produce drift from the
 brand within a sprint. This plan locks the architecture before any feature work.

 ---
 2. Proposed Project Architecture

 One Expo app at ./delngato-app/ (managed workflow, EAS Build, dev-client friendly).

 Feature-based layout (not file-type-based). Each feature folder owns its UI, hooks, store, and types; cross-feature consumption goes through shared/
 primitives and services/ clients. This keeps the home screen team and the checkout team out of each other's way and prevents the "everything depends on a god
 components/ folder" trap.

 Strict three layers:

 ┌───────────────────────────────────────────────────────┬──────────────────────────────────────────────────────────┬─────────────────────────────────────┐
 │                         Layer                         │                      Responsibility                      │                Tools                │
 ├───────────────────────────────────────────────────────┼──────────────────────────────────────────────────────────┼─────────────────────────────────────┤
 │ UI (features/*/components, shared/ui)                 │ Render only. No data fetching, no business logic.        │ NativeWind classes, Reanimated, RN  │
 │                                                       │ Receives props, calls callbacks.                         │ primitives.                         │
 ├───────────────────────────────────────────────────────┼──────────────────────────────────────────────────────────┼─────────────────────────────────────┤
 │ Logic (features/*/hooks, features/*/stores)           │ Orchestration. State, derived selectors, mutation        │ Zustand, TanStack Query hooks,      │
 │                                                       │ triggers, navigation calls. No fetch code.               │ React Hook Form.                    │
 ├───────────────────────────────────────────────────────┼──────────────────────────────────────────────────────────┼─────────────────────────────────────┤
 │ Service (services/api, services/storage,              │ Side-effect boundaries. Axios client, secure storage, OS │ Axios, Zod, expo-secure-store,      │
 │ services/notifications, services/i18n)                │  APIs.                                                   │ expo-notifications.                 │
 └───────────────────────────────────────────────────────┴──────────────────────────────────────────────────────────┴─────────────────────────────────────┘

 A component never imports from services/; a service never imports from features/. Hooks bridge them. This is the only rule that must not be broken — the rest
 of the architecture can flex.

 Mocked backend abstraction: every API call is defined as a typed function in services/api/*Client.ts that internally toggles between mock (resolves from
 services/api/mocks/*.ts with realistic delays) and http (axios). The feature layer never knows which is active.

 ---
 3. Folder Structure

 delngato-app/
 ├─ app/                              # Expo Router v6 file-based routes
 │  ├─ _layout.tsx                    # Root: i18n bootstrap, RTL lock, fonts, query/zustand providers, gesture root
 │  ├─ +not-found.tsx
 │  ├─ (onboarding)/                  # Stack — pre-auth flow
 │  │  ├─ _layout.tsx
 │  │  ├─ splash.tsx
 │  │  ├─ welcome.tsx                 # 3-slide carousel
 │  │  ├─ auth.tsx                    # phone entry
 │  │  ├─ otp.tsx
 │  │  ├─ location-permission.tsx
 │  │  └─ address-setup.tsx
 │  ├─ (tabs)/                        # Bottom tab navigator (post-auth)
 │  │  ├─ _layout.tsx                 # Custom tab bar; cart badge
 │  │  ├─ home.tsx
 │  │  ├─ search.tsx
 │  │  ├─ cart.tsx
 │  │  └─ profile.tsx
 │  ├─ shop/
 │  │  └─ [shopId].tsx                # Shop detail
 │  ├─ product/
 │  │  └─ [productId].tsx             # Product detail
 │  ├─ category/
 │  │  └─ [categoryKey].tsx
 │  ├─ checkout/
 │  │  ├─ index.tsx                   # Review
 │  │  ├─ payment.tsx                 # Card entry (modal-presentation)
 │  │  └─ success.tsx                 # Order success — replace, no back
 │  ├─ order/
 │  │  └─ [orderId].tsx               # Tracking
 │  ├─ orders.tsx                     # Order history list
 │  ├─ addresses.tsx                  # Manage addresses
 │  ├─ notifications.tsx
 │  └─ settings/
 │     ├─ index.tsx
 │     └─ language.tsx                # AR/EN toggle (triggers reload)
 │
 ├─ src/
 │  ├─ features/
 │  │  ├─ auth/                       # phone/OTP, session
 │  │  │  ├─ components/ (PhoneInput, OtpKeypad)
 │  │  │  ├─ hooks/ (useRequestOtp, useVerifyOtp)
 │  │  │  ├─ store.ts                 # Zustand: { authed, phone, sessionToken }
 │  │  │  ├─ schemas.ts               # Zod: phone, otp
 │  │  │  └─ types.ts
 │  │  ├─ catalog/                    # shops, products, categories, search
 │  │  │  ├─ components/ (ShopCard, ProductTile, CategoryStrip, ShopHero)
 │  │  │  ├─ hooks/ (useShops, useShop, useProducts, useSearch)
 │  │  │  └─ types.ts
 │  │  ├─ cart/
 │  │  │  ├─ components/ (CartLineItem, MiniCartBar, CartTotals)
 │  │  │  ├─ store.ts                 # Zustand persisted (SecureStore-backed)
 │  │  │  ├─ selectors.ts             # subtotal, count, shopId guard
 │  │  │  └─ types.ts
 │  │  ├─ checkout/
 │  │  │  ├─ components/ (PaymentMethodPicker, TimingPicker, OrderReview, CardVisual)
 │  │  │  ├─ hooks/ (usePlaceOrder)
 │  │  │  ├─ schemas.ts               # Zod: cardNumber, expiry, cvv, holder
 │  │  │  └─ types.ts
 │  │  ├─ orders/
 │  │  │  ├─ components/ (OrderProgress, CourierCard, OrderListRow, ActiveOrderBanner)
 │  │  │  ├─ hooks/ (useOrders, useOrder, useOrderTracking)   # polling/SSE-ready
 │  │  │  └─ types.ts
 │  │  ├─ addresses/
 │  │  │  ├─ components/ (AddressCard, AddressForm, MapPlaceholder)
 │  │  │  ├─ store.ts                 # selected address + list
 │  │  │  ├─ schemas.ts
 │  │  │  └─ types.ts
 │  │  ├─ notifications/
 │  │  │  ├─ components/ (NotificationRow)
 │  │  │  ├─ hooks/ (useNotifications, useMarkRead)
 │  │  │  └─ types.ts
 │  │  ├─ profile/
 │  │  │  └─ components/ (ProfileHeader, MenuRow)
 │  │  └─ promos/                     # offers, codes
 │  │     ├─ components/ (OfferHeroCard, PromoCodeRow)
 │  │     └─ types.ts
 │  │
 │  ├─ shared/
 │  │  ├─ ui/                         # Cross-feature primitives — the brand kit
 │  │  │  ├─ Button.tsx
 │  │  │  ├─ Badge.tsx
 │  │  │  ├─ Chip.tsx
 │  │  │  ├─ Stepper.tsx
 │  │  │  ├─ AppBar.tsx
 │  │  │  ├─ BottomTabBar.tsx
 │  │  │  ├─ SearchField.tsx
 │  │  │  ├─ TextField.tsx            # RHF-bound wrapper
 │  │  │  ├─ Card.tsx
 │  │  │  ├─ Section.tsx
 │  │  │  ├─ Row.tsx
 │  │  │  ├─ Divider.tsx
 │  │  │  ├─ EmptyState.tsx
 │  │  │  ├─ Toast.tsx
 │  │  │  ├─ Sheet.tsx                # Bottom sheet wrapper
 │  │  │  ├─ ConfirmDialog.tsx
 │  │  │  ├─ OfflineBanner.tsx
 │  │  │  ├─ Skeleton.tsx
 │  │  │  ├─ Spinner.tsx
 │  │  │  ├─ PressableScale.tsx       # Reanimated press feedback
 │  │  │  └─ Icon.tsx                 # Lucide-react-native barrel
 │  │  ├─ motion/
 │  │  │  ├─ presets.ts               # 150/300ms easings as Reanimated configs
 │  │  │  ├─ Rise.tsx                 # staggered list entrance
 │  │  │  ├─ FadeUp.tsx
 │  │  │  ├─ Pop.tsx
 │  │  │  ├─ SuccessRing.tsx          # animated check
 │  │  │  └─ ScreenTransitions.ts     # Expo Router custom transition specs
 │  │  ├─ theme/
 │  │  │  ├─ tokens.ts                # Typed export of all design tokens
 │  │  │  ├─ colors.ts
 │  │  │  ├─ typography.ts
 │  │  │  ├─ spacing.ts
 │  │  │  └─ shadows.ts
 │  │  ├─ hooks/
 │  │  │  ├─ useArabicDigits.ts       # 12345 → ١٢٣٤٥
 │  │  │  ├─ useCurrency.ts           # number → "م.ج ١٨٧"
 │  │  │  ├─ useRtl.ts
 │  │  │  └─ useHaptics.ts            # tap/success/error feedback
 │  │  └─ utils/
 │  │     ├─ format.ts
 │  │     ├─ datetime.ts
 │  │     └─ phone.ts                 # +20 Egypt normalization
 │  │
 │  ├─ services/
 │  │  ├─ api/
 │  │  │  ├─ client.ts                # axios instance + interceptors + token attach
 │  │  │  ├─ config.ts                # base URL, MOCK flag (env)
 │  │  │  ├─ queryClient.ts           # TanStack Query client with brand-aware defaults
 │  │  │  ├─ schemas/                 # Zod schemas for every wire DTO
 │  │  │  │  ├─ shop.ts
 │  │  │  │  ├─ product.ts
 │  │  │  │  ├─ order.ts
 │  │  │  │  ├─ address.ts
 │  │  │  │  ├─ auth.ts
 │  │  │  │  └─ notification.ts
 │  │  │  ├─ endpoints/               # Typed client functions (mock-aware)
 │  │  │  │  ├─ authClient.ts
 │  │  │  │  ├─ catalogClient.ts
 │  │  │  │  ├─ orderClient.ts
 │  │  │  │  ├─ addressClient.ts
 │  │  │  │  └─ notificationClient.ts
 │  │  │  └─ mocks/                   # In-memory fixtures (mirrors design-reference/data.jsx)
 │  │  │     ├─ shops.ts
 │  │  │     ├─ products.ts
 │  │  │     ├─ orders.ts
 │  │  │     ├─ notifications.ts
 │  │  │     └─ delay.ts              # randomized latency
 │  │  ├─ storage/
 │  │  │  ├─ secureStore.ts           # expo-secure-store wrapper (session, card token)
 │  │  │  └─ asyncStorage.ts          # @react-native-async-storage for cart/prefs
 │  │  ├─ notifications/
 │  │  │  └─ push.ts                  # expo-notifications register + handlers
 │  │  ├─ i18n/
 │  │  │  ├─ index.ts                 # i18next init
 │  │  │  ├─ rtl.ts                   # I18nManager + reload coordination
 │  │  │  └─ locales/
 │  │  │     ├─ ar.json               # default (Egyptian colloquial)
 │  │  │     └─ en.json
 │  │  └─ analytics/
 │  │     └─ track.ts                 # stub; production wires Mixpanel/PostHog
 │  │
 │  └─ test/
 │     ├─ setup.ts
 │     └─ fixtures/
 │
 ├─ assets/
 │  ├─ fonts/                         # Copied from design/design-system/fonts
 │  │  ├─ IBMPlexSansArabic-*.ttf
 │  │  └─ Tienne-*.ttf
 │  └─ images/
 │     ├─ logo-full.png
 │     ├─ icon.png                    # App icon master (د glyph) — placeholder until master ships
 │     ├─ adaptive-icon.png
 │     └─ splash.png
 │
 ├─ app.json
 ├─ babel.config.js
 ├─ metro.config.js                   # withNativewind wrapper
 ├─ tailwind.config.ts                # Tokens mapped to Tailwind theme
 ├─ global.css                        # Nativewind v4 layered imports
 ├─ tsconfig.json                     # strict, paths: '@/features/*', '@/shared/*', '@/services/*'
 ├─ eas.json
 ├─ .env.example
 ├─ package.json
 └─ README.md

 Path aliases via tsconfig + babel-plugin-module-resolver: @/features/*, @/shared/*, @/services/*, @/app/*. Discourages ../../../ imports and keeps refactors
 cheap.

 ---
 4. Dependency Validation

 Validated against Context7 (Expo SDK 54 / NativeWind v4.2). All packages exist, version-compatible, and Expo-prebuild-friendly.

 Runtime:

 ┌───────────────────────────────────────────────────────┬────────────────────┬───────────────────────────────────────────────────────────────────────────┐
 │                        Package                        │    Version pin     │                                   Notes                                   │
 ├───────────────────────────────────────────────────────┼────────────────────┼───────────────────────────────────────────────────────────────────────────┤
 │ expo                                                  │ ~54.x              │ Latest stable SDK.                                                        │
 ├───────────────────────────────────────────────────────┼────────────────────┼───────────────────────────────────────────────────────────────────────────┤
 │ expo-router                                           │ ~6.x               │ File-based routing, web-compatible.                                       │
 ├───────────────────────────────────────────────────────┼────────────────────┼───────────────────────────────────────────────────────────────────────────┤
 │ react / react-native                                  │ matches SDK 54 (RN │ Don't pin manually — let npx expo install resolve.                        │
 │                                                       │  0.81)             │                                                                           │
 ├───────────────────────────────────────────────────────┼────────────────────┼───────────────────────────────────────────────────────────────────────────┤
 │ react-native-reanimated                               │ ~4.x               │ Required by Expo Router transitions and our motion presets. Babel plugin  │
 │                                                       │                    │ auto-configured by SDK 54.                                                │
 ├───────────────────────────────────────────────────────┼────────────────────┼───────────────────────────────────────────────────────────────────────────┤
 │ react-native-gesture-handler                          │ ~2.x               │ Sheets, swipe-to-dismiss, pull-to-refresh.                                │
 ├───────────────────────────────────────────────────────┼────────────────────┼───────────────────────────────────────────────────────────────────────────┤
 │ react-native-safe-area-context                        │ latest             │ Notch/home-indicator.                                                     │
 ├───────────────────────────────────────────────────────┼────────────────────┼───────────────────────────────────────────────────────────────────────────┤
 │ react-native-screens                                  │ latest             │ Router transitions.                                                       │
 ├───────────────────────────────────────────────────────┼────────────────────┼───────────────────────────────────────────────────────────────────────────┤
 │ expo-secure-store                                     │ latest             │ Session token, card tokenization id.                                      │
 ├───────────────────────────────────────────────────────┼────────────────────┼───────────────────────────────────────────────────────────────────────────┤
 │ expo-notifications                                    │ latest             │ Push (order updates, "captain on the way").                               │
 ├───────────────────────────────────────────────────────┼────────────────────┼───────────────────────────────────────────────────────────────────────────┤
 │ expo-localization                                     │ latest             │ Detect device locale; we still force AR by default.                       │
 ├───────────────────────────────────────────────────────┼────────────────────┼───────────────────────────────────────────────────────────────────────────┤
 │ expo-haptics                                          │ latest             │ Tap feedback for primary CTAs / success.                                  │
 ├───────────────────────────────────────────────────────┼────────────────────┼───────────────────────────────────────────────────────────────────────────┤
 │ expo-updates                                          │ latest             │ Required to apply I18nManager.forceRTL reload on language toggle.         │
 ├───────────────────────────────────────────────────────┼────────────────────┼───────────────────────────────────────────────────────────────────────────┤
 │ expo-linking                                          │ latest             │ Deep links (order/payment redirects).                                     │
 ├───────────────────────────────────────────────────────┼────────────────────┼───────────────────────────────────────────────────────────────────────────┤
 │ expo-status-bar                                       │ latest             │ Status bar styling per screen.                                            │
 ├───────────────────────────────────────────────────────┼────────────────────┼───────────────────────────────────────────────────────────────────────────┤
 │ expo-font / expo-splash-screen                        │ latest             │ Font preload + native splash.                                             │
 ├───────────────────────────────────────────────────────┼────────────────────┼───────────────────────────────────────────────────────────────────────────┤
 │ nativewind                                            │ ~4.2               │ Tailwind for RN. Metro plugin only.                                       │
 ├───────────────────────────────────────────────────────┼────────────────────┼───────────────────────────────────────────────────────────────────────────┤
 │ tailwindcss                                           │ ~3.x               │ NW4 still on Tailwind 3 LTS — NW5 (TW v4) is pre-release; defer until     │
 │                                                       │                    │ stable.                                                                   │
 ├───────────────────────────────────────────────────────┼────────────────────┼───────────────────────────────────────────────────────────────────────────┤
 │ zustand                                               │ ~5.x               │ App/client state.                                                         │
 ├───────────────────────────────────────────────────────┼────────────────────┼───────────────────────────────────────────────────────────────────────────┤
 │ @tanstack/react-query                                 │ ~5.x               │ Server state.                                                             │
 ├───────────────────────────────────────────────────────┼────────────────────┼───────────────────────────────────────────────────────────────────────────┤
 │ @tanstack/react-query-persist-client + async-storage  │ ~5.x               │ Offline cache for shops/orders.                                           │
 │ adapter                                               │                    │                                                                           │
 ├───────────────────────────────────────────────────────┼────────────────────┼───────────────────────────────────────────────────────────────────────────┤
 │ axios                                                 │ ~1.x               │ HTTP.                                                                     │
 ├───────────────────────────────────────────────────────┼────────────────────┼───────────────────────────────────────────────────────────────────────────┤
 │ react-hook-form                                       │ ~7.x               │ Auth, address, card forms.                                                │
 ├───────────────────────────────────────────────────────┼────────────────────┼───────────────────────────────────────────────────────────────────────────┤
 │ @hookform/resolvers                                   │ latest             │ Zod bridge.                                                               │
 ├───────────────────────────────────────────────────────┼────────────────────┼───────────────────────────────────────────────────────────────────────────┤
 │ zod                                                   │ ~3.x               │ Schemas (DTO validation + forms).                                         │
 ├───────────────────────────────────────────────────────┼────────────────────┼───────────────────────────────────────────────────────────────────────────┤
 │ i18next / react-i18next                               │ latest             │ Translations.                                                             │
 ├───────────────────────────────────────────────────────┼────────────────────┼───────────────────────────────────────────────────────────────────────────┤
 │ lucide-react-native                                   │ latest             │ Icon set called out by the brand README as the stand-in pack.             │
 ├───────────────────────────────────────────────────────┼────────────────────┼───────────────────────────────────────────────────────────────────────────┤
 │ @react-native-async-storage/async-storage             │ matches SDK        │ Cart persistence + Query persist.                                         │
 ├───────────────────────────────────────────────────────┼────────────────────┼───────────────────────────────────────────────────────────────────────────┤
 │ dayjs (+ dayjs/locale/ar-eg)                          │ ~1.x               │ Order timestamps in Arabic-Egyptian.                                      │
 └───────────────────────────────────────────────────────┴────────────────────┴───────────────────────────────────────────────────────────────────────────┘

 Dev:

 ┌──────────────────────────────────────────────────────────────────────────────┬──────────────────────────────────┐
 │                                   Package                                    │              Notes               │
 ├──────────────────────────────────────────────────────────────────────────────┼──────────────────────────────────┤
 │ typescript ~5.x                                                              │ strict mode.                     │
 ├──────────────────────────────────────────────────────────────────────────────┼──────────────────────────────────┤
 │ eslint, eslint-config-expo, eslint-plugin-react-native, eslint-plugin-import │ Lint.                            │
 ├──────────────────────────────────────────────────────────────────────────────┼──────────────────────────────────┤
 │ prettier + prettier-plugin-tailwindcss                                       │ Formatting + className ordering. │
 ├──────────────────────────────────────────────────────────────────────────────┼──────────────────────────────────┤
 │ jest, jest-expo, @testing-library/react-native                               │ Unit + component tests.          │
 ├──────────────────────────────────────────────────────────────────────────────┼──────────────────────────────────┤
 │ babel-plugin-module-resolver                                                 │ Path aliases.                    │
 └──────────────────────────────────────────────────────────────────────────────┴──────────────────────────────────┘

 Deferred (Phase 2+): maps SDK, Sentry, real payments SDK, Mixpanel/PostHog. Stub interfaces ship now.

 ---
 5. Reusable Component Inventory

 Derived from design/design-reference/app/Atoms.jsx + screen reads. Every primitive is a typed shared/ui/* component with no business logic — feature folders
 compose them.

 ┌──────────────────────────────────┬────────────────────────────────────────────────────────────────────────┬─────────────────────────────────────────────┐
 │            Component             │                            Variants / props                            │         Source of truth in HTML kit         │
 ├──────────────────────────────────┼────────────────────────────────────────────────────────────────────────┼─────────────────────────────────────────────┤
 │ Button                           │ variant: primary | ghost | solid-gold, size: md | lg, full, leading,   │ Atoms.jsx — primary olive, gold press ring, │
 │                                  │ trailing, disabled, loading                                            │  ghost outline.                             │
 ├──────────────────────────────────┼────────────────────────────────────────────────────────────────────────┼─────────────────────────────────────────────┤
 │ Badge                            │ variant: active | pending | issue | solid-olive | solid-gold | ghost   │ Atoms.jsx                                   │
 ├──────────────────────────────────┼────────────────────────────────────────────────────────────────────────┼─────────────────────────────────────────────┤
 │ Chip                             │ active, icon                                                           │ Atoms.jsx                                   │
 ├──────────────────────────────────┼────────────────────────────────────────────────────────────────────────┼─────────────────────────────────────────────┤
 │ AppBar                           │ title, onBack, trailing, transparent                                   │ Atoms.jsx — RTL-aware (chevron-right is     │
 │                                  │                                                                        │ back).                                      │
 ├──────────────────────────────────┼────────────────────────────────────────────────────────────────────────┼─────────────────────────────────────────────┤
 │ BottomTabBar                     │ tabs, cartCount                                                        │ Atoms.jsx                                   │
 ├──────────────────────────────────┼────────────────────────────────────────────────────────────────────────┼─────────────────────────────────────────────┤
 │ SearchField                      │ value, onChange, placeholder, readOnly, onClear, autoFocus             │ Atoms.jsx                                   │
 ├──────────────────────────────────┼────────────────────────────────────────────────────────────────────────┼─────────────────────────────────────────────┤
 │ TextField                        │ RHF-bound; label, error, dir-override, inputMode                       │ New (RHF wrapper).                          │
 ├──────────────────────────────────┼────────────────────────────────────────────────────────────────────────┼─────────────────────────────────────────────┤
 │ Stepper                          │ compact, min, value, onChange; Arabic-Indic digits via useArabicDigits │ Atoms.jsx                                   │
 ├──────────────────────────────────┼────────────────────────────────────────────────────────────────────────┼─────────────────────────────────────────────┤
 │ OrderProgress                    │ step: 0–3, 4 labels Arabic                                             │ Atoms.jsx                                   │
 ├──────────────────────────────────┼────────────────────────────────────────────────────────────────────────┼─────────────────────────────────────────────┤
 │ Card                             │ padding, border | shadow (never both)                                  │ screen usages                               │
 ├──────────────────────────────────┼────────────────────────────────────────────────────────────────────────┼─────────────────────────────────────────────┤
 │ Section                          │ label + children pattern from Checkout                                 │ screens/Cart.jsx                            │
 ├──────────────────────────────────┼────────────────────────────────────────────────────────────────────────┼─────────────────────────────────────────────┤
 │ Row                              │ label/value list row, bold totals                                      │ screens/Cart.jsx                            │
 ├──────────────────────────────────┼────────────────────────────────────────────────────────────────────────┼─────────────────────────────────────────────┤
 │ Divider                          │ hairline canvas-300                                                    │ tokens                                      │
 ├──────────────────────────────────┼────────────────────────────────────────────────────────────────────────┼─────────────────────────────────────────────┤
 │ EmptyState                       │ icon, title, body, action                                              │ screen usages                               │
 ├──────────────────────────────────┼────────────────────────────────────────────────────────────────────────┼─────────────────────────────────────────────┤
 │ Toast                            │ message, leading icon, auto-dismiss 1800ms                             │ Navigator.jsx                               │
 ├──────────────────────────────────┼────────────────────────────────────────────────────────────────────────┼─────────────────────────────────────────────┤
 │ Sheet                            │ bottom sheet with brand-spec dim (rgba(15,26,23,0.48), 0 blur)         │ brand rule                                  │
 ├──────────────────────────────────┼────────────────────────────────────────────────────────────────────────┼─────────────────────────────────────────────┤
 │ ConfirmDialog                    │ title, body, confirm, cancel, destructive                              │ screens/Cart.jsx                            │
 ├──────────────────────────────────┼────────────────────────────────────────────────────────────────────────┼─────────────────────────────────────────────┤
 │ OfflineBanner                    │ persistent top banner when app.offline                                 │ screens/Home.jsx                            │
 ├──────────────────────────────────┼────────────────────────────────────────────────────────────────────────┼─────────────────────────────────────────────┤
 │ Skeleton / ShopCardSkel /        │ warm-canvas shimmer                                                    │ screen usages                               │
 │ ProductTileSkel                  │                                                                        │                                             │
 ├──────────────────────────────────┼────────────────────────────────────────────────────────────────────────┼─────────────────────────────────────────────┤
 │ Spinner                          │ small/large, olive                                                     │ usages                                      │
 ├──────────────────────────────────┼────────────────────────────────────────────────────────────────────────┼─────────────────────────────────────────────┤
 │ Icon                             │ Lucide barrel, RTL mirror for chevrons/arrows/back                     │ Icons.jsx                                   │
 ├──────────────────────────────────┼────────────────────────────────────────────────────────────────────────┼─────────────────────────────────────────────┤
 │ PressableScale                   │ scale 0.96 on press, 100ms ease-out                                    │ screens/Shop.jsx add-button                 │
 └──────────────────────────────────┴────────────────────────────────────────────────────────────────────────┴─────────────────────────────────────────────┘

 Feature primitives (not in shared/):
 - catalog/: ShopCard, ProductTile, ShopHero, CategoryStrip, OfferHero
 - cart/: CartLineItem, MiniCartBar, CartTotals, PromoCodeRow
 - orders/: ActiveOrderBanner, OrderListRow, CourierCard, MapPlaceholder (SVG until map SDK lands)
 - addresses/: AddressCard, AddressForm, LocationDetect
 - checkout/: PaymentMethodPicker, TimingPicker, CardVisual, CardForm
 - notifications/: NotificationRow
 - auth/: PhoneInput (+20 prefix, Egyptian flag), OtpKeypad (6-cell input + native keypad)

 ---
 6. Feature / Module Breakdown

 Each row = one feature in src/features/<name>/. Screens column lists the Expo Router files that compose it.

 ┌───────────────┬─────────────────────────────────────────────────┬───────────────────────────────────────────────────────────────────────────────────────┐
 │    Feature    │                     Screens                     │                                     Surface area                                      │
 ├───────────────┼─────────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────┤
 │ auth          │ (onboarding)/auth, (onboarding)/otp,            │ Phone entry (+20, Egyptian Arabic digits), WhatsApp OTP request + verify, splash with │
 │               │ (onboarding)/splash, (onboarding)/welcome       │  brand reveal, 3-slide onboarding carousel.                                           │
 ├───────────────┼─────────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────┤
 │ addresses     │ (onboarding)/location-permission,               │ Location permission UX, detect / manual entry, address chip labels                    │
 │               │ (onboarding)/address-setup, /addresses          │ (ينات/لغشلا/تيبلا), CRUD list + select.                                               │
 ├───────────────┼─────────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────┤
 │               │ (tabs)/home, (tabs)/search, category/[key],     │ Home (address bar, search, categories, offer hero, shop list with pull-to-refresh +   │
 │ catalog       │ shop/[id], product/[id]                         │ active-order banner), search (recent, trending, results), category browse, shop hero  │
 │               │                                                 │ + sectioned product grid, product detail with note-to-shop.                           │
 ├───────────────┼─────────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────┤
 │ cart          │ (tabs)/cart                                     │ Line items with stepper, remove confirmation, promo, totals, mini-cart bar (shown     │
 │               │                                                 │ from shop screen).                                                                    │
 ├───────────────┼─────────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────┤
 │ checkout      │ checkout/index, checkout/payment,               │ Address + timing + payment selector, card visual + form (Luhn + expiry validation),   │
 │               │ checkout/success                                │ success animation, post-success injects live order.                                   │
 ├───────────────┼─────────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────┤
 │ orders        │ order/[id], /orders                             │ Live tracking (map placeholder + ETA + 4-step progress + courier card from step 2),   │
 │               │                                                 │ history list with status badges.                                                      │
 ├───────────────┼─────────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────┤
 │ notifications │ /notifications                                  │ Read/unread, accent dots, mark-all-read.                                              │
 ├───────────────┼─────────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────┤
 │ profile       │ (tabs)/profile, /settings/*                     │ Profile header, menu rows (addresses, orders, payment methods, language, support,     │
 │               │                                                 │ logout), language toggle that triggers RTL/locale reload.                             │
 ├───────────────┼─────────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────┤
 │ promos        │ composed into home, cart                        │ Offer hero card, promo code row + sheet.                                              │
 └───────────────┴─────────────────────────────────────────────────┴───────────────────────────────────────────────────────────────────────────────────────┘

 Total: ~9 features, ~21 routed screens, ~32 reusable components.

 ---
 7. Navigation Architecture

 Router: Expo Router v6 (file-based, typed routes). Built on react-native-screens + Reanimated.

 Top-level grouping (root app/_layout.tsx):
 1. (onboarding) — stack, presented when authStore.authed === false OR address not set.
 2. (tabs) — bottom tab navigator, default post-auth surface.
 3. Modal/stack routes off (tabs): shop/[id], product/[id], category/[key], checkout/*, order/[id], orders, addresses, notifications, settings/*.

 Auth gating: root _layout.tsx reads authStore.authed and either renders <Redirect href="/(onboarding)/splash"/> or <Stack> with (tabs) initial. Address setup
 gating uses the same pattern after auth — if addresses.length === 0, redirect to (onboarding)/location-permission.

 Transitions: customized per route via Expo Router's screenOptions:
 - Default stack push: slide_from_left in RTL (mirrors HTML reference's RTL push).
 - Modal routes (checkout/payment, sheets, language picker): modal presentation.
 - checkout/success: fade + replace() so back doesn't return to payment.
 - All durations 300ms enter / 240ms exit, ease-out / ease-in — match brand motion tokens.

 Deep linking: expo-linking schema delngato:// with routes /order/[id] (push notification taps), /shop/[id], /checkout/success.

 Back-button discipline: every header that has onBack calls router.back(). Order success and tracking use router.replace() to avoid back-into-checkout dead
 ends.

 ---
 8. State Architecture

 Three lanes, strictly enforced:

 8.1 Server state — TanStack Query

 Owns anything that originates on the server. Cache keys per resource:

 ['shops', { catKey?, q? }]
 ['shop', shopId]
 ['products', shopId, { section? }]
 ['product', productId]
 ['orders', { status? }]
 ['order', orderId]               // refetchInterval while status === 'live'
 ['addresses']
 ['notifications']
 ['auth', 'session']              // sessionToken in SecureStore mirror

 queryClient defaults: staleTime: 30s for catalog, staleTime: 0 + refetchInterval: 4000 for live order, gcTime: 24h. Query persistence via
 @tanstack/react-query-persist-client backed by AsyncStorage so the catalog renders instantly on cold start, then revalidates.

 Mutations: useRequestOtp, useVerifyOtp, usePlaceOrder, useAddAddress, useUpdateAddress, useDeleteAddress, useMarkNotificationRead. Optimistic updates on
 cart-affecting interactions are owned by Zustand, not Query.

 8.2 App/client state — Zustand

 Stores live in features/<name>/store.ts. Each is small and single-purpose. Slices stay separate (no one mega-store) because mixing auth, cart, and UI flags
 into one store makes selectors noisy and partial persistence harder.

 ┌────────────────┬─────────────────────────────────────────────────────────────────────┬──────────────────────────────────────────────────────────────────┐
 │     Store      │                                Shape                                │                            Persisted?                            │
 ├────────────────┼─────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────────────────────────────┤
 │ authStore      │ { authed, phone, sessionToken (mirror only), setAuthed, setPhone,   │ sessionToken via SecureStore; Zustand persist for authed/phone   │
 │                │ signOut }                                                           │ flag (AsyncStorage).                                             │
 ├────────────────┼─────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────────────────────────────┤
 │ cartStore      │ { items: CartItem[], shopId?: string, addItem, setQty, remove,      │ AsyncStorage. Single-shop enforced — adding from another shop    │
 │                │ clear } plus selectors count, subtotal                              │ opens ConfirmDialog to replace.                                  │
 ├────────────────┼─────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────────────────────────────┤
 │ addressStore   │ { list, selectedId, addressDraft }                                  │ AsyncStorage.                                                    │
 ├────────────────┼─────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────────────────────────────┤
 │ uiStore        │ { offline, toast?, languageDir, showSheet }                         │ Not persisted (transient).                                       │
 ├────────────────┼─────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────────────────────────────┤
 │ favoritesStore │ { shopIds: Set<string>, toggle }                                    │ AsyncStorage.                                                    │
 └────────────────┴─────────────────────────────────────────────────────────────────────┴──────────────────────────────────────────────────────────────────┘

 Subscribe with selector functions to avoid re-renders. cartStore.count is a derived selector, never stored.

 8.3 Form state — React Hook Form + Zod

 Bound through @hookform/resolvers/zod. Schemas in features/<name>/schemas.ts. Submit handlers call mutations only.

 Forms:
 - auth/phone — { phone: z.string().regex(EG_PHONE) }
 - auth/otp — { code: z.string().length(6) }
 - addresses/form — { label, street, detail }
 - checkout/card — { number, holder, expiry: MM/YY, cvv } (Luhn check)
 - cart/promo — { code }
 - profile/edit — minimal v1

 ---
 9. Mocked Backend / API Contracts

 All DTOs declared as Zod schemas in services/api/schemas/. The inferred types are the only types features consume — wire and runtime types are the same
 object, eliminating drift.

 // schemas/shop.ts
 export const ShopSchema = z.object({
   id: z.string(),
   letter: z.string().length(1),
   name: z.string(),
   category: z.string(),
   categoryKey: z.enum(['grocery','pharmacy','food','sweets','produce']),
   distanceMeters: z.number(),
   rating: z.number(),
   etaMin: z.number(), etaMax: z.number(),
   deliveryFee: z.number(),
   open: z.boolean(),
   description: z.string(),
   bgGradient: z.tuple([z.string(), z.string()]),
   tags: z.array(z.string()),
 });
 export type Shop = z.infer<typeof ShopSchema>;

 Endpoint surface (mock-aware):

 ┌─────────────────────────────────────────────────────┬─────────────────────────────┬─────────────────────────────────────────────────────────────────────┐
 │                    Method · Path                    │       Client function       │                              Response                               │
 ├─────────────────────────────────────────────────────┼─────────────────────────────┼─────────────────────────────────────────────────────────────────────┤
 │ POST /auth/otp/request                              │ requestOtp(phone)           │ { requestId, expiresIn }                                            │
 ├─────────────────────────────────────────────────────┼─────────────────────────────┼─────────────────────────────────────────────────────────────────────┤
 │ POST /auth/otp/verify                               │ verifyOtp(requestId, code)  │ { sessionToken, user }                                              │
 ├─────────────────────────────────────────────────────┼─────────────────────────────┼─────────────────────────────────────────────────────────────────────┤
 │ POST /auth/signout                                  │ signOut()                   │ 204                                                                 │
 ├─────────────────────────────────────────────────────┼─────────────────────────────┼─────────────────────────────────────────────────────────────────────┤
 │ GET /catalog/shops?category=&q=                     │ listShops(filter)           │ Shop[]                                                              │
 ├─────────────────────────────────────────────────────┼─────────────────────────────┼─────────────────────────────────────────────────────────────────────┤
 │ GET /catalog/shops/:id                              │ getShop(id)                 │ Shop                                                                │
 ├─────────────────────────────────────────────────────┼─────────────────────────────┼─────────────────────────────────────────────────────────────────────┤
 │ GET /catalog/shops/:id/products?section=            │ listProducts(shopId,        │ Product[]                                                           │
 │                                                     │ filter)                     │                                                                     │
 ├─────────────────────────────────────────────────────┼─────────────────────────────┼─────────────────────────────────────────────────────────────────────┤
 │ GET /catalog/products/:id                           │ getProduct(id)              │ Product                                                             │
 ├─────────────────────────────────────────────────────┼─────────────────────────────┼─────────────────────────────────────────────────────────────────────┤
 │ GET /catalog/categories                             │ listCategories()            │ Category[]                                                          │
 ├─────────────────────────────────────────────────────┼─────────────────────────────┼─────────────────────────────────────────────────────────────────────┤
 │ GET /search?q=                                      │ search(q)                   │ { shops: Shop[], products: Product[] }                              │
 ├─────────────────────────────────────────────────────┼─────────────────────────────┼─────────────────────────────────────────────────────────────────────┤
 │ GET /addresses / POST / PATCH /:id / DELETE /:id    │ addressClient               │ Address[] / Address                                                 │
 ├─────────────────────────────────────────────────────┼─────────────────────────────┼─────────────────────────────────────────────────────────────────────┤
 │ POST /orders                                        │ placeOrder(input)           │ Order                                                               │
 ├─────────────────────────────────────────────────────┼─────────────────────────────┼─────────────────────────────────────────────────────────────────────┤
 │ GET /orders                                         │ listOrders()                │ Order[]                                                             │
 ├─────────────────────────────────────────────────────┼─────────────────────────────┼─────────────────────────────────────────────────────────────────────┤
 │ GET /orders/:id                                     │ getOrder(id)                │ Order (polled while status === 'live')                              │
 ├─────────────────────────────────────────────────────┼─────────────────────────────┼─────────────────────────────────────────────────────────────────────┤
 │ GET /notifications / POST /:id/read / POST          │ notificationClient          │ Notification[]                                                      │
 │ /read-all                                           │                             │                                                                     │
 ├─────────────────────────────────────────────────────┼─────────────────────────────┼─────────────────────────────────────────────────────────────────────┤
 │ POST /payments/card                                 │ tokenizeCard(card)          │ { cardToken } (never persists PAN locally — token returned by       │
 │                                                     │                             │ gateway)                                                            │
 └─────────────────────────────────────────────────────┴─────────────────────────────┴─────────────────────────────────────────────────────────────────────┘

 Mock implementation: services/api/mocks/*.ts ports the catalog from design/design-reference/app/data.jsx 1:1 (shops, products, orders, notifications,
 recent/trending searches). delay.ts adds 200–600ms jitter to mimic mobile network behavior so skeletons/loading states are exercised.

 Toggle: EXPO_PUBLIC_API_MODE=mock|http in .env. client.ts reads it once at boot. Tests force mock.

 ---
 10. Localization / RTL Strategy

 Default: Egyptian colloquial Arabic, RTL.

 10.1 Locale resolution

 - App reads stored preference from AsyncStorage (@delngato/locale).
 - If none, reads expo-localization device locale; if it starts with ar* → ar-EG, else → en (still presented as a switch, not a default — per Law 01).
 - Stored choice wins on subsequent launches.

 10.2 RTL lock

 - AR locale → I18nManager.forceRTL(true) if not already; otherwise reload via Updates.reloadAsync() (Expo's documented pattern).
 - EN locale → forceRTL(false) + reload.
 - This is the only place a reload is triggered automatically.
 - In development on Expo Go, RTL doesn't survive across launches — use a dev client for testing the toggle (documented in README).

 10.3 i18next setup

 - services/i18n/index.ts initializes with ar default, en fallback off for AR keys (brand voice is canonical, no auto-fallback to English).
 - Namespaces: common, auth, home, cart, checkout, orders, addresses, notifications, profile, errors.
 - Source-of-truth for canonical copy is design/design-system/brand/voice.md + the table in design-system/README.md. Translation files duplicate this verbatim
 (Arabic) and provide English equivalents that follow the same brevity rules.

 10.4 RTL-aware UI rules

 - Use start/end instead of left/right everywhere in styles. NativeWind v4 emits logical properties under RN's flex handling.
 - Tailwind text-start, ps-, pe-, ms-, me- only.
 - Directional icons (ChevronLeft/ChevronRight, arrows, back) wrapped in Icon.directional({name}) which picks the visually-correct glyph based on
 I18nManager.isRTL. (The HTML kit uses chevronRight for back because RTL — we encode this behavior centrally.)
 - Number formatting: useArabicDigits() converts 0–9 to ٩–٠ in AR. Mono/technical strings (order IDs DLN-٢٠٤٧, card numbers, codes) stay in IBM Plex Mono and
 follow brand rule: Arabic-Indic for in-product times/quantities, Western for order IDs in dir="ltr".
 - Currency: useCurrency(amount) → "م.ج ١٨٧" in AR, "187 EGP" in EN.

 10.5 Mixed-direction content

 - Phone, card, IDs rendered with explicit style={{ writingDirection: 'ltr' }} and textAlign: 'left', even inside RTL screens — matches OTPScreen and
 PaymentScreen patterns in the HTML reference.

 ---
 11. Animation Architecture

 Brand rule: 150ms micro / 300ms transition · ease-out enter / ease-in exit · no springs, no bounces.

 11.1 Tokens (shared/motion/presets.ts)

 export const motion = {
   dur: { micro: 150, transition: 300, slow: 600 },
   ease: {
     out: Easing.bezier(0.16, 1, 0.3, 1),
     in:  Easing.bezier(0.7, 0, 0.84, 0),
   },
 } as const;

 11.2 Reusable motion components (shared/motion/)

 - Rise — translateY(8 → 0) + opacity(0 → 1), 300ms ease-out, with delay prop for stagger in lists (40–50ms increments — see Home/Shop product grids).
 - FadeUp — same as Rise but smaller translate (4px) for inline elements.
 - Pop — scale(0.92 → 1) + opacity, 280ms ease-out, used for splash logo + map pin appearance + decorative letter accents.
 - PressableScale — withTiming(0.96, 100) on onPressIn, restore on out. Wraps interactive cards and primary CTAs.
 - SuccessRing — composite: outer ring scale(0.6 → 1) + inner check pathLength(0 → 1) over 700ms, used by OrderSuccess.
 - Spin — continuous 700ms linear rotation for Icon.refresh loaders.

 11.3 Reanimated scope

 - Yes: screen entrance staggers, pull-to-refresh, mini-cart bar slide-in, sticky header shadow on scroll, OTP cell fill, success ring, list-item rise.
 - No: confetti, parallax, hero parallax scroll, page peel, anything spring-based.

 11.4 Pull-to-refresh

 - Use RefreshControl on FlatList/ScrollView with tintColor: olive and colors={['#1F4A3D']} on Android.
 - The HTML reference's hand-rolled pullY/onTouchMove simulation is replaced by native RefreshControl — it's the platform behavior users expect.

 11.5 Sticky header compression

 - On Shop and Home, the category strip becomes shadowed when scrollTop > 8 (matches reference). Implemented with a shared value driven by onScroll from
 Reanimated's useAnimatedScrollHandler.

 11.6 Map (Tracking)

 - Phase 0+1: stylized SVG placeholder identical to reference (using react-native-svg). Courier marker animates between 4 bezier-curve waypoints over 1200ms —
 matches HTML.
 - Phase 2 (post-approval, not in this plan): swap to expo-maps (preferred — Apple Maps + Google Maps via Expo, requires dev client) with the same olive/gold
 marker tokens.

 11.7 Tab bar

 - Native bottom tab bar with iOS-style backdrop blur (10% canvas overlay + 24px blur on iOS) via BlurView from expo-blur. Android falls back to opaque canvas
 — the spec's "feel native" rule.

 11.8 Haptics

 - Light impact on primary CTA tap, success on order placed, warning on validation error. Wired via useHaptics(). Respects expo-haptics device support.

 ---
 12. Implementation Milestones

 Phase numbers map to the post-approval phases the user already named. Approval gate after every milestone except 1→2.

 ┌─────┬───────────────────────────────────────────────────────────────────────────────────────────┬───────────────────────────────────────────────────────┐
 │  #  │                                         Milestone                                         │                  Verifiable outcome                   │
 ├─────┼───────────────────────────────────────────────────────────────────────────────────────────┼───────────────────────────────────────────────────────┤
 │     │ This plan + scaffolding (delngato-app/ with empty Expo app, tokens wired, fonts loaded,   │ App boots in Expo Go on a real device showing the     │
 │ M0  │ RTL bootstrap, NativeWind compiles, lint+TS clean, npx expo start shows brand splash).    │ Arabic wordmark over olive canvas. No screens beyond  │
 │     │                                                                                           │ splash.                                               │
 ├─────┼───────────────────────────────────────────────────────────────────────────────────────────┼───────────────────────────────────────────────────────┤
 │ M1  │ Design system + shared/ui primitives + motion presets. Storybook-lite "kitchen sink"      │ Every preview card from design-system/preview/*.html  │
 │     │ route at app/_dev/kit.tsx (DEV only) renders every primitive with all variants.           │ has a 1:1 RN equivalent — verifiable side-by-side.    │
 ├─────┼───────────────────────────────────────────────────────────────────────────────────────────┼───────────────────────────────────────────────────────┤
 │     │ Auth flow end-to-end (splash → carousel → phone → OTP → location → address) with mock     │ A user can sign up with any phone, any 6-digit code   │
 │ M2  │ backend, RHF+Zod validation, RTL transitions, OTP custom keypad.                          │ that isn't 123456, and land on Home. Session persists │
 │     │                                                                                           │  across cold start.                                   │
 ├─────┼───────────────────────────────────────────────────────────────────────────────────────────┼───────────────────────────────────────────────────────┤
 │     │ Catalog read path: Home (address, search, categories, offer hero, shop list, active-order │ Visual parity with HTML reference.                    │
 │ M3  │  banner, pull-to-refresh) + Search (recent/trending/results) + Category + Shop detail     │ Lighthouse-equivalent: skeletons render <200ms,       │
 │     │ (hero, sticky category strip, product grid, mini-cart bar) + Product detail. All          │ navigation ≤300ms.                                    │
 │     │ mock-backed.                                                                              │                                                       │
 ├─────┼───────────────────────────────────────────────────────────────────────────────────────────┼───────────────────────────────────────────────────────┤
 │     │ Cart + Checkout + Payment + Success + Tracking. Cart persists. Single-shop guard. Card    │ Place an order end-to-end without a backend; receive  │
 │ M4  │ form validates Luhn. Tracking polls mock backend, animates courier marker, shows courier  │ a fake push 5s later.                                 │
 │     │ card from step 2, succeeds at step 4.                                                     │                                                       │
 ├─────┼───────────────────────────────────────────────────────────────────────────────────────────┼───────────────────────────────────────────────────────┤
 │ M5  │ Orders history, Notifications, Profile, Addresses CRUD, Language toggle (forces RTL/LTR   │ Full main-menu coverage. AR↔EN toggle survives cold   │
 │     │ reload), Logout.                                                                          │ start.                                                │
 ├─────┼───────────────────────────────────────────────────────────────────────────────────────────┼───────────────────────────────────────────────────────┤
 │     │ Production readiness: expo-notifications real registration, deep links, Sentry (or stub   │ Internal TestFlight + Play Internal Testing build     │
 │ M6  │ adapter ready), production EAS profile, app icons + splash master, App Store / Play Store │ distributed.                                          │
 │     │  metadata in Arabic-first. Replace SVG map with real map SDK (decision point).            │                                                       │
 └─────┴───────────────────────────────────────────────────────────────────────────────────────────┴───────────────────────────────────────────────────────┘

 Each milestone closes with: typecheck clean (tsc --noEmit), lint clean (eslint .), test suite passing (jest), and a manual visual diff against the HTML
 reference for the screens in scope.

 ---
 13. Risk Analysis / Technical Concerns

 #: 1
 Risk: RTL drift — components ship with left/right instead of start/end and break in LTR mode.
 Likelihood: High (RN's RTL handling is partial).
 Impact: Visual breakage on language toggle.
 Mitigation: Lint rule blocking marginLeft/paddingRight/etc. in shared/ui/. CI runs the visual diff in both directions.
 ────────────────────────────────────────
 #: 2
 Risk: NativeWind + Tailwind dynamic tokens — design tokens defined as CSS variables in the HTML kit don't translate; NW needs theme values at config time.
 Likelihood: Medium.
 Impact: Drift between design system file and app.
 Mitigation: tailwind.config.ts is generated from a single TS source-of-truth (shared/theme/tokens.ts); a unit test asserts the config matches the HTML CSS
   variable values.
 ────────────────────────────────────────
 #: 3
 Risk: Font loading flash — IBM Plex Sans Arabic + Tienne add ~1.5MB; splash must hold until ready.
 Likelihood: Medium.
 Impact: Layout shift, branded splash dropped.
 Mitigation: expo-splash-screen.preventAutoHideAsync() until expo-font resolves. Splash background is olive (brand) so the bridge is invisible.
 ────────────────────────────────────────
 #: 4
 Risk: WhatsApp OTP provider — copy promises WhatsApp delivery but no provider chosen.
 Likelihood: Medium.
 Impact: Cannot ship M2 to production without a provider (Twilio, Vonage, MessageBird, or a domestic EG provider).
 Mitigation: Mock-mode covers all UX. Provider decision deferred to M6; interface in services/api/endpoints/authClient.ts is provider-agnostic.
 ────────────────────────────────────────
 #: 5
 Risk: Map SDK choice — expo-maps requires dev client + Apple Developer + Google Cloud setup; the SVG placeholder works visually but is not interactive.
 Likelihood: Medium.
 Impact: Tracking screen feels less premium without real map.
 Mitigation: SVG placeholder for M1–M5. Swap behind <MapPlaceholder onUpgrade.../> interface in M6 once accounts/keys are confirmed.
 ────────────────────────────────────────
 #: 6
 Risk: Cart cross-shop — the brand UX doesn't define what happens when a user adds an item from shop B while shop A has items.
 Likelihood: Medium.
 Impact: Ambiguous flow; could silently clear cart.
 Mitigation: Single-shop policy enforced in cartStore.addItem. On conflict, return { requiresConfirm: true, currentShop, newShop }; UI shows ConfirmDialog
 .)"؟ نم بلطب ةلسلا لدبتسا"(
 ────────────────────────────────────────
 #: 7
 Risk: Persisted-session validity — restoring a token that the server has revoked.
 Likelihood: Medium.
 Impact: Crash or stuck screen on cold start.
 Mitigation: client.ts interceptor catches 401, calls authStore.signOut(), redirects to splash. TanStack Query retry: false for auth failures.
 ────────────────────────────────────────
 #: 8
 Risk: Type substitution (Tienne vs Inter) — README flags this as unresolved.
 Likelihood: Low.
 Impact: Wordmark looks correct (Tienne); body fallback uses IBM Plex Sans Arabic's Latin glyphs, which is acceptable.
 Mitigation: Match brand README guidance: Tienne for display/wordmark, IBM Plex Sans Arabic for everything else. Open question logged in M6 ("ship Inter if
   uploaded").
 ────────────────────────────────────────
 #: 9
 Risk: Lucide stand-in icons — README explicitly says "swap when canonical pack arrives."
 Likelihood: Low.
 Impact: None today.
 Mitigation: All icon usage flows through shared/ui/Icon.tsx barrel — swap is one file.
 ────────────────────────────────────────
 #: 10
 Risk: Currency formatting edge cases — Number.toLocaleString('ar-EG') differs across iOS/Android versions for negatives/zero.
 Likelihood: Low.
 Impact: Minor visual inconsistency.
 Mitigation: Format via useCurrency() with a tested utility, not raw toLocaleString at call sites.
 ────────────────────────────────────────
 #: 11
 Risk: Reanimated v4 + Expo Router transitions — version drift between RN 0.81 and Reanimated worklet API.
 Likelihood: Low.
 Impact: Build errors.
 Mitigation: Stay on Expo-managed versions (npx expo install resolves compatible pins). CI runs expo-doctor.
 ────────────────────────────────────────
 #: 12
 Risk: Egyptian phone number formats — leading 0, +20, country flag input.
 Likelihood: Low.
 Impact: User confusion.
 Mitigation: shared/utils/phone.ts normalizes any input to E.164 server-side and displays national format in UI.

 ---
 14. Critical Files To Be Modified or Created

 (Phase 0 produces no app code yet — this is the M0 scaffold preview, to be created post-approval.)

 Created at M0:
 - delngato-app/app.json — Expo config, RTL extra.locale.default = 'ar-EG', icon, splash.
 - delngato-app/app/_layout.tsx — Providers (QueryClient, Zustand hydration, i18n init, GestureHandlerRootView, SafeAreaProvider), font preload, RTL bootstrap,
  splash hold.
 - delngato-app/global.css — NativeWind v4 layered imports.
 - delngato-app/tailwind.config.ts — theme: { colors, fontFamily, spacing, borderRadius, boxShadow, fontSize } mapped from shared/theme/tokens.ts.
 - delngato-app/metro.config.js — withNativewind wrap.
 - delngato-app/babel.config.js — babel-preset-expo + react-native-reanimated/plugin (last) + module-resolver.
 - delngato-app/tsconfig.json — strict, path aliases.
 - delngato-app/src/shared/theme/tokens.ts — single source of truth for tokens (mirrors design/design-system/colors_and_type.css).
 - delngato-app/services/i18n/{index.ts, rtl.ts, locales/ar.json, locales/en.json} — boot, RTL handling, canon strings from
 design/design-system/brand/voice.md.
 - delngato-app/assets/fonts/* — copied from design/design-system/fonts/.
 - delngato-app/assets/images/logo-full.png — copied from design/design-system/assets/.

 Pattern (repeated per feature in M1–M5):
 - src/features/<name>/components/*.tsx — pure UI.
 - src/features/<name>/hooks/*.ts — Query/RHF orchestration.
 - src/features/<name>/store.ts — Zustand slice (if any).
 - src/features/<name>/schemas.ts — Zod (if any).
 - src/services/api/endpoints/<name>Client.ts + src/services/api/mocks/<name>.ts.
 - app/<route>.tsx — composes feature components.

 ---
 15. Verification Plan

 Each milestone has a defined "done" check; together they make the post-approval iteration auditable.

 1. Visual parity check — for every screen, open design-reference/app/index.html in a browser at iPhone 14 viewport, take a screenshot, and compare against
 expo run:ios or expo run:android of the equivalent route. Diff is acceptable only where the brand spec says native should override (status bar, keypad).
 2. RTL toggle test — launch app, navigate to /settings/language, switch to English, app reloads, all logical-property layouts mirror correctly. Switch back,
 verify no leaked LTR styles.
 3. Cold-start cache test — kill app, relaunch — Home renders shop list from cached Query data within 300ms; refetch happens silently in the background.
 4. Mock end-to-end — using EXPO_PUBLIC_API_MODE=mock, complete: sign up → add to cart from Abu Hassan → checkout → cash → success → tracking advances → step 4
  ("delivered"). Time budget: <90 seconds clicking through.
 5. Strict typecheck + lint + Jest — npx tsc --noEmit && eslint . && jest exits zero at every milestone tag.
 6. expo-doctor — npx expo-doctor runs clean (no version mismatches).
 7. Brand audit (manual checklist) — Canvas backgrounds present, no pure white anywhere except elevated cards, no gradients on chrome, gold appears only as
 accent/press/badge, no emoji in product strings (search i18n/locales/ar.json for emoji codepoints), every screen has ≤1 !.

 ---

 ---
 16. Open Questions (resolve before/during M6)

 These are listed in design-system/README.md as "Caveats & open questions" and don't block M0–M5. Surfacing here so they're not lost.

 1. Latin body face — Tienne (provided) vs Inter (brand-book-named). Default to Tienne for display + IBM Plex Sans Arabic Latin for body, until Inter is
 uploaded.
 2. Icon pack — Lucide stand-in until a canonical pack arrives.
 3. App icon master — د-in-olive-circle is a placeholder; awaiting final master.
 4. IBM Plex Mono — not bundled; CDN fallback in HTML; for native we need to either bundle it or accept system mono.
 5. WhatsApp OTP provider — TBD.
 6. Map SDK — expo-maps (recommended) vs react-native-maps vs SVG placeholder.
 7. Photography — product tiles use tinted-letter placeholders today. Real photography pipeline (CDN + image format strategy) TBD.

 These open questions are flagged in the plan, not asked now, because the user's Phase 0 ask is "produce a full implementation plan, then STOP." None of them
 block the architecture above.