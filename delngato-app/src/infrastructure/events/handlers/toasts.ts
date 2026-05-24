/**
 * Toast handler — converts business events into user-visible toasts.
 * Reuses the existing `showToast` helper from `src/shared/ui/toast`.
 */

import { showToast } from '@/shared/ui/toast';
import { bus } from '../EventBus';

let installed = false;

export function installToastHandlers(): void {
  if (installed) return;
  installed = true;

  bus.on('order.placed', () => {
    showToast('تم استلام طلبك');
  });
  bus.on('order.accepted', () => {
    showToast('المحل قبل طلبك');
  });
  bus.on('order.rejected', ({ reason }) => {
    showToast(`المحل رفض الطلب: ${reason}`);
  });
  bus.on('order.preparing.started', () => {
    showToast('بدأ تحضير طلبك');
  });
  bus.on('order.ready', () => {
    showToast('الطلب جاهز للتوصيل');
  });
  bus.on('order.handed-over', ({ driverName }) => {
    showToast(`الكابتن ${driverName} في الطريق`);
  });
  bus.on('order.delivered', () => {
    showToast('تم التوصيل · شكراً');
  });
  bus.on('promotion.activated', () => {
    showToast('العرض اشتغل');
  });
}
