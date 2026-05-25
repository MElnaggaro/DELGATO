/**
 * Notifications handler.
 *
 * Converts business events into persistent `Notification` rows via
 * `NotificationRepository.create()`. The handler is registered with a
 * container reference so it can reach the repo without coupling to the
 * mock/http impl.
 *
 * The customer/merchant notifications screens read from the platform store
 * (filtered by user + role) — so once this handler creates a row, the
 * inboxes reflect it on next render.
 */

import { bus } from '../EventBus';
import type { Container } from '@/infrastructure/container';
import { DEMO_CUSTOMER, DEMO_MERCHANT_ID, SEED_MERCHANTS } from '@/infrastructure/seed/seedData';

let installed = false;

export function installNotificationHandlers(container: Container): void {
  if (installed) return;
  installed = true;

  // Resolve the merchant userId for the demo store. With real auth, callers
  // will look up the actual owner via session.
  const demoMerchantUserId = SEED_MERCHANTS.find((m) => m.storeId === DEMO_MERCHANT_ID)?.id ?? '';

  bus.on('order.placed', ({ orderId, storeId, customerId }: any) => {
    void container.notificationRepo.create({
      userId: demoMerchantUserId,
      role: 'merchant',
      icon: 'bike',
      title: 'طلب جديد',
      body: `طلب ${orderId} وصلك من العميل`,
      ts: new Date().toISOString(),
      accent: 'olive',
      kind: 'order',
      deepLink: `/merchant/order-detail?id=${orderId}`,
      payload: { orderId, storeId, customerId },
    });
  });

  bus.on('order.accepted', ({ orderId }: any) => {
    void container.notificationRepo.create({
      userId: DEMO_CUSTOMER.id,
      role: 'customer',
      icon: 'check',
      title: 'تم قبول الطلب',
      body: `المحل قبل الطلب ${orderId}`,
      ts: new Date().toISOString(),
      accent: 'olive',
      kind: 'order',
      deepLink: `/order-detail?id=${orderId}`,
    });
  });

  bus.on('order.rejected', ({ orderId, reason }: any) => {
    void container.notificationRepo.create({
      userId: DEMO_CUSTOMER.id,
      role: 'customer',
      icon: 'info',
      title: 'تم رفض الطلب',
      body: `طلبك ${orderId} اترفض: ${reason}`,
      ts: new Date().toISOString(),
      accent: 'issue',
      kind: 'order',
    });
  });

  bus.on('order.ready', ({ orderId }: any) => {
    void container.notificationRepo.create({
      userId: DEMO_CUSTOMER.id,
      role: 'customer',
      icon: 'package',
      title: 'الطلب جاهز',
      body: `الطلب ${orderId} جاهز للاستلام`,
      ts: new Date().toISOString(),
      accent: 'olive',
      kind: 'order',
    });
  });

  bus.on('order.delivered', ({ orderId }: any) => {
    void container.notificationRepo.create({
      userId: DEMO_CUSTOMER.id,
      role: 'customer',
      icon: 'check',
      title: 'تم التوصيل',
      body: `الطلب ${orderId} اتوصل بنجاح. قيّم تجربتك دلوقتي.`,
      ts: new Date().toISOString(),
      accent: 'olive',
      kind: 'order',
    });
  });

  bus.on('review.responded', ({ reviewId }: any) => {
    void container.notificationRepo.create({
      userId: DEMO_CUSTOMER.id,
      role: 'customer',
      icon: 'star',
      title: 'المحل ردّ على تقييمك',
      body: 'افتح تقييمك لقراءة الرد',
      ts: new Date().toISOString(),
      accent: 'gold',
      kind: 'review',
      payload: { reviewId },
    });
  });
}
