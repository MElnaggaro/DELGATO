/**
 * useAppState — React hook subscribing to the AppStateMachine singleton.
 *
 * Built on `useSyncExternalStore` so it integrates cleanly with React 19
 * concurrent rendering and tearing safety. Consumers re-render only when the
 * machine transitions to a new state object.
 */

import { useSyncExternalStore } from 'react';

import { getAppState, subscribeAppState, type AppState } from './AppStateMachine';

export function useAppState(): AppState {
  return useSyncExternalStore(subscribeAppState, getAppState, getAppState);
}
