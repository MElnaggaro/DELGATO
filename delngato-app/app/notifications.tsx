import { useEffect, useCallback } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppBar, EmptyState, Icon } from '@/shared/ui';
import { colors, fonts } from '@/shared/theme';
import { safeBack } from '@/shared/utils/nav';
import { useAuthStore } from '@/features/auth/store';
import { useNotifications, useMarkAllRead } from '@/features/orders/hooks';
import { usePlatformStore } from '@/domain/stores/platform';
import { DEMO_CUSTOMER } from '@/infrastructure/seed/seedData';
import type { Notification } from '@/domain/types';

export default function Notifications() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const userId = user?.id ?? DEMO_CUSTOMER.id;
  const items = useNotifications(userId);
  const markAllRead = useMarkAllRead(userId);
  const applyBatch = usePlatformStore((s) => s.applyBatch);

  const clearAll = useCallback(() => {
    // Remove all notifications for this user from the platform store
    const remove = usePlatformStore.getState().remove;
    items.forEach((n) => remove('notification', n.id));
  }, [items]);

  useEffect(() => {
    const id = setTimeout(() => markAllRead(), 800);
    return () => clearTimeout(id);
  }, [markAllRead]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <AppBar
        title={t('notifications.title')}
        onBack={() => safeBack('/(tabs)/home')}
        trailing={
          <Pressable onPress={clearAll} hitSlop={6} style={{ padding: 6 }}>
            <Text style={{ fontFamily: fonts.arabicSemiBold, fontSize: 13, color: colors.olive }}>
              مسح الكل
            </Text>
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {items.length === 0 ? (
          <EmptyState
            icon={<Icon.bell size={28} color={colors.olive} />}
            title={t('notifications.empty')}
            body="هنخبرك على طول لما يحصل أي تحديث على طلباتك أو يكون فيه عرض."
          />
        ) : (
          <View style={{ paddingTop: 8 }}>
            {items.map((n) => (
              <NotificationRow key={n.id} n={n} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function NotificationRow({ n }: { n: Notification }) {
  const isGold = n.accent === 'gold';
  const timeLabel = n.ts
    ? new Date(n.ts).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', hour: 'numeric', minute: 'numeric' })
    : '';
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 18,
        paddingVertical: 14,
        alignItems: 'flex-start',
        backgroundColor: n.read ? 'transparent' : 'rgba(232,177,79,0.06)',
        borderBottomWidth: 1,
        borderBottomColor: colors.canvas300,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          backgroundColor: isGold ? 'rgba(232,177,79,0.18)' : 'rgba(31,74,61,0.08)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <NotificationIcon icon={n.icon} color={isGold ? colors.statusPendingText : colors.olive} />
      </View>
      <View style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'baseline',
          }}
        >
          <Text style={{ fontFamily: fonts.arabicSemiBold, fontSize: 14, color: colors.ink, flex: 1 }}>
            {n.title}
          </Text>
          <Text style={{ fontFamily: fonts.arabic, fontSize: 11, color: colors.inkMute }}>
            {timeLabel}
          </Text>
        </View>
        <Text
          style={{
            fontFamily: fonts.arabic,
            fontSize: 13,
            color: colors.inkLight,
            marginTop: 4,
            lineHeight: 22,
          }}
        >
          {n.body}
        </Text>
      </View>
      {!n.read ? (
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: colors.gold,
            marginTop: 8,
          }}
        />
      ) : null}
    </View>
  );
}

function NotificationIcon({ icon, color }: { icon: Notification['icon']; color: string }) {
  if (icon === 'bike') return <Icon.bike size={20} color={color} />;
  if (icon === 'tag') return <Icon.tag size={20} color={color} />;
  if (icon === 'check') return <Icon.check size={20} color={color} />;
  if (icon === 'store') return <Icon.store size={20} color={color} />;
  if (icon === 'package') return <Icon.store size={20} color={color} />;
  if (icon === 'wallet') return <Icon.wallet size={20} color={color} />;
  if (icon === 'star') return <Icon.star size={20} color={color} />;
  if (icon === 'alert') return <Icon.info size={20} color={color} />;
  return <Icon.info size={20} color={color} />;
}
