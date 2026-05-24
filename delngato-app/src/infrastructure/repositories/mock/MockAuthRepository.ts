import {
  setRoleSessionToken,
  clearRoleSessionToken,
  getRoleSessionToken,
} from '@/services/storage';
import { ValidationError } from '@/domain/errors';
import type { AuthRepository } from '@/domain/repositories';
import type { AuthSession, OtpChallenge, RegisterInput, Role } from '@/domain/types';

import type { LatencyEngine } from '@/infrastructure/seed/LatencyEngine';
import { bus } from '@/infrastructure/events';
import { genId, nowISO } from './_support';

export class MockAuthRepository implements AuthRepository {
  private sessions: Partial<Record<Role, AuthSession>> = {};

  constructor(private readonly latency: LatencyEngine) {}

  async requestOtp(input: { phone: string; role: Role }): Promise<OtpChallenge> {
    await this.latency.sleep('auth');
    if (input.phone.length < 8) {
      throw new ValidationError({ phone: 'رقم تليفون غير صالح' });
    }
    return { phone: input.phone, role: input.role, resendInSec: 30 };
  }

  async verifyOtp(input: {
    phone: string;
    code: string;
    role: Role;
  }): Promise<AuthSession> {
    await this.latency.sleep('auth');
    if (input.code.length !== 6) {
      throw new ValidationError({ code: 'الكود لازم يكون ٦ أرقام' });
    }
    const session: AuthSession = {
      role: input.role,
      userId: input.role === 'customer' ? 'customer-001' : 'merchant-owner-abuhassan',
      accessToken: 'mock.' + genId('token'),
      issuedAt: nowISO(),
    };
    this.sessions[input.role] = session;
    await setRoleSessionToken(input.role, session.accessToken);
    bus.emit({ type: 'auth.session-started', role: input.role });
    return session;
  }

  async register(input: RegisterInput): Promise<AuthSession> {
    await this.latency.sleep('auth');
    const session: AuthSession = {
      role: input.role,
      userId: input.role === 'customer' ? 'customer-001' : 'merchant-owner-abuhassan',
      accessToken: 'mock.' + genId('token'),
      issuedAt: nowISO(),
    };
    this.sessions[input.role] = session;
    await setRoleSessionToken(input.role, session.accessToken);
    bus.emit({ type: 'auth.session-started', role: input.role });
    return session;
  }

  async signOut(role: Role): Promise<void> {
    await this.latency.sleep('write');
    delete this.sessions[role];
    await clearRoleSessionToken(role);
    bus.emit({ type: 'auth.session-ended', role });
  }

  async refresh(role: Role): Promise<AuthSession> {
    await this.latency.sleep('auth');
    const existing = this.sessions[role];
    if (!existing) {
      throw new ValidationError({ session: 'لا توجد جلسة نشطة' });
    }
    const refreshed: AuthSession = { ...existing, accessToken: 'mock.' + genId('token'), issuedAt: nowISO() };
    this.sessions[role] = refreshed;
    await setRoleSessionToken(role, refreshed.accessToken);
    return refreshed;
  }

  async currentSession(role: Role): Promise<AuthSession | null> {
    const cached = this.sessions[role];
    if (cached) return cached;
    const token = await getRoleSessionToken(role);
    if (!token) return null;
    const session: AuthSession = {
      role,
      userId: role === 'customer' ? 'customer-001' : 'merchant-owner-abuhassan',
      accessToken: token,
      issuedAt: nowISO(),
    };
    this.sessions[role] = session;
    return session;
  }
}
