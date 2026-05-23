import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AppBar, Badge, Icon } from '@/shared/ui';
import { colors, fonts, shadow } from '@/shared/theme';
import { safeBack } from '@/shared/utils/nav';
import { useAddressStore } from '@/features/addresses/store';
import type { AddressLabel } from '@/services/api/schemas/address';

const labelText: Record<AddressLabel, string> = {
  home: 'البيت',
  work: 'الشغل',
  other: 'مكان تاني',
};

export default function Addresses() {
  const router = useRouter();
  const list = useAddressStore((s) => s.list);
  const selectedId = useAddressStore((s) => s.selectedId);
  const select = useAddressStore((s) => s.select);

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <AppBar title="عناويني" onBack={() => safeBack('/(tabs)/profile')} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 14, paddingBottom: 24 }}>
        <View style={{ gap: 10 }}>
          {list.map((a) => {
            const isSel = a.id === selectedId;
            return (
              <Pressable
                key={a.id}
                onPress={() => select(a.id)}
              >
                {({ pressed }) => (
                  <View
                    style={{
                      backgroundColor: colors.bgElevated,
                      borderRadius: 12,
                      padding: 14,
                      flexDirection: 'row',
                      gap: 12,
                      alignItems: 'center',
                      borderWidth: 1.5,
                      borderColor: isSel ? colors.olive : 'transparent',
                      opacity: pressed ? 0.94 : 1,
                      ...shadow.card,
                    }}
                  >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: isSel ? colors.olive : 'rgba(31,74,61,0.08)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {a.label === 'home' ? (
                    <Icon.home size={20} color={isSel ? colors.canvas : colors.olive} />
                  ) : a.label === 'work' ? (
                    <Icon.store size={20} color={isSel ? colors.canvas : colors.olive} />
                  ) : (
                    <Icon.pin size={20} color={isSel ? colors.canvas : colors.olive} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={{ fontFamily: fonts.arabicSemiBold, fontSize: 14, color: colors.ink }}>
                      {labelText[a.label]}
                    </Text>
                    {isSel ? <Badge variant="active">الحالي</Badge> : null}
                  </View>
                  <Text style={{ fontFamily: fonts.arabic, fontSize: 13, color: colors.ink, marginTop: 2 }}>
                    {a.street}
                  </Text>
                  {a.detail ? (
                    <Text style={{ fontFamily: fonts.arabic, fontSize: 12, color: colors.inkLight }}>
                      {a.detail}
                    </Text>
                  ) : null}
                </View>
                <Pressable
                  hitSlop={6}
                  onPress={() =>
                    router.push({
                      pathname: '/(onboarding)/address-setup',
                      params: { manual: '1', id: a.id },
                    })
                  }
                  accessibilityLabel="تعديل العنوان"
                  style={{ padding: 6 }}
                >
                  <Icon.edit size={18} color={colors.inkMute} />
                </Pressable>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        <Pressable
          onPress={() => router.push({ pathname: '/(onboarding)/address-setup', params: { manual: '1' } })}
        >
          {({ pressed }) => (
            <View
              style={{
                marginTop: 14,
                borderRadius: 12,
                padding: 16,
                backgroundColor: pressed ? colors.canvas200 : colors.bgElevated,
                borderWidth: 1.5,
                borderColor: colors.canvas300,
                borderStyle: 'dashed',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
          <Icon.plus size={18} color={colors.olive} />
          <Text style={{ fontFamily: fonts.arabicSemiBold, fontSize: 14, color: colors.olive }}>
            ضيف عنوان جديد
          </Text>
            </View>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}
