import { type TextStyle } from 'react-native';

import { fonts, fontSize } from './tokens';

/**
 * Reusable text style presets — extracted directly from the design system.
 *
 * Rules:
 *   - Arabic display uses IBM Plex Arabic Bold 56px / 1.15
 *   - Latin display uses Tienne Bold 56px / 1.05, letter-spacing 0.08em (wordmark only)
 *   - Headings: IBM Plex Arabic, H1=32/700, H2=24/600, H3=18/600
 *   - Body: 16/400/1.5, Caption: 13/400/1.45, Micro: 11/500/1.3 tracked
 *   - Min body on mobile: 14px
 */

export const textStyles = {
  displayAr: {
    fontFamily: fonts.arabicBold,
    fontSize: fontSize.display,
    lineHeight: fontSize.display * 1.15,
    letterSpacing: -0.005 * fontSize.display,
    includeFontPadding: false,
  } satisfies TextStyle,

  displayLatin: {
    fontFamily: fonts.displayBold,
    fontSize: fontSize.display,
    lineHeight: fontSize.display * 1.05,
    letterSpacing: 0.08 * fontSize.display,
    includeFontPadding: false,
  } satisfies TextStyle,

  h1: {
    fontFamily: fonts.arabicBold,
    fontSize: fontSize.h1,
    lineHeight: fontSize.h1 * 1.2,
    letterSpacing: -0.005 * fontSize.h1,
    includeFontPadding: false,
  } satisfies TextStyle,

  h2: {
    fontFamily: fonts.arabicSemiBold,
    fontSize: fontSize.h2,
    lineHeight: fontSize.h2 * 1.25,
    includeFontPadding: false,
  } satisfies TextStyle,

  h3: {
    fontFamily: fonts.arabicSemiBold,
    fontSize: fontSize.h3,
    lineHeight: fontSize.h3 * 1.35,
    includeFontPadding: false,
  } satisfies TextStyle,

  body: {
    fontFamily: fonts.arabic,
    fontSize: fontSize.body,
    lineHeight: fontSize.body * 1.5,
    includeFontPadding: false,
  } satisfies TextStyle,

  caption: {
    fontFamily: fonts.arabic,
    fontSize: fontSize.caption,
    lineHeight: fontSize.caption * 1.45,
    includeFontPadding: false,
  } satisfies TextStyle,

  micro: {
    fontFamily: fonts.arabicMedium,
    fontSize: fontSize.micro,
    lineHeight: fontSize.micro * 1.3,
    letterSpacing: 0.06 * fontSize.micro,
    includeFontPadding: false,
  } satisfies TextStyle,

  /** Button label — SemiBold 16px, no line-height variation. */
  buttonLabel: {
    fontFamily: fonts.arabicSemiBold,
    fontSize: 16,
    includeFontPadding: false,
  } satisfies TextStyle,

  /** Section/label header — micro uppercase treatment. */
  label: {
    fontFamily: fonts.arabicMedium,
    fontSize: fontSize.micro,
    lineHeight: fontSize.micro * 1.3,
    letterSpacing: 0.06 * fontSize.micro,
    includeFontPadding: false,
  } satisfies TextStyle,
} as const;

export type TextStyleKey = keyof typeof textStyles;
