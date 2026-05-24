import type { Id, Money, Percent } from './common';

export type HourlyPoint = {
  readonly h: number; // 0..23
  readonly v: Money;
};

export type DailyPoint = {
  readonly d: string; // ISODate
  readonly v: Money;
};

export type Trend = 'up' | 'down' | 'flat';

export type BestSeller = {
  readonly productId: Id;
  readonly name: string;
  readonly sold: number;
  readonly revenue: Money;
  readonly trend: Trend;
};

export type BusyMatrix = readonly {
  readonly day: 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';
  /** 20 hour buckets; each value 0..5 intensity. */
  readonly hours: readonly number[];
}[];

export type ReasonBreakdown = readonly {
  readonly reason: string;
  readonly count: number;
  readonly pct: Percent;
}[];

export type FunnelStages = {
  readonly browse: number;
  readonly product: number;
  readonly cart: number;
  readonly pay: number;
  readonly complete: number;
};

export type MerchantAnalytics = {
  readonly storeId: Id;
  readonly revenueToday: Money;
  readonly revenueYesterday: Money;
  readonly revenueWeek: Money;
  readonly ordersToday: number;
  readonly ordersLive: number;
  readonly avgTicket: Money;
  readonly conversion: Percent;
  readonly hourly: readonly HourlyPoint[];
};
