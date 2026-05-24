import type { OrderRepository } from '@/domain/repositories';
import type {
  Id,
  IssueReport,
  Order,
  OrderFilter,
  PlaceOrderInput,
  Role,
} from '@/domain/types';
import type { Unsubscribe } from '@/domain/repositories/common';
import { unimplemented } from './_stub';

export class HttpOrderRepository implements OrderRepository {
  constructor(private readonly _api: unknown) { void this._api; }
  listForCustomer(_c: Id, _f?: OrderFilter): Promise<readonly Order[]> { return unimplemented('HttpOrderRepository.listForCustomer'); }
  listForStore(_s: Id, _f?: OrderFilter): Promise<readonly Order[]> { return unimplemented('HttpOrderRepository.listForStore'); }
  byId(_id: Id): Promise<Order | null> { return unimplemented('HttpOrderRepository.byId'); }
  place(_i: PlaceOrderInput): Promise<Order> { return unimplemented('HttpOrderRepository.place'); }
  accept(_id: Id): Promise<Order> { return unimplemented('HttpOrderRepository.accept'); }
  reject(_id: Id, _r: string): Promise<Order> { return unimplemented('HttpOrderRepository.reject'); }
  startPreparing(_id: Id): Promise<Order> { return unimplemented('HttpOrderRepository.startPreparing'); }
  markReady(_id: Id): Promise<Order> { return unimplemented('HttpOrderRepository.markReady'); }
  handover(_id: Id, _d: Id): Promise<Order> { return unimplemented('HttpOrderRepository.handover'); }
  cancel(_id: Id, _r: string, _b: Role): Promise<Order> { return unimplemented('HttpOrderRepository.cancel'); }
  reportIssue(_id: Id, _p: IssueReport): Promise<void> { return unimplemented('HttpOrderRepository.reportIssue'); }
  subscribeForStore(_s: Id, _h: (o: readonly Order[]) => void): Unsubscribe {
    unimplemented('HttpOrderRepository.subscribeForStore');
  }
  subscribeForCustomer(_c: Id, _h: (o: readonly Order[]) => void): Unsubscribe {
    unimplemented('HttpOrderRepository.subscribeForCustomer');
  }
}
