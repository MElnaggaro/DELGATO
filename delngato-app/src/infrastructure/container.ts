/**
 * DI container.
 *
 * Constructed exactly once at app boot. The active `API_MODE` decides which
 * implementation of each repository is wired. Swapping the backend on later
 * is a single-file change here per § 17 of the blueprint.
 *
 * The api client placeholder will be replaced with the existing axios client
 * from `@/services/api` once the HTTP repositories are activated.
 */

import { config } from './config';
import { LatencyEngine } from './seed/LatencyEngine';
import { MockRealtimeClient } from './realtime/MockRealtimeClient';
import { WebSocketRealtimeClient } from './realtime/WebSocketRealtimeClient';
import type { RealtimeClient } from '@/domain/repositories';

import {
  MockAuthRepository,
  MockCustomerRepository,
  MockMerchantRepository,
  MockProductRepository,
  MockOrderRepository,
  MockPromotionRepository,
  MockReviewRepository,
  MockWalletRepository,
  MockNotificationRepository,
  MockAddressRepository,
  MockCategoryRepository,
  MockModifierRepository,
  MockStaffRepository,
  MockPayoutRepository,
  MockAnalyticsRepository,
  MockSupportRepository,
} from './repositories/mock';

import {
  HttpAuthRepository,
  HttpCustomerRepository,
  HttpMerchantRepository,
  HttpProductRepository,
  HttpOrderRepository,
  HttpPromotionRepository,
  HttpReviewRepository,
  HttpWalletRepository,
  HttpNotificationRepository,
  HttpAddressRepository,
  HttpCategoryRepository,
  HttpModifierRepository,
  HttpStaffRepository,
  HttpPayoutRepository,
  HttpAnalyticsRepository,
  HttpSupportRepository,
} from './repositories/http';

import type {
  AddressRepository,
  AnalyticsRepository,
  AuthRepository,
  CategoryRepository,
  CustomerRepository,
  MerchantRepository,
  ModifierRepository,
  NotificationRepository,
  OrderRepository,
  PayoutRepository,
  ProductRepository,
  PromotionRepository,
  ReviewRepository,
  StaffRepository,
  SupportRepository,
  WalletRepository,
} from '@/domain/repositories';

export type Container = {
  readonly realtime: RealtimeClient;
  readonly latency: LatencyEngine;
  readonly authRepo: AuthRepository;
  readonly customerRepo: CustomerRepository;
  readonly merchantRepo: MerchantRepository;
  readonly productRepo: ProductRepository;
  readonly orderRepo: OrderRepository;
  readonly promotionRepo: PromotionRepository;
  readonly reviewRepo: ReviewRepository;
  readonly walletRepo: WalletRepository;
  readonly notificationRepo: NotificationRepository;
  readonly addressRepo: AddressRepository;
  readonly categoryRepo: CategoryRepository;
  readonly modifierRepo: ModifierRepository;
  readonly staffRepo: StaffRepository;
  readonly payoutRepo: PayoutRepository;
  readonly analyticsRepo: AnalyticsRepository;
  readonly supportRepo: SupportRepository;
  /** Lifecycle. Owned by ContainerProvider in dev/HMR safety. */
  readonly start: () => void;
  readonly stop: () => void;
};

let singleton: Container | null = null;

export function getContainer(): Container {
  if (!singleton) singleton = buildContainer();
  return singleton;
}

/** Test-only: tear down the singleton (e.g. between tests). */
export function resetContainer(): void {
  singleton?.stop();
  singleton = null;
}

function buildContainer(): Container {
  const useHttp = config.API_MODE === 'http';
  const latency = new LatencyEngine(config.MOCK_LATENCY, config.MOCK_FAIL_RATE);

  // Realtime
  const mockRealtime = useHttp ? null : new MockRealtimeClient();
  const realtime: RealtimeClient = useHttp
    ? new WebSocketRealtimeClient(config.WS_URL)
    : (mockRealtime as MockRealtimeClient);

  // API client placeholder — Http* repos will be activated incrementally and
  // will accept the existing axios client from @/services/api/client at that
  // time. Phase 0 stubs ignore it.
  const api: unknown = {};

  const c: Container = {
    realtime,
    latency,
    authRepo: useHttp ? new HttpAuthRepository(api) : new MockAuthRepository(latency),
    customerRepo: useHttp ? new HttpCustomerRepository(api) : new MockCustomerRepository(latency),
    merchantRepo: useHttp ? new HttpMerchantRepository(api) : new MockMerchantRepository(latency),
    productRepo: useHttp
      ? new HttpProductRepository(api)
      : new MockProductRepository(latency, mockRealtime!),
    orderRepo: useHttp
      ? new HttpOrderRepository(api)
      : new MockOrderRepository(latency, mockRealtime!),
    promotionRepo: useHttp ? new HttpPromotionRepository(api) : new MockPromotionRepository(latency),
    reviewRepo: useHttp ? new HttpReviewRepository(api) : new MockReviewRepository(latency),
    walletRepo: useHttp ? new HttpWalletRepository(api) : new MockWalletRepository(latency),
    notificationRepo: useHttp
      ? new HttpNotificationRepository(api)
      : new MockNotificationRepository(latency, mockRealtime!),
    addressRepo: useHttp ? new HttpAddressRepository(api) : new MockAddressRepository(latency),
    categoryRepo: useHttp ? new HttpCategoryRepository(api) : new MockCategoryRepository(latency),
    modifierRepo: useHttp ? new HttpModifierRepository(api) : new MockModifierRepository(latency),
    staffRepo: useHttp ? new HttpStaffRepository(api) : new MockStaffRepository(latency),
    payoutRepo: useHttp ? new HttpPayoutRepository(api) : new MockPayoutRepository(latency),
    analyticsRepo: useHttp ? new HttpAnalyticsRepository(api) : new MockAnalyticsRepository(),
    supportRepo: useHttp ? new HttpSupportRepository(api) : new MockSupportRepository(latency),
    start: () => {
      if (mockRealtime) mockRealtime.start();
    },
    stop: () => {
      if (mockRealtime) mockRealtime.stop();
    },
  };
  return c;
}
