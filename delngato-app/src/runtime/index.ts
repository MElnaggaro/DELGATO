/**
 * Public surface of the runtime layer.
 *
 * The runtime owns AppState and routing. Screens, features, and infrastructure
 * import from here — never reach into the individual modules directly.
 */

export type { AppEvent, AppState, AppStateTag } from './AppStateMachine';
export {
  dispatchAppEvent,
  getAppState,
  subscribeAppState,
  _resetAppStateForTests,
} from './AppStateMachine';

export type { Route, ResolverContext } from './RoutingResolver';
export { resolve, resolveHydratedState } from './RoutingResolver';

export { useAppState } from './useAppState';
export { RouteGuard } from './RouteGuard';

export { startBootSequence, markHydratingStarted, finishHydration } from './BootSequence';

export type { PendingLink } from './PendingDeepLink';
export {
  push as pushPendingDeepLink,
  peek as peekPendingDeepLink,
  drain as drainPendingDeepLink,
  _clearForTests as _clearPendingDeepLinkForTests,
} from './PendingDeepLink';
