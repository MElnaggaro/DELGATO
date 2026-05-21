/**
 * API runtime config. Read once at boot from EXPO_PUBLIC_* env so the values
 * are inlined into the JS bundle and don't require a native rebuild to change.
 */

export type ApiMode = 'mock' | 'http';

const rawMode = process.env.EXPO_PUBLIC_API_MODE;

export const API_MODE: ApiMode = rawMode === 'http' ? 'http' : 'mock';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://api.delngato.app';
