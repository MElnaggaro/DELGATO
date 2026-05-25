import type { WalletHold, WalletHoldId, WalletRepository } from '@/domain/repositories';
import type { Id, Money, TopUpInput, Wallet, WalletTx } from '@/domain/types';
import { unimplemented } from './_stub';

export class HttpWalletRepository implements WalletRepository {
  constructor(private readonly _api: unknown) { void this._api; }
  forUser(_u: Id): Promise<Wallet> { return unimplemented('HttpWalletRepository.forUser'); }
  history(_u: Id): Promise<readonly WalletTx[]> { return unimplemented('HttpWalletRepository.history'); }
  topUp(_i: TopUpInput): Promise<WalletTx> { return unimplemented('HttpWalletRepository.topUp'); }
  charge(_u: Id, _a: Money, _o?: Id): Promise<WalletTx> { return unimplemented('HttpWalletRepository.charge'); }
  hold(_u: Id, _a: Money, _r?: Id): Promise<WalletHold> { return unimplemented('HttpWalletRepository.hold'); }
  capture(_h: WalletHoldId): Promise<WalletTx> { return unimplemented('HttpWalletRepository.capture'); }
  releaseHold(_h: WalletHoldId): Promise<void> { return unimplemented('HttpWalletRepository.releaseHold'); }
  availableBalance(_u: Id): Promise<Money> { return unimplemented('HttpWalletRepository.availableBalance'); }
}
