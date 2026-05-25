/**
 * Merchant KYC pending screen.
 *
 * Reached when `user.merchant.kycStatus === 'pending'`. The merchant cannot
 * accept orders or toggle their store live until KYC clears, so we lock the
 * shell behind this informational page.
 */

import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ShieldCheck } from 'lucide-react-native';

import { Button } from '@/shared/ui';
import { FadeUp } from '@/shared/motion';
import { colors, fonts } from '@/shared/theme';

export default function KycPending() {
  const router = useRouter();


  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
        <View style={{ flex: 1, padding: 28, justifyContent: 'space-between' }}>
          <View />
          <FadeUp style={{ alignItems: 'center', gap: 18 }}>
            <View
              style={{
                width: 96,
                height: 96,
                borderRadius: 100,
                backgroundColor: 'rgba(232,177,79,0.18)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldCheck size={42} color={colors.statusPendingText} />
            </View>
            <Text
              style={{
                fontFamily: fonts.arabicBold,
                fontSize: 24,
                color: colors.ink,
                textAlign: 'center',
              }}
            >
              توثيق المحل قيد المراجعة
            </Text>
            <Text
              style={{
                fontFamily: fonts.arabic,
                fontSize: 14,
                color: colors.inkLight,
                textAlign: 'center',
                lineHeight: 22,
                maxWidth: 320,
              }}
            >
              فريقنا بيراجع بيانات وأوراق المحل. الموضوع بياخد ساعات قليلة في
              العادي. هنبعتلك إشعار أول ما الحساب يبقى جاهز.
            </Text>
          </FadeUp>

          <View style={{ gap: 10 }}>
            <Button
              variant="secondary"
              full
              onPress={() => router.replace('/(onboarding)/welcome')}
            >
              ارجع للبداية
            </Button>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
