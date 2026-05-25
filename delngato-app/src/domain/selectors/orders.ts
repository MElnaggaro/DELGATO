import type { Id, Order, OrderFilter, OrderStatus } from '@/domain/types';
import type { usePlatformStore } from '@/domain/stores/platform';

type State = ReturnType<typeof usePlatformStore.getState>;

const LIVE_STATUSES: ReadonlyArray<OrderStatus> = [
  'payment_pending',
  'new',
  'accepted',
  'preparing',
  'ready',
  'picked',
];
const DONE_STATUSES: ReadonlyArray<OrderStatus> = ['delivered'];
const FAILED_STATUSES: ReadonlyArray<OrderStatus> = ['rejected', 'cancelled'];

export const selectOrderById = (s: State, id: Id): Order | null => s.orders[id] ?? null;

const applyFilter = (orders: readonly Order[], filter?: OrderFilter): readonly Order[] => {
  if (!filter) return orders;
  return orders.filter((o) => {
    if (filter.status && !filter.status.includes(o.status)) return false;
    if (filter.from && o.placedAt < filter.from) return false;
    if (filter.to && o.placedAt > filter.to) return false;
    if (filter.search) {
      const q = filter.search.toLowerCase();
      if (
        !o.id.toLowerCase().includes(q) &&
        !o.customerName.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    return true;
  });
};

export const selectOrdersByCustomer = (
  s: State,
  customerId: Id,
  filter?: OrderFilter,
): readonly Order[] =>
  applyFilter(
    Object.values(s.orders).filter((o) => o.customerId === customerId),
    filter,
  );

export const selectOrdersByStore = (
  s: State,
  storeId: Id,
  filter?: OrderFilter,
): readonly Order[] =>
  applyFilter(
    Object.values(s.orders).filter((o) => o.storeId === storeId),
    filter,
  );

export const selectLiveOrdersByCustomer = (s: State, customerId: Id) =>
  selectOrdersByCustomer(s, customerId, { status: LIVE_STATUSES });

export const selectLiveOrdersByStore = (s: State, storeId: Id) =>
  selectOrdersByStore(s, storeId, { status: LIVE_STATUSES });

export { LIVE_STATUSES, DONE_STATUSES, FAILED_STATUSES };
