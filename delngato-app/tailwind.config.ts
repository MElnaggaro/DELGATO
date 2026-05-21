import type { Config } from 'tailwindcss';
import { colors, fonts, fontSize, radius, spacing } from './src/shared/theme/tokens';

const config: Config = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Brand palette — straight from tokens.ts (source of truth).
        olive: {
          DEFAULT: colors.olive,
          700: colors.olive700,
          900: colors.olive900,
        },
        canvas: {
          DEFAULT: colors.canvas,
          200: colors.canvas200,
          300: colors.canvas300,
        },
        gold: {
          DEFAULT: colors.gold,
          600: colors.gold600,
        },
        ink: {
          DEFAULT: colors.ink,
          light: colors.inkLight,
          mute: colors.inkMute,
        },
        status: {
          active: colors.statusActive,
          pending: colors.statusPending,
          issue: colors.statusIssue,
        },
        elevated: colors.bgElevated,
      },
      fontFamily: {
        // The two families that actually ship in the brand. `body` defaults to
        // IBM Plex Sans Arabic — even Latin runs flow through it inside Arabic
        // strings, per brand book. `display` is Tienne for the wordmark only.
        body: [fonts.arabic],
        'body-medium': [fonts.arabicMedium],
        'body-semibold': [fonts.arabicSemiBold],
        'body-bold': [fonts.arabicBold],
        display: [fonts.displayRegular],
        'display-bold': [fonts.displayBold],
        'display-black': [fonts.displayBlack],
      },
      fontSize: {
        display: [`${fontSize.display}px`, { lineHeight: '1.05', letterSpacing: '-0.01em' }],
        h1: [`${fontSize.h1}px`, { lineHeight: '1.2', letterSpacing: '-0.005em' }],
        h2: [`${fontSize.h2}px`, { lineHeight: '1.25' }],
        h3: [`${fontSize.h3}px`, { lineHeight: '1.35' }],
        body: [`${fontSize.body}px`, { lineHeight: '1.5' }],
        caption: [`${fontSize.caption}px`, { lineHeight: '1.45' }],
        micro: [`${fontSize.micro}px`, { lineHeight: '1.3', letterSpacing: '0.02em' }],
      },
      spacing: {
        xs: `${spacing.xs}px`,
        sm: `${spacing.sm}px`,
        md: `${spacing.md}px`,
        lg: `${spacing.lg}px`,
        xl: `${spacing.xl}px`,
      },
      borderRadius: {
        input: `${radius.input}px`,
        button: `${radius.button}px`,
        card: `${radius.card}px`,
        pill: `${radius.pill}px`,
      },
    },
  },
  plugins: [],
};

export default config;
