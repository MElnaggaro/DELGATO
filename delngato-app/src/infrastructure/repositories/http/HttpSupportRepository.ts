import type { SupportRepository } from '@/domain/repositories';
import type { Id, Role, SupportMessage, SupportMessageInput } from '@/domain/types';
import { unimplemented } from './_stub';

export class HttpSupportRepository implements SupportRepository {
  constructor(private readonly _api: unknown) { void this._api; }
  sendMessage(_i: SupportMessageInput): Promise<SupportMessage> { return unimplemented('HttpSupportRepository.sendMessage'); }
  thread(_r: Role, _u: Id): Promise<readonly SupportMessage[]> { return unimplemented('HttpSupportRepository.thread'); }
}
