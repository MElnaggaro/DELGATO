const expo = require('eslint-config-expo/flat');

/**
 * Boundary rules enforce the hexagonal architecture from the blueprint:
 *
 *   domain          → pure TS, no react/expo/infrastructure
 *   infrastructure  → may import domain, but not features/app
 *   features        → may import domain + infrastructure (container only)
 *   app             → may import features + shared; not domain/infrastructure
 *
 * Plus: only infrastructure may call bus.emit(...) — UI subscribes.
 * This rule is enforced as a forbidden import pattern (bus is exported from
 * '@/infrastructure/events'; reading it from anywhere outside
 * `src/infrastructure/**` is blocked).
 */

const DOMAIN_FORBIDDEN_PATTERNS = [
  { group: ['react', 'react-native', 'expo*', 'expo-*', '@expo/*'], message: 'domain/ must remain pure TS — no React or Expo imports.' },
  { group: ['@/infrastructure/*', '@/features/*', '@/shared/*', '@/services/*', '@/app/*'], message: 'domain/ may not import from infrastructure, features, shared, services, or app.' },
  { group: ['axios', '@react-native-async-storage/*', 'zustand/middleware'], message: 'domain/ may not depend on transport, storage, or middleware.' },
];

const INFRASTRUCTURE_FORBIDDEN_PATTERNS = [
  { group: ['@/features/*', '@/app/*'], message: 'infrastructure/ may not import from features or app.' },
];

const FEATURES_FORBIDDEN_PATTERNS = [
  {
    group: ['@/infrastructure/repositories/mock/*', '@/infrastructure/repositories/http/*'],
    message: 'features/ must access repositories through the container, never directly.',
  },
  {
    group: ['@/app/*'],
    message: 'features/ may not import from app/.',
  },
];

const APP_FORBIDDEN_PATTERNS = [
  {
    group: ['@/infrastructure/repositories/mock/*', '@/infrastructure/repositories/http/*'],
    message: 'app/ must access repositories through feature hooks.',
  },
  {
    group: ['@/domain/stores/*'],
    message: 'app/ must read state through selectors / feature hooks, not raw stores.',
  },
];

const EVENT_BUS_RULE = {
  group: ['@/infrastructure/events'],
  importNames: ['bus'],
  message: 'bus.emit(...) is restricted to src/infrastructure/**. UI subscribes via hooks.',
};

module.exports = [
  ...expo,
  {
    ignores: ['node_modules/**', '.expo/**', 'dist/**', 'web-build/**', 'scripts/**'],
  },

  // Domain boundary
  {
    files: ['src/domain/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: DOMAIN_FORBIDDEN_PATTERNS },
      ],
    },
  },

  // Infrastructure boundary
  {
    files: ['src/infrastructure/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: INFRASTRUCTURE_FORBIDDEN_PATTERNS },
      ],
    },
  },

  // Features boundary — and bus.emit ban
  {
    files: ['src/features/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: FEATURES_FORBIDDEN_PATTERNS,
          paths: [EVENT_BUS_RULE],
        },
      ],
    },
  },

  // App boundary — and bus.emit ban
  {
    files: ['app/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: APP_FORBIDDEN_PATTERNS,
          paths: [EVENT_BUS_RULE],
        },
      ],
    },
  },

  // Shared UI boundary — also forbidden from emitting
  {
    files: ['src/shared/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [EVENT_BUS_RULE],
          patterns: [
            { group: ['@/app/*', '@/features/*'], message: 'shared/ may not depend on app or features.' },
          ],
        },
      ],
    },
  },
];
