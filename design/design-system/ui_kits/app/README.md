# Delngato — Mobile App UI Kit

A click-through, hi-fi recreation of the **دلنجاتُو** mobile app, built strictly against `Delngato_Brand_Guidelines_v1.1.docx`. There is no production codebase attached to this project, so this kit is a *spec* — a brand-book interpretation, not a 1:1 of a shipped product. **If a production app exists, please link it so we can align pixel-for-pixel.**

## What's in here

| File | Purpose |
|---|---|
| `index.html` | The interactive prototype. Open this. |
| `app.css` | Shared component stylesheet (imports the root design tokens). |
| `ios-frame.jsx` | iOS device chrome (starter component). |
| `Icons.jsx` | Inline-SVG icon set, 2px stroke, currentColor — Lucide-style. |
| `Atoms.jsx` | Primitives: `AppBar`, `BottomTabBar`, `Button`, `Badge`, `Chip`, `ShopCard`, `Stepper`, `OrderProgress`, `SearchField`. |
| `data.jsx` | Mock catalog: shops, categories, products (all Arabic). |
| `Onboarding.jsx` | Splash + value props + start CTA. |
| `Home.jsx` | Address bar, search, categories, offer hero, shop list. |
| `Shop.jsx` | Shop hero, product grid, mini-cart bar. |
| `Cart.jsx` | Items, address, payment, totals, checkout. |
| `Tracking.jsx` | Live order tracking — map + ETA + stepper + courier card. |

## Screens

1. **Onboarding** — splash with Arabic display wordmark + three value rows.
2. **Home** — sticky header with delivery address, soft-tint search, scrollable category chips, gold-accent offer card, list of local shops.
3. **Shop detail** — full-bleed olive hero, category strip, 2-column product grid with add/quantity controls, floating olive mini-cart bar.
4. **Cart** — shop strip, line items with stepper, address card, payment selector (cash / card), itemized totals, sticky checkout button.
5. **Tracking** — stylized map, live ETA card with status stepper, courier card with call button (state 2 only), itemized recap.

## Navigation

The thumbnails on the right of `index.html` jump between screens. Inside the prototype:

- Onboarding → tap **ابدأ دلوقتي** → Home
- Home → tap any shop card → Shop
- Shop → tap a product (or `+`) → adds to cart; tap the floating mini-cart bar → Cart
- Cart → tap **تأكيد الطلب** → Tracking
- Tracking auto-progresses through the four delivery states for the demo (every 6 seconds).

## Brand fidelity notes

- **Tokens.** Every color, radius, shadow, type setting, motion duration is read from `colors_and_type.css` via CSS variables. Editing the token file updates the whole kit.
- **RTL by default.** The HTML element is `dir="rtl"`. Components mirror naturally; the `chevronRight` icon doubles as the back affordance because Arabic UI reads right-to-left.
- **No emoji** in product UI — product tile imagery uses tinted swatches with the product's first Arabic letter as a placeholder. **Replace with real photography** when shop SKU photos are available.
- **No gradients on UI surfaces.** The two gradients in the kit are content (the dark hero on offer card and the shop hero) — not chrome.
- **Press state** on the primary button uses the brand's signature 2px gold inset ring.
- **Min tap target 44pt** preserved on every interactive control.

## Known caveats

- The iOS frame is from the project's starter library — its status bar / dynamic island are illustrative, not exact.
- The "map" on the tracking screen is a stylized SVG placeholder. The real product will use a map SDK.
- The dark mode inversion from the brand book is not exercised on any screen in this kit yet.
- Courier name, ETA, items, and shop names are all dummy data.
