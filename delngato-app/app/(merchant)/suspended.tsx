/**
 * Merchant suspended screen.
 *
 * Reached when `user.merchant.suspended === true` (or KYC rejected). The
 * merchant can't take any action until ops resolves it. Provides a contact
 * support CTA and an escape hatch to the customer shell.
 */

import { Linking, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AlertOctagon } from 'lucide-react-native';

import { Button } from '@/shared/ui';
import { FadeUp } from '@/shared/motion';
import { colors, fonts } from '@/shared/theme';

export default function Suspended() {
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
                backgroundColor: 'rgba(197,59,44,0.10)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertOctagon size={42} color={colors.statusIssue} />
            </View>
            <Text
              style={{
                fontFamily: fonts.arabicBold,
                fontSize: 24,
                color: colors.ink,
                textAlign: 'center',
              }}
            >
              تم إيقاف الحساب
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
              حسابك متوقف مؤقتاً. تواصل مع الدعم علشان نراجع الموقف ونرجعك
              تشتغل في أقرب وقت.
            </Text>
          </FadeUp>

          <View style={{ gap: 10 }}>
            <Button
              variant="primary"
              full
              onPress={() => void Linking.openURL('tel:+20221234567')}
            >
              تواصل مع الدعم
            </Button>
            <Button
              variant="ghost"
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
