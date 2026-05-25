/**
 * Session-expired modal.
 *
 * Shown when the axios interceptor or a background refresh detects an
 * expired session. Blocks the current screen, offers a single CTA into the
 * phone-OTP re-auth flow. After successful re-auth the resolver returns
 * the user to where they were (via `returnTo` on the SESSION_EXPIRED state).
 *
 * Phase 9 ships the surface. Wiring the modal to actually appear when the
 * AppState reaches SESSION_EXPIRED is a small follow-up: RouteGuard already
 * has the mapping but expo-router modals are presented via group routes,
 * so we may need a thin `_modals/_layout.tsx` to declare the modal preset.
 */

import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Clock } from 'lucide-react-native';

import { Button } from '@/shared/ui';
import { FadeUp } from '@/shared/motion';
import { colors, fonts } from '@/shared/theme';
import { useAuthStore } from '@/features/auth/store';

export default function SessionExpired() {
  const router = useRouter();
  const signOut = useAuthStore((s) => s.signOut);

  return (
    <View style={{ flex: 1, backgroundColor: 'rgba(15,26,23,0.55)' }}>
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, justifyContent: 'center', padding: 28 }}>
        <View
          style={{
            backgroundColor: colors.canvas,
            borderRadius: 16,
            padding: 28,
            gap: 18,
          }}
        >
          <FadeUp style={{ alignItems: 'center', gap: 12 }}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 100,
                backgroundColor: 'rgba(232,177,79,0.18)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Clock size={28} color={colors.statusPendingText} />
            </View>
            <Text
              style={{
                fontFamily: fonts.arabicBold,
                fontSize: 20,
                color: colors.ink,
                textAlign: 'center',
              }}
            >
              انتهت صلاحية الجلسة
            </Text>
            <Text
              style={{
                fontFamily: fonts.arabic,
                fontSize: 14,
                color: colors.inkLight,
                textAlign: 'center',
                lineHeight: 22,
              }}
            >
              علشان أمان حسابك، لازم تدخل تاني. هترجع لنفس الصفحة بعد التحقق.
            </Text>
          </FadeUp>
          <View style={{ gap: 10 }}>
            <Button
              variant="primary"
              size="lg"
              full
              onPress={async () => {
                await signOut();
              }}
            >
              ادخل تاني
            </Button>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
