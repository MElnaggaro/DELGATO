/**
 * React provider for the DI container.
 *
 * UI calls `useContainer()` to get strongly-typed access to repositories
 * (typically through a feature hook, not directly). The provider also owns
 * the lifecycle: it starts the realtime client on mount and stops it on
 * unmount, which keeps the in-process mock from leaking timers under HMR.
 */

import { createContext, useContext, useEffect, type ReactNode } from 'react';

import { getContainer, type Container } from './container';

const ContainerContext = createContext<Container | null>(null);

export type ContainerProviderProps = {
  readonly children: ReactNode;
};

export function ContainerProvider({ children }: ContainerProviderProps) {
  const container = getContainer();

  useEffect(() => {
    container.start();
    return () => container.stop();
  }, [container]);

  return <ContainerContext.Provider value={container}>{children}</ContainerContext.Provider>;
}

export function useContainer(): Container {
  const c = useContext(ContainerContext);
  if (!c) throw new Error('useContainer() called outside <ContainerProvider>');
  return c;
}
