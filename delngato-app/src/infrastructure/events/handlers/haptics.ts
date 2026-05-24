import * as Haptics from 'expo-haptics';
import { bus } from '../EventBus';

let installed = false;

export function installHapticHandlers(): void {
  if (installed) return;
  installed = true;

  bus.on('order.placed', () => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  });
  bus.on('order.accepted', () => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  });
  bus.on('order.rejected', () => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  });
  bus.on('order.delivered', () => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  });
  bus.on('role.switched', () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  });
}
