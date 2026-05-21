# Delngato Design System

> دلنجاتُو · Delngato · Mobile-first ordering app for El‑Delngat
>
> "Premium without pretension. Arabic-first. Confident restraint."

This is the working design system for **دلنجاتُو (Delngato)**, a mobile application that lets residents of **El‑Delngat** (a city in Egypt's Delta) browse local shops, place orders, pay, and track delivery — all from one app. No phone calls. No WhatsApp back-and-forth.

The system is Arabic-native (RTL-first, IBM Plex Sans Arabic), grounded in a palette of deep olive, warm canvas, and gold, and built around five non-negotiable laws (see *The Five Laws* in `brand/`).

## Sources

This system is derived from the official brand book the team uploaded:

| Source | Path | Notes |
|---|---|---|
| `Delngato_Brand_Guidelines_v1.1.docx` | `uploads/brand_guidelines.docx` | Full brand book, v1.1 (2025). |
| Primary logo render | `uploads/Gemini_Generated_Image_aof62jaof62jaof6.png` → `assets/logo-full.png` | Wordmark lockup (Arabic over Latin). |
| Fonts | `uploads/IBMPlexSansArabic-*.ttf`, `uploads/Tienne-*.ttf` → `fonts/` | See *Type substitution* below. |

There is **no codebase or Figma attached** for this project. UI kits below were built against the written guidelines and the brand visual — *not* a production codebase. If the engineering team has a real React Native / Flutter implementation, please attach it so this system can be aligned pixel-for-pixel.

---

## Content fundamentals

The voice is described in the brand book as: *"دلنجاتُو بتكلم الناس زي صاحب شاطر — مش شركة، مش روبوت."* — Delngato talks to people like a smart friend: not a company, not a robot.

- **Primary language: Egyptian colloquial Arabic** (عامية مصرية) in UX. Modern Standard Arabic (فصحى) only in legal/terms copy. English is a **toggle**, never the default.
- **Casing.** Arabic does not have case. For Latin in product UI, use **sentence case** ("Order delivered"). The Latin wordmark `DELNGATO` is the *only* place where ALL CAPS is correct.
- **Pronoun.** The product addresses the user directly with **انت** (informal "you"). In Latin contexts, "you" / "your". Never "we recommend that the user…".
- **First person plural** ("بنحلها", "we're fixing it") is used sparingly when the product takes responsibility for something (errors, recovery). Otherwise the product stays in the background.
- **Voice principles** (from the brand book): واضح (clear) · واثق (confident) · بشري (human) · محلي (local) · مختصر (brief).
- **Brevity.** Aim for fewest words possible. The brand book's hard rule: *"الوقت محترم — أقل كلمات وأكتر معنى."* (Time is respected — fewest words, most meaning.) Avoid "ممكن" / "يمكن" hedges; commit.
- **Punctuation.** A maximum of **one exclamation mark per screen**. Periods on push notifications and confirmations. Avoid ellipsis-as-anticipation.
- **Numbers.** Arabic-Indic digits (٠١٢٣٤٥٦٧٨٩) for in-product times/quantities; Western Arabic (0123456789) in technical contexts (order IDs, codes).
- **Emoji.** **Not in UI copy.** Permitted only in marketing/social posts. Never as iconography in product.
- **Names.** Local shop names appear as written by the shop ("سوبر ماركت أبو حسن"), not normalized.

### Copy examples (lifted from the brand book)

| Context | Copy |
|---|---|
| Onboarding | `دلنجاتُو — اطلب من محلات الدلنجات وادّفع من الأبلكيشن.` |
| Order confirmed | `تم استلام طلبك. بيتجهزلك دلوقتي.` |
| Out for delivery | `طلبك في الطريق — ٧ دقايق تقريباً.` |
| Order delivered | `تم التوصيل. شكراً لاستخدامك دلنجاتُو.` |
| Error | `في مشكلة صغيرة. بنحلها. جرب تاني.` |
| Empty cart | `السلة فاضية. ابدأ تطلب من هنا.` |
| Push | `طلبك وصل! افتح الأبلكيشن تأكد.` |
| Tagline | `اطلب من محلات الدلنجات — تلاقي طلبك عندك في دقايق.` |

### Anti-patterns (do not write)

- ❌ "هنحاول نوصّل بأسرع وقت ممكن إن شاء الله" — hedged, long, evasive.
- ❌ "Welcome to Delngato! 🎉 We're so excited to have you here!" — exclamatory, English-default, emoji.
- ❌ "An error occurred. Please try again later." — apologetic-corporate, vague.
- ✅ Instead: `في مشكلة صغيرة. بنحلها. جرب تاني.` — owns it, brief, action.

---

## Visual foundations

The product looks premium **because of execution**, not because it uses luxury signifiers. The vocabulary is deliberately small.

### Color
Five tokens carry the whole system. Usage ratio (per brand book): **Canvas 60% · Ink 25% · Olive 10% · Gold 5%.**

| Token | Hex | Role |
|---|---|---|
| Deep Olive | `#1F4A3D` | Primary brand — headers, CTAs, key UI |
| Warm Canvas | `#FAF8F3` | The default surface. **Never pure white.** |
| Warm Gold | `#E8B14F` | Accent only — pressed states, pending badges, offer banners |
| Ink | `#0F1A17` | Primary text; near-black with a green undertone |
| Ink Light | `#4A5C57` | Secondary text |

Hard rules (from brand book):
- Gold is **never** a background — it's an accent surface only.
- Olive text on gold **never** ships (contrast fails).
- White is **never** the page background — canvas is.
- Dark mode inverts to deep ink background with canvas text.

### Type
- **Arabic (primary script):** `IBM Plex Sans Arabic` — weights 100–700. Used for *everything* in product UI, including Latin runs inside Arabic strings.
- **Latin display:** `Tienne` — used only for the Latin half of the wordmark (`DELNGATO`) and rare hero moments. **Not** for body copy.
- **Mono:** `IBM Plex Mono` (planned — CDN fallback for now) — order numbers, codes, technical strings only.

> **Type substitution flag.** The brand book names **Inter** as the Latin face. The uploaded font files are **Tienne** (a serif), and the supplied logo confirms Tienne is the Latin display face for the wordmark. We have implemented Tienne for display + wordmark and use IBM Plex Sans Arabic's Latin fallback for body. **If Inter is the intended Latin body face, please upload Inter and we will swap.**

Scale: Display 48–64 · H1 32 · H2 24 · H3 18 · Body 16 · Caption 13 · Micro 11. Line-height 1.2 for headlines, 1.5 for body. Never stretch or condense either typeface.

### Spacing & shape
- **4px base unit.** Tokens: 4 / 8 / 16 / 32 / 64 (XS · SM · MD · LG · XL).
- **Radii.** Buttons 12px · Cards 12px · Inputs 8px · Badges 100px (full pill) · App icon 22% (Apple/Google standard).
- **Tap targets.** Minimum 44×44pt on mobile. No exceptions.

### Backgrounds & surfaces
- **Default surface is `--canvas` (#FAF8F3)** — warm, slightly off-white. Cards may sit on canvas or on `--bg-elevated` (#FFFFFF) when they need a touch more separation in a list.
- **No gradients.** None. (See Five Laws — "scalable simplicity".)
- **No background images** behind UI. Imagery is *content*, not decoration. Photography appears as product hero shots inside cards.
- **No textures, no grain, no patterns.** The brand actively avoids "folkloric or nostalgic" treatments.
- **Full-bleed photography** is reserved for marketing — never product UI.

### Shadows
Subtle and warm; tinted with the ink color so they don't read as cold grey.
```
--shadow-card  : 0 1px 2px rgba(15,26,23,.04), 0 4px 12px rgba(15,26,23,.04);
--shadow-lift  : 0 2px 4px rgba(15,26,23,.05), 0 12px 28px rgba(15,26,23,.08);
--shadow-press : inset 0 0 0 2px var(--gold);   /* the gold-border pressed state */
```
The brand book is explicit: *"never harsh elevation"*. No 0 24px 64px black/40 shadows.

### Borders
Hairline `1px solid var(--canvas-300)` (#E8E2D2) for dividers between rows. Cards in the strongest treatment carry a faint border *or* shadow, never both. Olive border for secondary buttons (`1.5px`).

### Hover, press, focus
- **Hover (web/tablet):** olive surfaces darken to `--olive-700`. Canvas surfaces shift to `--canvas-200`.
- **Press (the signature state):** primary buttons get a **2px inset gold ring** (`--shadow-press`) and the surface darkens. This is the one place gold appears as an "outline" — it makes confirmation feel deliberate.
- **Focus (keyboard):** 2px gold outline at 2px offset. Same gold, slightly different geometry.
- **Disabled:** 40% opacity, no color shift. Cursor `not-allowed`.

### Motion
- Micro-interactions **150ms**. Transitions **300ms**.
- Easing: entrance `ease-out`, exit `ease-in`. **No springs, no bounces.** Confident and calm.
- Long fades and parallax are explicitly out of scope.

### Layout
- Mobile-first. Safe areas always respected (notch, home indicator).
- Bottom nav for primary destinations; thumb-reachable.
- RTL is the *default* layout direction. Icons that imply direction (chevrons, arrows, back) mirror in RTL.
- No fixed headers that cover content. Sticky headers compress on scroll instead.

### Imagery vibe
- **Warm**, natural daylight. Soft shadows. Canvas-toned backdrops.
- **Product as hero** — no people in product photos.
- **Authentic local atmosphere** — actual El-Delngat shops and SKUs, not stock photography.
- **No lifestyle photography** with models, no "delivery app" clichés (helmets, mopeds, shouting riders).
- B&W photography is out of brand. So is high-saturation studio work.

### Use of transparency & blur
Used minimally. The only sanctioned uses:
1. The **bottom tab bar** carries a 10% canvas overlay with 24px backdrop blur on iOS to feel native.
2. **Sheet modals** dim the underlying screen with `rgba(15, 26, 23, 0.48)` and 0 blur.

No frosted-glass cards. No translucent buttons. No "glassmorphism".

---

## Iconography

See `ICONOGRAPHY` section below for the full rule set. Summary:

- **Style:** outline icons, **2px stroke**, square caps and joins. Olive (`#1F4A3D`) or Ink (`#0F1A17`) — no other colors.
- **Sizes:** 24×24 standard, 20×20 compact, 32×32 prominent. 24px grid with 2px inner padding.
- **RTL:** directional icons (arrows, chevrons, back) mirror automatically.
- **No emoji** in product UI. Period.
- **No multi-color** or filled icons.

### Icon source

The brand book does not name an icon set, and no SVGs were supplied. We use **[Lucide](https://lucide.dev/)** (24px, 2px stroke, MIT licensed) as the working set — its visual language exactly matches the brand specification (outline, 2px, square joins). It is loaded via CDN in the UI kit:

```html
<script src="https://unpkg.com/lucide@latest"></script>
```

**Flag:** if the team has a curated icon set (commissioned, or an internal pack), please upload and we will swap. Lucide is a high-fidelity stand-in, not the canonical pack.

### Logo

`assets/logo-full.png` — the official wordmark lockup (Arabic over Latin), olive on canvas. Reuse this image rather than re-typesetting the logo. Variants documented in `brand/`:
- Primary — Arabic wordmark only (دلنجاتُو)
- Secondary — Latin wordmark only (DELNGATO)
- Lockup — stacked Arabic + Latin (this file)
- App icon — isolated `د` letterform in olive circle (placeholder until a final master is supplied)
- Reversed — canvas wordmark on olive background

Clear space: ≥ height of the `د` character on every side. No drop shadows, no stretching, no recoloring.

---

## Index

| Path | What's in it |
|---|---|
| `README.md` | This file. Start here. |
| `SKILL.md` | Agent-skill manifest. Read this if you're an AI agent. |
| `colors_and_type.css` | All design tokens (colors, type, spacing, radii, shadow, motion). |
| `fonts/` | IBM Plex Sans Arabic (7 weights) + Tienne (3 weights). |
| `assets/` | Logo (`logo-full.png`), app icon placeholder, any future imagery. |
| `brand/` | Long-form brand voice + the Five Laws + copy examples. |
| `preview/` | Design-system cards rendered for the system browser. |
| `ui_kits/app/` | The Delngato mobile app UI kit — screens + components. |
| `uploads/` | Originals: brand guidelines docx, logo PNG, font TTFs. |

---

## Caveats & open questions

1. **Type substitution** — brand book says *Inter*, but *Tienne* was uploaded and used in the logo. Confirm intent.
2. **No production codebase attached.** The UI kit is a faithful interpretation of the brand book — not a 1:1 of a shipped app.
3. **Iconography is Lucide** until an official set arrives.
4. **App icon master** (the `د`-in-olive-circle) is a placeholder. The brand book describes it but does not supply a master.
5. **IBM Plex Mono** is not bundled — loaded from CDN; please upload if you want it self-hosted.
