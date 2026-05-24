import type { AnalyticsRepository } from '@/domain/repositories';
import type {
  BestSeller,
  BusyMatrix,
  DailyPoint,
  DateRange,
  FunnelStages,
  HourlyPoint,
  Id,
  ISODate,
  MerchantAnalytics,
  ReasonBreakdown,
} from '@/domain/types';
import { usePlatformStore } from '@/domain/stores/platform';
import { selectOrdersByStore } from '@/domain/selectors';

const DAYS: BusyMatrix[number]['day'][] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export class MockAnalyticsRepository implements AnalyticsRepository {
  async storeSnapshot(storeId: Id, _range: DateRange): Promise<MerchantAnalytics> {
    const orders = selectOrdersByStore(usePlatformStore.getState(), storeId);
    const delivered = orders.filter((o) => o.status === 'delivered');
    const live = orders.filter((o) =>
      ['new', 'accepted', 'preparing', 'ready', 'picked'].includes(o.status),
    );

    const revenue = delivered.reduce((n, o) => n + o.total, 0);
    const avgTicket = delivered.length === 0 ? 0 : Math.round(revenue / delivered.length);

    return {
      storeId,
      revenueToday: revenue,
      revenueYesterday: Math.round(revenue * 0.85),
      revenueWeek: Math.round(revenue * 6.5),
      ordersToday: delivered.length,
      ordersLive: live.length,
      avgTicket,
      conversion: 12,
      hourly: this.synthHourly(revenue),
    };
  }

  async hourlyRevenue(_storeId: Id, _day: ISODate): Promise<readonly HourlyPoint[]> {
    return this.synthHourly(2000);
  }

  async dailyRevenue(_storeId: Id, range: DateRange): Promise<readonly DailyPoint[]> {
    const from = new Date(range.from);
    const to = new Date(range.to);
    const days: DailyPoint[] = [];
    for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
      days.push({ d: d.toISOString().slice(0, 10), v: 1200 + Math.round(Math.random() * 800) });
    }
    return days;
  }

  async bestSellers(storeId: Id, _range: DateRange): Promise<readonly BestSeller[]> {
    const products = Object.values(usePlatformStore.getState().products).filter(
      (p) => p.storeId === storeId,
    );
    return products
      .slice(0, 5)
      .map((p, i) => ({
        productId: p.id,
        name: p.name,
        sold: 40 - i * 5,
        revenue: (40 - i * 5) * p.price,
        trend: (i % 3 === 0 ? 'up' : i % 3 === 1 ? 'flat' : 'down') as BestSeller['trend'],
      }));
  }

  async busyHours(_storeId: Id, _range: DateRange): Promise<BusyMatrix> {
    return DAYS.map((day) => ({
      day,
      hours: Array.from({ length: 20 }, (_, h) => {
        if (h >= 12 && h <= 14) return 4;
        if (h >= 18 && h <= 20) return 5;
        if (h >= 7 && h <= 9) return 3;
        return Math.floor(Math.random() * 3);
      }),
    }));
  }

  async cancellationReasons(_storeId: Id, _range: DateRange): Promise<ReasonBreakdown> {
    return [
      { reason: 'منتج خلصان', count: 12, pct: 38 },
      { reason: 'بعيد', count: 7, pct: 22 },
      { reason: 'مفيش طاقم', count: 6, pct: 19 },
      { reason: 'مغلق', count: 4, pct: 13 },
      { reason: 'أخرى', count: 3, pct: 9 },
    ];
  }

  async conversionFunnel(_storeId: Id, _range: DateRange): Promise<FunnelStages> {
    return { browse: 1000, product: 540, cart: 220, pay: 145, complete: 120 };
  }

  private synthHourly(scale: number): readonly HourlyPoint[] {
    return Array.from({ length: 24 }, (_, h) => {
      const factor = h >= 18 && h <= 21 ? 0.4 : h >= 12 && h <= 14 ? 0.25 : h < 8 ? 0.02 : 0.1;
      return { h, v: Math.round(scale * factor + Math.random() * 50) };
    });
  }
}
