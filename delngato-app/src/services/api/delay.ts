/**
 * Mock-mode network jitter. Real mobile networks are bursty — fast on Wi-Fi,
 * 300–800ms on 4G in El-Delngat. We approximate so skeletons + loading states
 * are exercised during development.
 */
export function mockDelay(min = 220, max = 580): Promise<void> {
  const ms = Math.round(min + Math.random() * (max - min));
  return new Promise((resolve) => setTimeout(resolve, ms));
}
