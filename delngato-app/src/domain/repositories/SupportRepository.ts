import type { Id, Role, SupportMessage, SupportMessageInput } from '@/domain/types';
import type { RequestContext } from './common';

export interface SupportRepository {
  sendMessage(input: SupportMessageInput, ctx?: RequestContext): Promise<SupportMessage>;
  thread(role: Role, userId: Id, ctx?: RequestContext): Promise<readonly SupportMessage[]>;
}
