import { Pressable, ScrollView, Text, View } from 'react-native';

import { AppBar, Icon } from '@/shared/ui';
import { colors, fonts, shadow } from '@/shared/theme';
import { useRtl } from '@/shared/hooks/useRtl';
import { safeBack } from '@/shared/utils/nav';
import { useSettingsStore } from '@/features/settings';

const LANGUAGES = [
  { k: 'ar' as const, l: 'العربية', native: 'العربية' },
  { k: 'en' as const, l: 'الإنجليزية', native: 'English', disabled: true },
];

export default function Language() {
  const { isRtl, flexDirection } = useRtl();
  const current = useSettingsStore((s) => s.language);
  const setLanguage = useSettingsStore((s) => s.setLanguage);

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <AppBar title="اللغة" onBack={() => safeBack('/(tabs)/profile')} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 28, paddingTop: 14 }}>
        <View
          style={{
            backgroundColor: colors.canvas200,
            borderRadius: 10,
            paddingVertical: 12,
            paddingHorizontal: 14,
            flexDirection,
            gap: 10,
            marginBottom: 14,
          }}
        >
          <Icon.info size={14} color={colors.inkLight} style={{ marginTop: 2 }} />
          <Text
            style={{
              flex: 1,
              fontFamily: fonts.arabic,
              fontSize: 12,
              color: colors.inkLight,
              lineHeight: 18,
              textAlign: isRtl ? 'right' : 'left',
            }}
          >
            دلنجاتُو عربي بشكل أساسي. الإنجليزية في الطريق — هتيجي قريب.
          </Text>
        </View>

        <View style={{ flexDirection: 'column', gap: 8 }}>
          {LANGUAGES.map((lang) => {
            const active = current === lang.k;
            return (
              <Pressable
                key={lang.k}
                onPress={() => !lang.disabled && setLanguage(lang.k)}
                disabled={lang.disabled}
                style={({ pressed }) => ({
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  backgroundColor: colors.canvas,
                  borderRadius: 12,
                  borderWidth: 1.5,
                  borderColor: active ? colors.olive : colors.canvas300,
                  flexDirection,
                  alignItems: 'center',
                  gap: 12,
                  opacity: lang.disabled ? 0.55 : pressed ? 0.8 : 1,
                })}
              >
                <Text style={{ fontSize: 28 }}>{lang.k === 'ar' ? '🇪🇬' : '🇺🇸'}</Text>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: fonts.arabicSemiBold,
                      fontSize: 15,
                      color: colors.ink,
                      textAlign: isRtl ? 'right' : 'left',
                    }}
                  >
                    {lang.l}
                  </Text>
                  <Text
                    style={{
                      fontFamily: fonts.arabic,
                      fontSize: 11,
                      color: colors.inkLight,
                      textAlign: isRtl ? 'right' : 'left',
                    }}
                  >
                    {lang.native}
                  </Text>
                </View>
                {lang.disabled ? (
                  <View
                    style={{
                      backgroundColor: 'rgba(232,177,79,0.18)',
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 100,
                    }}
                  >
                    <Text style={{ fontFamily: fonts.arabicSemiBold, fontSize: 11, color: '#8A6418' }}>
                      قريباً
                    </Text>
                  </View>
                ) : active ? (
                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      borderWidth: 2,
                      borderColor: colors.olive,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: colors.olive }} />
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
