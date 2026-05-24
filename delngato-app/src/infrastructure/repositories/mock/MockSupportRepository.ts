import type { SupportRepository } from '@/domain/repositories';
import type { Id, Role, SupportMessage, SupportMessageInput } from '@/domain/types';

import type { LatencyEngine } from '@/infrastructure/seed/LatencyEngine';
import { genId, nowISO } from './_support';

/**
 * Tiny in-memory support thread. Not persisted across reloads — it's
 * conversational scratch only.
 */
export class MockSupportRepository implements SupportRepository {
  private threads: Map<string, SupportMessage[]> = new Map();

  constructor(private readonly latency: LatencyEngine) {}

  async sendMessage(input: SupportMessageInput): Promise<SupportMessage> {
    await this.latency.sleep('write');
    const key = this.key(input.role, input.userId);
    const thread = this.threads.get(key) ?? [];
    const msg: SupportMessage = {
      id: genId('msg'),
      userId: input.userId,
      role: input.role,
      from: 'user',
      text: input.text,
      ts: nowISO(),
    };
    thread.push(msg);
    // Schedule auto-reply
    setTimeout(() => {
      thread.push({
        id: genId('msg'),
        userId: input.userId,
        role: input.role,
        from: 'support',
        text: 'استلمنا رسالتك، هنرد عليك خلال دقايق.',
        ts: nowISO(),
      });
    }, 1600);
    this.threads.set(key, thread);
    return msg;
  }

  async thread(role: Role, userId: Id): Promise<readonly SupportMessage[]> {
    await this.latency.sleep('read');
    return this.threads.get(this.key(role, userId)) ?? [];
  }

  private key(role: Role, userId: Id): string {
    return `${role}:${userId}`;
  }
}
