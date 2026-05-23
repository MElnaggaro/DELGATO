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
  const { isRtl } = useRtl();
  const current = useSettingsStore((s) => s.language);
  const setLanguage = useSettingsStore((s) => s.setLanguage);

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <AppBar title="اللغة" onBack={() => safeBack('/(tabs)/profile')} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 28, paddingTop: 14 }}>
        <View
          style={{
            backgroundColor: colors.bgElevated,
            borderRadius: 12,
            overflow: 'hidden',
            ...shadow.card,
          }}
        >
          {LANGUAGES.map((lang, i) => {
            const active = current === lang.k;
            return (
              <Pressable
                key={lang.k}
                onPress={() => !lang.disabled && setLanguage(lang.k)}
                disabled={lang.disabled}
                style={({ pressed }) => ({
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  borderBottomWidth: i < LANGUAGES.length - 1 ? 1 : 0,
                  borderBottomColor: colors.canvas300,
                  backgroundColor: pressed ? colors.canvas200 : 'transparent',
                  opacity: lang.disabled ? 0.5 : 1,
                })}
              >
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
                      fontSize: 12,
                      color: colors.inkLight,
                      marginTop: 2,
                      textAlign: isRtl ? 'right' : 'left',
                    }}
                  >
                    {lang.native}
                    {lang.disabled ? ' · قريباً' : ''}
                  </Text>
                </View>
                {active ? <Icon.check size={20} color={colors.olive} /> : null}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
