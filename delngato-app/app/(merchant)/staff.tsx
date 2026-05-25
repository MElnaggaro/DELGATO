/**
 * Merchant staff management — list staff members with roles.
 * Phase 9 implementation reading from platform store staff slice.
 */

import { FlatList, Text, View } from 'react-native';

import { AppBar, Button, Card, Chip, Icon } from '@/shared/ui';
import { FadeUp } from '@/shared/motion';
import { colors, fonts } from '@/shared/theme';
import { useRtl } from '@/shared/hooks/useRtl';
import { safeBack } from '@/shared/utils/nav';
import { usePlatformStore } from '@/domain/stores/platform';

const ROLE_LABELS: Record<string, string> = {
  owner: 'مالك',
  manager: 'مدير',
  cashier: 'كاشير',
  staff: 'موظف',
};

export default function MerchantStaff() {
  const { isRtl, flexDirection } = useRtl();

  const staff = usePlatformStore((s) => Object.values(s.staff ?? {}));

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <AppBar title="فريق العمل" onBack={() => safeBack('/(merchant)/(tabs)/settings')} />

      <FlatList
        data={staff}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 8, paddingBottom: 24 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListHeaderComponent={
          <View style={{ marginBottom: 14 }}>
            <Button variant="primary" full onPress={() => {/* Phase 9+: invite staff */}}>
              + إضافة موظف
            </Button>
          </View>
        }
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 40, gap: 8 }}>
            <Icon.user size={28} color={colors.inkMute} />
            <Text style={{ fontFamily: fonts.arabic, fontSize: 14, color: colors.inkLight }}>
              لا يوجد فريق عمل مسجل
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <FadeUp distance={4}>
            <Card padding={14}>
              <View style={{ flexDirection, alignItems: 'center', gap: 12 }}>
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 100,
                    backgroundColor: colors.olive,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontFamily: fonts.arabicBold, fontSize: 18, color: colors.canvas }}>
                    {item.name.charAt(0)}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: fonts.arabicSemiBold,
                      fontSize: 14,
                      color: colors.ink,
                      textAlign: isRtl ? 'right' : 'left',
                    }}
                  >
                    {item.name}
                  </Text>
                  <Text
                    style={{
                      fontFamily: fonts.arabic,
                      fontSize: 12,
                      color: colors.inkLight,
                      marginTop: 2,
                      textAlign: isRtl ? 'right' : 'left',
                    }}
                  >
                    {item.phone ?? '—'}
                  </Text>
                </View>
                <Chip active={item.role === 'owner'}>
                  {ROLE_LABELS[item.role] ?? item.role}
                </Chip>
              </View>
            </Card>
          </FadeUp>
        )}
      />
    </View>
  );
}
