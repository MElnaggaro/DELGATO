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
import type { RequestContext } from './common';

export interface AnalyticsRepository {
  storeSnapshot(storeId: Id, range: DateRange, ctx?: RequestContext): Promise<MerchantAnalytics>;
  hourlyRevenue(storeId: Id, day: ISODate, ctx?: RequestContext): Promise<readonly HourlyPoint[]>;
  dailyRevenue(storeId: Id, range: DateRange, ctx?: RequestContext): Promise<readonly DailyPoint[]>;
  bestSellers(storeId: Id, range: DateRange, ctx?: RequestContext): Promise<readonly BestSeller[]>;
  busyHours(storeId: Id, range: DateRange, ctx?: RequestContext): Promise<BusyMatrix>;
  cancellationReasons(storeId: Id, range: DateRange, ctx?: RequestContext): Promise<ReasonBreakdown>;
  conversionFunnel(storeId: Id, range: DateRange, ctx?: RequestContext): Promise<FunnelStages>;
}
