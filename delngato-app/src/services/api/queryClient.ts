import { QueryClient } from '@tanstack/react-query';

/**
 * TanStack Query client tuned for a mobile-network catalog app:
 *   - 30s staleTime keeps repeat home renders cheap.
 *   - Refetch on app foreground (RN-friendly default behavior).
 *   - Don't retry auth failures (let the interceptor sign out instead).
 *   - 24h gcTime so AsyncStorage-persisted cache survives a session restart.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 24 * 60 * 60 * 1_000,
      retry: (failureCount, error: unknown) => {
        const status = (error as { status?: number } | undefined)?.status;
        if (status === 401 || status === 403) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
    },
  },
});
