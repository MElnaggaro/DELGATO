import type {
  PromotionFilter,
  PromotionRepository,
  UpsertPromotionInput,
} from '@/domain/repositories';
import type { Cart, Id, Money, Promotion, PromoValidation } from '@/domain/types';
import { NotFoundError, ValidationError } from '@/domain/errors';
import { usePlatformStore } from '@/domain/stores/platform';
import {
  selectPromotionById,
  selectPromotionByCode,
  selectPromotionsByStore,
} from '@/domain/selectors';

import type { LatencyEngine } from '@/infrastructure/seed/LatencyEngine';
import { bus } from '@/infrastructure/events';
import { bumpAudit, genId, newAudit, nowISO } from './_support';

function statusFor(p: Pick<Promotion, 'startsAt' | 'endsAt' | 'status'>): Promotion['status'] {
  const now = nowISO();
  if (p.status === 'paused' || p.status === 'ended') return p.status;
  if (now < p.startsAt) return 'scheduled';
  if (now > p.endsAt) return 'ended';
  return 'active';
}

export class MockPromotionRepository implements PromotionRepository {
  constructor(private readonly latency: LatencyEngine) {}

  async list(filter?: PromotionFilter): Promise<readonly Promotion[]> {
    await this.latency.sleep('read');
    const all = Object.values(usePlatformStore.getState().promotions);
    return filter?.status ? all.filter((p) => filter.status!.includes(p.status)) : all;
  }

  async byCode(code: string): Promise<Promotion | null> {
    await this.latency.sleep('read');
    return selectPromotionByCode(usePlatformStore.getState(), code);
  }

  async byStore(storeId: Id): Promise<readonly Promotion[]> {
    await this.latency.sleep('read');
    return selectPromotionsByStore(usePlatformStore.getState(), storeId);
  }

  async upsert(input: UpsertPromotionInput): Promise<Promotion> {
    await this.latency.sleep('write');
    if (input.title.trim().length < 3) {
      throw new ValidationError({ title: 'العنوان لازم ٣ حروف على الأقل' });
    }
    if (input.code.trim().length < 3) {
      throw new ValidationError({ code: 'الكود لازم ٣ حروف على الأقل' });
    }
    if (input.value <= 0 && input.kind !== 'bogo' && input.kind !== 'combo') {
      throw new ValidationError({ value: 'القيمة لازم أكبر من صفر' });
    }
    const state = usePlatformStore.getState();
    const prev = input.id ? selectPromotionById(state, input.id) : null;

    if (prev) {
      const next: Promotion = {
        ...prev,
        code: input.code.toUpperCase(),
        kind: input.kind,
        value: input.value,
        title: input.title,
        sub: input.sub,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        ...(input.cap !== undefined ? { cap: input.cap } : {}),
        status: statusFor({ startsAt: input.startsAt, endsAt: input.endsAt, status: prev.status }),
        ...bumpAudit(prev),
      };
      state.applyPromotion(next);
      bus.emit({ type: 'promotion.updated', promoId: next.id });
      return next;
    }

    const id = genId('promo');
    const created: Promotion = {
      ...newAudit(),
      id,
      storeId: input.storeId,
      code: input.code.toUpperCase(),
      kind: input.kind,
      value: input.value,
      title: input.title,
      sub: input.sub,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      ...(input.cap !== undefined ? { cap: input.cap } : {}),
      uses: 0,
      status: statusFor({ startsAt: input.startsAt, endsAt: input.endsAt, status: 'draft' }),
    };
    state.applyPromotion(created);
    bus.emit({ type: 'promotion.created', promoId: id, storeId: input.storeId });
    if (created.status === 'active') bus.emit({ type: 'promotion.activated', promoId: id });
    return created;
  }

  async toggle(id: Id, active: boolean): Promise<Promotion> {
    await this.latency.sleep('write');
    const prev = this.require(id);
    const next: Promotion = {
      ...prev,
      status: active ? 'active' : 'paused',
      ...bumpAudit(prev),
    };
    usePlatformStore.getState().applyPromotion(next);
    bus.emit({ type: active ? 'promotion.activated' : 'promotion.paused', promoId: id });
    return next;
  }

  async delete(id: Id): Promise<void> {
    await this.latency.sleep('write');
    this.require(id);
    usePlatformStore.getState().remove('promotion', id);
    bus.emit({ type: 'promotion.ended', promoId: id });
  }

  async validate(
    code: string,
    ctx: { readonly cart: Cart; readonly storeId: Id },
  ): Promise<PromoValidation> {
    await this.latency.sleep('read');
    const promo = selectPromotionByCode(usePlatformStore.getState(), code);
    if (!promo) return { ok: false, reason: 'not-found' };
    if (promo.storeId !== ctx.storeId) return { ok: false, reason: 'wrong-store' };
    const now = nowISO();
    if (now < promo.startsAt) return { ok: false, reason: 'not-started' };
    if (now > promo.endsAt) return { ok: false, reason: 'expired' };
    if (promo.status === 'paused') return { ok: false, reason: 'paused' };
    if (promo.cap !== undefined && promo.uses >= promo.cap) return { ok: false, reason: 'cap-reached' };

    const subtotal = ctx.cart.items.reduce((n, i) => n + i.capturedPrice * i.qty, 0);
    let discount: Money = 0;
    if (promo.kind === 'percent') discount = Math.round((subtotal * promo.value) / 100);
    else if (promo.kind === 'flat') discount = Math.min(subtotal, promo.value);
    return { ok: true, promo, discount };
  }

  private require(id: Id): Promotion {
    const p = selectPromotionById(usePlatformStore.getState(), id);
    if (!p) throw new NotFoundError('Promotion', id);
    return p;
  }
}
