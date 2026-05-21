---
name: delngato-design
description: Use this skill to generate well-branded interfaces and assets for Delngato (دلنجاتُو) — the mobile-first ordering app for El-Delngat, Egypt. Contains design guidelines, color and type tokens, fonts, logo and brand assets, and a full mobile-app UI kit for prototyping. Reach for this skill any time you're producing mocks, slides, screens, throwaway prototypes, or production-leaning code that should look and feel like Delngato.
user-invocable: true
---

# Delngato design skill

Read `README.md` first — it covers brand context, content fundamentals, visual foundations, iconography, and the source manifest. Then explore the other files as needed.

If you are producing visual artifacts (slides, mocks, throwaway prototypes, etc.) — **copy assets out** and write static HTML files that the user can view. If you are working in production code, copy what you need (`colors_and_type.css`, the fonts in `fonts/`, the components in `ui_kits/app/`) and use the rules in `README.md` to design with this brand fluently.

## The non-negotiables

1. **Arabic first, RTL by default.** Default `dir="rtl"`. Layout, type, flow, icons all mirror.
2. **Canvas, never white.** `#FAF8F3` is the page background. Pure white is reserved for elevated card surfaces.
3. **Gold is an accent, never a surface.** Use it for pressed states, pending badges, offer accents. Never as a button background unless it's the offer CTA.
4. **No emoji in product UI.** Marketing/social only.
5. **No gradients on chrome.** The brand actively rejects "premium-feeling" visual tricks. Premium feel comes from execution.
6. **Voice:** Egyptian colloquial Arabic. Brief. Confident. No "ممكن"/"يمكن" hedges. Max one exclamation per screen.
7. **Type:** body in **IBM Plex Sans Arabic**; Latin display (logo, hero) in **Tienne**. Both are in `fonts/`.

## When invoked without other guidance

Ask the user what they want to build, ask 3–5 focused questions (audience, surface, language toggle, level of fidelity, variations desired), then act as an expert designer who outputs HTML artifacts — or production code — depending on need.

## File index

| Path | What's in it |
|---|---|
| `README.md` | Brand context · content rules · visual foundations · iconography · caveats |
| `colors_and_type.css` | All design tokens (colors, type, spacing, radii, shadow, motion) |
| `fonts/` | IBM Plex Sans Arabic (7 weights) + Tienne (3 weights) |
| `assets/` | Logo (`logo-full.png`), other brand imagery |
| `brand/voice.md` | Long-form voice + the Five Laws + canonical copy examples |
| `preview/*.html` | Design-system cards (colors, type, spacing, components, brand) |
| `ui_kits/app/` | Mobile-app UI kit — 5 interactive screens + atoms |
| `uploads/` | Original brand guidelines docx, logo PNG, font TTFs |
