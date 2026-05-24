import type {
  HoursWeek,
  Merchant,
  PaymentMethodPrefs,
  Store,
  StoreBrand,
  TaxConfig,
  TempCloseInput,
} from '@/domain/types';

export interface MerchantRepository {
  me(): Promise<Merchant>;
  myStore(): Promise<Store>;
  updateStore(patch: Partial<Store>): Promise<Store>;
  toggleAcceptingOrders(accepting: boolean): Promise<Store>;
  setHours(hours: HoursWeek): Promise<Store>;
  setTempClose(input: TempCloseInput | null): Promise<Store>;
  setDeliveryRadius(km: number): Promise<Store>;
  setPrepTime(min: number): Promise<Store>;
  setPaymentMethods(methods: PaymentMethodPrefs): Promise<Store>;
  setTax(input: TaxConfig): Promise<Store>;
  setBrand(brand: StoreBrand): Promise<Store>;
}
