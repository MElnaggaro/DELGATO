import type {
  Id,
  IssueReport,
  Order,
  OrderFilter,
  PlaceOrderInput,
  Role,
} from '@/domain/types';
import type { RequestContext, Unsubscribe } from './common';

export interface OrderRepository {
  listForCustomer(
    customerId: Id,
    filter?: OrderFilter,
    ctx?: RequestContext,
  ): Promise<readonly Order[]>;
  listForStore(
    storeId: Id,
    filter?: OrderFilter,
    ctx?: RequestContext,
  ): Promise<readonly Order[]>;
  byId(id: Id, ctx?: RequestContext): Promise<Order | null>;

  place(input: PlaceOrderInput, ctx?: RequestContext): Promise<Order>;
  accept(id: Id, ctx?: RequestContext): Promise<Order>;
  reject(id: Id, reason: string, ctx?: RequestContext): Promise<Order>;
  startPreparing(id: Id, ctx?: RequestContext): Promise<Order>;
  markReady(id: Id, ctx?: RequestContext): Promise<Order>;
  handover(id: Id, driverId: Id, ctx?: RequestContext): Promise<Order>;
  cancel(id: Id, reason: string, byRole: Role, ctx?: RequestContext): Promise<Order>;
  reportIssue(id: Id, payload: IssueReport, ctx?: RequestContext): Promise<void>;

  subscribeForStore(
    storeId: Id,
    onChange: (orders: readonly Order[]) => void,
  ): Unsubscribe;
  subscribeForCustomer(
    customerId: Id,
    onChange: (orders: readonly Order[]) => void,
  ): Unsubscribe;
}
