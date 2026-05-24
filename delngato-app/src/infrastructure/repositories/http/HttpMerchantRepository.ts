import type { MerchantRepository } from '@/domain/repositories';
import type {
  HoursWeek,
  Merchant,
  PaymentMethodPrefs,
  Store,
  StoreBrand,
  TaxConfig,
  TempCloseInput,
} from '@/domain/types';
import { unimplemented } from './_stub';

export class HttpMerchantRepository implements MerchantRepository {
  constructor(private readonly _api: unknown) { void this._api; }
  me(): Promise<Merchant> { return unimplemented('HttpMerchantRepository.me'); }
  myStore(): Promise<Store> { return unimplemented('HttpMerchantRepository.myStore'); }
  updateStore(_patch: Partial<Store>): Promise<Store> { return unimplemented('HttpMerchantRepository.updateStore'); }
  toggleAcceptingOrders(_a: boolean): Promise<Store> { return unimplemented('HttpMerchantRepository.toggleAcceptingOrders'); }
  setHours(_h: HoursWeek): Promise<Store> { return unimplemented('HttpMerchantRepository.setHours'); }
  setTempClose(_i: TempCloseInput | null): Promise<Store> { return unimplemented('HttpMerchantRepository.setTempClose'); }
  setDeliveryRadius(_km: number): Promise<Store> { return unimplemented('HttpMerchantRepository.setDeliveryRadius'); }
  setPrepTime(_m: number): Promise<Store> { return unimplemented('HttpMerchantRepository.setPrepTime'); }
  setPaymentMethods(_m: PaymentMethodPrefs): Promise<Store> { return unimplemented('HttpMerchantRepository.setPaymentMethods'); }
  setTax(_t: TaxConfig): Promise<Store> { return unimplemented('HttpMerchantRepository.setTax'); }
  setBrand(_b: StoreBrand): Promise<Store> { return unimplemented('HttpMerchantRepository.setBrand'); }
}
