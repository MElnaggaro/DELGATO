/**
 * Delngato design tokens — single source of truth.
 * Mirrors design/design-system/colors_and_type.css.
 *
 * Usage ratio (brand book): Canvas 60% · Ink 25% · Olive 10% · Gold 5%.
 * Five Laws: Arabic first, Clarity over cleverness, Premium feel / accessible price,
 * One city first, Trust earned by working.
 */

export const colors = {
  olive: '#1F4A3D',
  olive700: '#173629',
  olive900: '#0F231B',

  canvas: '#FAF8F3',
  canvas200: '#F2EEE3',
  canvas300: '#E8E2D2',

  gold: '#E8B14F',
  gold600: '#C9933A',

  ink: '#0F1A17',
  inkLight: '#4A5C57',
  inkMute: '#8A9994',

  statusActive: '#1F4A3D',
  statusPending: '#E8B14F',
  statusIssue: '#C53B2C',

  bgElevated: '#FFFFFF',

  // Press-state inset (handled with borders, not box-shadow, in RN).
  goldRingInset: '#E8B14F',
} as const;

export const fonts = {
  arabic: 'IBMPlexSansArabic-Regular',
  arabicMedium: 'IBMPlexSansArabic-Medium',
  arabicSemiBold: 'IBMPlexSansArabic-SemiBold',
  arabicBold: 'IBMPlexSansArabic-Bold',
  arabicLight: 'IBMPlexSansArabic-Light',
  arabicThin: 'IBMPlexSansArabic-Thin',
  displayRegular: 'Tienne-Regular',
  displayBold: 'Tienne-Bold',
  displayBlack: 'Tienne-Black',
} as const;

export const fontSize = {
  display: 56,
  h1: 32,
  h2: 24,
  h3: 18,
  body: 16,
  caption: 13,
  micro: 11,
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 32,
  xl: 64,
} as const;

export const radius = {
  input: 8,
  button: 12,
  card: 12,
  pill: 100,
  appIcon: '22%' as const,
} as const;

/**
 * Shadows. iOS picks shadowColor/Offset/Opacity/Radius; Android picks elevation.
 * Subtle and warm (tinted with ink), never harsh. Cards carry shadow OR border,
 * never both.
 */
export const shadow = {
  card: {
    shadowColor: '#0F1A17',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  lift: {
    shadowColor: '#0F1A17',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 6,
  },
} as const;

export const motion = {
  dur: {
    micro: 150,
    transition: 300,
    slow: 600,
  },
  ease: {
    // entrance: smooth deceleration
    out: [0.16, 1, 0.3, 1] as const,
    // exit: gentle acceleration into rest
    in: [0.7, 0, 0.84, 0] as const,
  },
} as const;

export type ThemeColors = typeof colors;
export type ThemeFonts = typeof fonts;
export type ThemeSpacing = typeof spacing;
export type ThemeRadius = typeof radius;
