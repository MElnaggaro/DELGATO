import { Platform, Pressable, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, fonts } from '@/shared/theme';
import { Icon } from './Icon';

export type TabKey = 'home' | 'search' | 'cart' | 'profile';

type Tab = {
  key: TabKey;
  label: string;
  Icon: (typeof Icon)[keyof typeof Icon];
  badge?: number;
};

type Props = {
  active: TabKey;
  tabs: Tab[];
  onTabPress: (key: TabKey) => void;
};

const Container = Platform.OS === 'ios' ? BlurView : View;

/**
 * Bottom tab bar. iOS gets a 10% canvas overlay + 24px backdrop blur (brand
 * book's sanctioned blur usage). Android falls back to a near-opaque canvas
 * surface — same height, same paddings, no blur (matches "feel native" rule).
 */
export function BottomTabBar({ active, tabs, onTabPress }: Props) {
  return (
    <Container
      // BlurView ignores unknown props; View ignores tint/intensity.
      tint="light"
      intensity={24}
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor:
          Platform.OS === 'ios' ? 'rgba(250,248,243,0.92)' : colors.canvas,
        borderTopWidth: 1,
        borderTopColor: colors.canvas300,
        borderRadius: 18,
      }}
    >
      <SafeAreaView edges={['bottom']}>
        <View
          style={{
            flexDirection: 'row',
            paddingTop: 8,
            paddingHorizontal: 8,
          }}
        >
          {tabs.map((t) => {
            const isActive = t.key === active;
            return (
              <Pressable
                key={t.key}
                onPress={() => onTabPress(t.key)}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
                style={{ flex: 1, alignItems: 'center', paddingVertical: 6, gap: 2 }}
              >
                <View>
                  <t.Icon size={22} color={isActive ? colors.olive : colors.inkLight} />
                  {!!t.badge && t.badge > 0 && (
                    <View
                      style={{
                        position: 'absolute',
                        top: -4,
                        insetInlineStart: -8,
                        backgroundColor: colors.gold,
                        borderRadius: 100,
                        paddingHorizontal: 6,
                        paddingVertical: 1,
                        minWidth: 16,
                        alignItems: 'center',
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: fonts.arabicBold,
                          fontSize: 10,
                          color: colors.ink,
                        }}
                      >
                        {t.badge}
                      </Text>
                    </View>
                  )}
                </View>
                <Text
                  style={{
                    fontFamily: isActive ? fonts.arabicSemiBold : fonts.arabicMedium,
                    fontSize: 11,
                    color: isActive ? colors.olive : colors.inkLight,
                  }}
                >
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </SafeAreaView>
    </Container>
  );
}
