import type {
  CardTokenizedInput,
  PaymentAuth,
  PaymentAuthRef,
  PaymentRepository,
} from '@/domain/repositories';
import type { Id, Money } from '@/domain/types';
import { unimplemented } from './_stub';

export class HttpPaymentRepository implements PaymentRepository {
  constructor(private readonly _api: unknown) { void this._api; }
  authorize(_i: CardTokenizedInput, _a: Money, _r: Id): Promise<PaymentAuth> {
    return unimplemented('HttpPaymentRepository.authorize');
  }
  capture(_r: PaymentAuthRef): Promise<PaymentAuth> {
    return unimplemented('HttpPaymentRepository.capture');
  }
  release(_r: PaymentAuthRef): Promise<void> {
    return unimplemented('HttpPaymentRepository.release');
  }
  refund(_r: PaymentAuthRef, _a: Money): Promise<PaymentAuth> {
    return unimplemented('HttpPaymentRepository.refund');
  }
}
