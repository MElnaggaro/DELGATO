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
import { unimplemented } from './_stub';

export class HttpAnalyticsRepository implements AnalyticsRepository {
  constructor(private readonly _api: unknown) { void this._api; }
  storeSnapshot(_s: Id, _r: DateRange): Promise<MerchantAnalytics> { return unimplemented('HttpAnalyticsRepository.storeSnapshot'); }
  hourlyRevenue(_s: Id, _d: ISODate): Promise<readonly HourlyPoint[]> { return unimplemented('HttpAnalyticsRepository.hourlyRevenue'); }
  dailyRevenue(_s: Id, _r: DateRange): Promise<readonly DailyPoint[]> { return unimplemented('HttpAnalyticsRepository.dailyRevenue'); }
  bestSellers(_s: Id, _r: DateRange): Promise<readonly BestSeller[]> { return unimplemented('HttpAnalyticsRepository.bestSellers'); }
  busyHours(_s: Id, _r: DateRange): Promise<BusyMatrix> { return unimplemented('HttpAnalyticsRepository.busyHours'); }
  cancellationReasons(_s: Id, _r: DateRange): Promise<ReasonBreakdown> { return unimplemented('HttpAnalyticsRepository.cancellationReasons'); }
  conversionFunnel(_s: Id, _r: DateRange): Promise<FunnelStages> { return unimplemented('HttpAnalyticsRepository.conversionFunnel'); }
}
