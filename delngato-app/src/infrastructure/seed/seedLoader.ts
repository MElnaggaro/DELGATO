/**
 * Boot-time seed hydration.
 *
 * The platformStore persists itself to AsyncStorage. On the first boot after
 * install, it is empty — seed it from the bundled mock data so the app has
 * the same starting state every developer/QA tester sees.
 *
 * Subsequent boots: AsyncStorage rehydrates the persisted store; the seed
 * loader is a no-op (we never overwrite user-touched state).
 */

import { usePlatformStore } from '@/domain/stores/platform';
import { SEED_BUNDLE } from './seedData';

export async function hydratePlatformSeed(): Promise<void> {
  const state = usePlatformStore.getState();

  const isEmpty =
    Object.keys(state.stores).length === 0 &&
    Object.keys(state.products).length === 0 &&
    Object.keys(state.orders).length === 0;

  if (isEmpty) {
    state.applyBatch({
      stores: SEED_BUNDLE.stores,
      products: SEED_BUNDLE.products,
      categories: SEED_BUNDLE.categories,
      promotions: SEED_BUNDLE.promotions,
      orders: SEED_BUNDLE.orders,
      reviews: SEED_BUNDLE.reviews,
      notifications: SEED_BUNDLE.notifications,
      addresses: SEED_BUNDLE.addresses,
      wallets: SEED_BUNDLE.wallets,
      staff: SEED_BUNDLE.staff,
    });
  }

  state.markHydrated();
}
