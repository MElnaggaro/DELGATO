/**
 * Infrastructure configuration. Read once at boot.
 *
 * `API_MODE`:
 *   - `'mock'`  → MockXRepository implementations are wired in the container.
 *   - `'http'`  → HttpXRepository implementations are wired (most are stubs in
 *                 Phase 0; activated repo-by-repo per § 17 of the blueprint).
 *
 * Configurable via `EXPO_PUBLIC_API_MODE` env var.
 */

import Constants from 'expo-constants';

export type ApiMode = 'mock' | 'http';

const readEnvApiMode = (): ApiMode => {
  const fromEnv = (
    process.env.EXPO_PUBLIC_API_MODE ??
    (Constants.expoConfig?.extra as { apiMode?: string } | undefined)?.apiMode ??
    ''
  ).toLowerCase();
  return fromEnv === 'http' ? 'http' : 'mock';
};

export type MockLatencyProfile = {
  readonly read: readonly [number, number];
  readonly write: readonly [number, number];
  readonly auth: readonly [number, number];
};

export type InfrastructureConfig = {
  readonly API_MODE: ApiMode;
  readonly API_BASE_URL: string;
  readonly WS_URL: string;
  readonly MOCK_LATENCY: MockLatencyProfile;
  /** 0..1 — chance that a mock mutation throws NetworkError. Default 0. */
  readonly MOCK_FAIL_RATE: number;
  /** 0..1 — chance that MockPaymentRepository.authorize declines. Default 0. */
  readonly MOCK_PAYMENT_FAIL_RATE: number;
};

const readNumber = (envName: string, fallback: number): number => {
  const v = process.env[envName];
  if (!v) return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

export const config: InfrastructureConfig = {
  API_MODE: readEnvApiMode(),
  API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://api.delngato.local',
  WS_URL: process.env.EXPO_PUBLIC_WS_URL ?? 'wss://api.delngato.local/realtime',
  MOCK_LATENCY: {
    read: [80, 200],
    write: [400, 1200],
    auth: [600, 1500],
  },
  MOCK_FAIL_RATE: readNumber('EXPO_PUBLIC_MOCK_FAIL_RATE', 0),
  MOCK_PAYMENT_FAIL_RATE: readNumber('EXPO_PUBLIC_MOCK_PAYMENT_FAIL_RATE', 0),
};
