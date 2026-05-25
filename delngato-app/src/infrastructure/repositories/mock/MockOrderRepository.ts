import type { OrderRepository } from '@/domain/repositories';
import type {
  Id,
  IssueReport,
  Order,
  OrderFilter,
  OrderStatus,
  PlaceOrderInput,
  Role,
  TimelineEntry,
} from '@/domain/types';
import { ConflictError, NotFoundError, ValidationError } from '@/domain/errors';
import { usePlatformStore } from '@/domain/stores/platform';
import {
  selectOrderById,
  selectOrdersByCustomer,
  selectOrdersByStore,
} from '@/domain/selectors';
import type { Unsubscribe } from '@/domain/repositories/common';

import type { LatencyEngine } from '@/infrastructure/seed/LatencyEngine';
import type { MockRealtimeClient } from '@/infrastructure/realtime/MockRealtimeClient';
import { channels } from '@/infrastructure/realtime/channels';
import { bus } from '@/infrastructure/events';
import { bumpAudit, genId, newAudit, nowISO } from './_support';

const TIMER_PER_STATUS: Partial<Record<OrderStatus, number>> = {
  payment_pending: 90, // 90s to capture/hold payment before auto-cancel
  new: 300, // 5 min SLA to accept/reject
  accepted: 600, // 10 min to start preparing
  preparing: 0, // counts up; UI uses Store.prepTimeMin
};

const ALLOWED_NEXT: Record<OrderStatus, ReadonlyArray<OrderStatus>> = {
  payment_pending: ['new', 'cancelled'],
  new: ['accepted', 'rejected', 'cancelled'],
  accepted: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['picked', 'cancelled'],
  picked: ['delivered'],
  delivered: [],
  rejected: [],
  cancelled: [],
};

export class MockOrderRepository implements OrderRepository {
  private tickUnsub: Unsubscribe | null = null;

  constructor(
    private readonly latency: LatencyEngine,
    private readonly realtime: MockRealtimeClient,
  ) {
    this.tickUnsub = this.realtime.registerTickHook(this.tick);
  }

  destroy(): void {
    this.tickUnsub?.();
    this.tickUnsub = null;
  }

  async listForCustomer(customerId: Id, filter?: OrderFilter): Promise<readonly Order[]> {
    await this.latency.sleep('read');
    return selectOrdersByCustomer(usePlatformStore.getState(), customerId, filter);
  }

  async listForStore(storeId: Id, filter?: OrderFilter): Promise<readonly Order[]> {
    await this.latency.sleep('read');
    return selectOrdersByStore(usePlatformStore.getState(), storeId, filter);
  }

  async byId(id: Id): Promise<Order | null> {
    await this.latency.sleep('read');
    return selectOrderById(usePlatformStore.getState(), id);
  }

  async place(input: PlaceOrderInput): Promise<Order> {
    await this.latency.sleep('write');
    if (input.items.length === 0) {
      throw new ValidationError({ items: 'الطلب فاضي' });
    }
    const id = genId('DLN');
    const total =
      input.subtotal + input.deliveryFee + input.tip - input.discount;
    const placedAt = nowISO();
    const order: Order = {
      ...newAudit(),
      id,
      storeId: input.storeId,
      customerId: input.customerId,
      placedAt,
      status: 'new',
      items: input.items,
      subtotal: input.subtotal,
      deliveryFee: input.deliveryFee,
      tip: input.tip,
      discount: input.discount,
      total,
      merchantShare: Math.round(input.subtotal * 0.93),
      payment: input.payment,
      ...(input.paymentRef ? { paymentRef: input.paymentRef } : {}),
      address: input.address,
      distanceKm: input.distanceKm,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      ...(input.note ? { note: input.note } : {}),
      timerSec: TIMER_PER_STATUS.new ?? 0,
      timeline: [{ ts: placedAt, status: 'new', byRole: 'customer' }],
    };
    usePlatformStore.getState().applyOrder(order);
    bus.emit({ type: 'order.placed', orderId: id, storeId: input.storeId, customerId: input.customerId });
    return order;
  }

  async accept(id: Id): Promise<Order> {
    await this.latency.sleep('write');
    const next = this.transition(id, 'accepted', 'merchant');
    bus.emit({ type: 'order.accepted', orderId: id });
    return next;
  }

  async reject(id: Id, reason: string): Promise<Order> {
    await this.latency.sleep('write');
    const next = this.transition(id, 'rejected', 'merchant', { rejectionReason: reason });
    bus.emit({ type: 'order.rejected', orderId: id, reason });
    return next;
  }

  async startPreparing(id: Id): Promise<Order> {
    await this.latency.sleep('write');
    const next = this.transition(id, 'preparing', 'merchant');
    bus.emit({ type: 'order.preparing.started', orderId: id });
    return next;
  }

  async markReady(id: Id): Promise<Order> {
    await this.latency.sleep('write');
    const next = this.transition(id, 'ready', 'merchant');
    bus.emit({ type: 'order.ready', orderId: id });
    return next;
  }

  async handover(id: Id, driverId: Id): Promise<Order> {
    await this.latency.sleep('write');
    const next = this.transition(id, 'picked', 'merchant', {
      driverId,
      driverName: 'محمود السيد',
    });
    bus.emit({
      type: 'order.handed-over',
      orderId: id,
      driverId,
      driverName: next.driverName ?? 'الكابتن',
    });
    return next;
  }

  async cancel(id: Id, reason: string, byRole: Role): Promise<Order> {
    await this.latency.sleep('write');
    const next = this.transition(id, 'cancelled', byRole, { cancellationReason: reason });
    bus.emit({ type: 'order.cancelled', orderId: id, reason, byRole });
    return next;
  }

  async reportIssue(id: Id, payload: IssueReport): Promise<void> {
    await this.latency.sleep('write');
    this.require(id); // ensure exists
    bus.emit({
      type: 'order.issue-reported',
      orderId: id,
      category: payload.category,
      description: payload.description,
    });
  }

  subscribeForStore(storeId: Id, onChange: (orders: readonly Order[]) => void): Unsubscribe {
    const stopStore = usePlatformStore.subscribe(
      (s) => s.orders,
      () => onChange(selectOrdersByStore(usePlatformStore.getState(), storeId)),
      { fireImmediately: true },
    );
    const stopChannel = this.realtime.subscribe(channels.ordersByStore(storeId), () => {
      onChange(selectOrdersByStore(usePlatformStore.getState(), storeId));
    });
    return () => {
      stopStore();
      stopChannel();
    };
  }

  subscribeForCustomer(customerId: Id, onChange: (orders: readonly Order[]) => void): Unsubscribe {
    const stopStore = usePlatformStore.subscribe(
      (s) => s.orders,
      () => onChange(selectOrdersByCustomer(usePlatformStore.getState(), customerId)),
      { fireImmediately: true },
    );
    const stopChannel = this.realtime.subscribe(channels.ordersByCustomer(customerId), () => {
      onChange(selectOrdersByCustomer(usePlatformStore.getState(), customerId));
    });
    return () => {
      stopStore();
      stopChannel();
    };
  }

  // -------- internals --------

  private require(id: Id): Order {
    const o = selectOrderById(usePlatformStore.getState(), id);
    if (!o) throw new NotFoundError('Order', id);
    return o;
  }

  private transition(
    id: Id,
    to: OrderStatus,
    byRole: Role | 'system',
    extras: Partial<Order> = {},
  ): Order {
    const prev = this.require(id);
    if (!ALLOWED_NEXT[prev.status].includes(to)) {
      throw new ConflictError(
        'invalid-status-transition',
        `Cannot transition from ${prev.status} to ${to}`,
      );
    }
    const ts = nowISO();
    const entry: TimelineEntry = { ts, status: to, byRole };
    const next: Order = {
      ...prev,
      ...extras,
      status: to,
      timerSec: TIMER_PER_STATUS[to] ?? 0,
      timeline: [...prev.timeline, entry],
      ...bumpAudit(prev),
    };
    usePlatformStore.getState().applyOrder(next);
    return next;
  }

  private tick = (): void => {
    const state = usePlatformStore.getState();
    for (const o of Object.values(state.orders)) {
      if (
        o.status === 'payment_pending' ||
        o.status === 'new' ||
        o.status === 'accepted' ||
        o.status === 'preparing'
      ) {
        if (o.timerSec > 0) {
          const next: Order = { ...o, timerSec: o.timerSec - 1, ...bumpAudit(o) };
          state.applyOrder(next);
        } else if (o.status === 'new') {
          // SLA expired — auto-reject.
          const next = this.transition(o.id, 'rejected', 'system', {
            rejectionReason: 'انتهت مهلة الرد',
          });
          bus.emit({ type: 'order.rejected', orderId: o.id, reason: 'انتهت مهلة الرد' });
          void next;
        } else if (o.status === 'payment_pending') {
          // Payment hold expired — cancel and release.
          const next = this.transition(o.id, 'cancelled', 'system', {
            cancellationReason: 'انتهت مهلة الدفع',
          });
          bus.emit({
            type: 'order.cancelled',
            orderId: o.id,
            reason: 'انتهت مهلة الدفع',
            byRole: 'system',
          });
          void next;
        }
      }
    }
  };
}
