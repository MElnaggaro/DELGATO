import { bus } from '@/infrastructure/events';
import { useCartStore } from '@/features/cart/store';
import { useAuthStore } from '@/features/auth/store';

export function installCartSyncHandler(): void {
  // Sync on role switch
  bus.on('role.switched', (event: any) => {
    if (event.to === 'customer') {
      const user = useAuthStore.getState().user;
      if (user) {
        useCartStore.getState().hydrateForUser(user.id).catch(() => {});
      }
    } else {
      useCartStore.getState().clearInMemory();
    }
  });

  // Clear cart when signed out
  bus.on('auth.session-ended', () => {
    useCartStore.getState().clearInMemory();
  });
}
