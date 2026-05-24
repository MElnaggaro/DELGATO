import type { Id, Money, TopUpInput, Wallet, WalletTx } from '@/domain/types';
import type { RequestContext } from './common';

export interface WalletRepository {
  forUser(userId: Id, ctx?: RequestContext): Promise<Wallet>;
  history(userId: Id, ctx?: RequestContext): Promise<readonly WalletTx[]>;
  topUp(input: TopUpInput, ctx?: RequestContext): Promise<WalletTx>;
  charge(userId: Id, amount: Money, orderId?: Id, ctx?: RequestContext): Promise<WalletTx>;
}
