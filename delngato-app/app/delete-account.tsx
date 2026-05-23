import { useState } from 'react';
import { ScrollView, Text, View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import {
  AppBar,
  Button,
  Icon,
  showToast,
} from '@/shared/ui';
import { colors, fonts } from '@/shared/theme';
import { useRtl } from '@/shared/hooks/useRtl';
import { safeBack } from '@/shared/utils/nav';
import { useAuthStore } from '@/features/auth/store';
import { FadeUp } from '@/shared/motion';

export default function DeleteAccount() {
  const router = useRouter();
  const { bottom } = useSafeAreaInsets();
  const { isRtl, flexDirection } = useRtl();
  const signOut = useAuthStore((s) => s.signOut);
  const [reason, setReason] = useState<string | null>(null);

  const REASONS = [
    'مش بستخدم التطبيق',
    'مفيش محلات قريبة',
    'تجربة سيئة',
    'مخاوف خصوصية',
    'سبب تاني',
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <AppBar title="حذف الحساب" onBack={() => safeBack('/(tabs)/profile')} />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 24, paddingTop: 14 }}
      >
        <FadeUp>
          <View style={{ alignItems: 'center', marginBottom: 22 }}>
            <View
              style={{
                width: 88,
                height: 88,
                borderRadius: 100,
                backgroundColor: 'rgba(197,59,44,0.1)',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 18,
              }}
            >
              <Icon.trash size={36} color={colors.statusIssueText} />
            </View>
            <Text style={{ fontFamily: fonts.arabicBold, fontSize: 22, color: colors.ink }}>
              هتمسح حسابك خالص؟
            </Text>
            <Text
              style={{
                fontFamily: fonts.arabic,
                fontSize: 14,
                color: colors.inkLight,
                marginTop: 10,
                lineHeight: 22,
                maxWidth: 320,
                textAlign: 'center',
              }}
            >
              مفيش رجوع. كل بياناتك، طلباتك، عناوينك، نقاطك، ورصيدك في المحفظة هيتمسحوا بشكل نهائي.
            </Text>
          </View>
        </FadeUp>

        <Text
          style={{
            fontSize: 12,
            color: colors.inkMute,
            fontFamily: fonts.arabicSemiBold,
            letterSpacing: 0.4,
            marginBottom: 10,
            textAlign: 'left',
          }}
        >
          هتفقد:
        </Text>
        <View style={{ gap: 8 }}>
          {[
            { label: 'رصيد المحفظة', value: '١٣٨ ج.م', icon: <Icon.wallet size={18} color={colors.statusIssueText} /> },
            { label: 'النقاط المتراكمة', value: '١٬٨٢٠ نقطة', icon: <Icon.star size={18} color={colors.statusIssueText} /> },
            { label: 'تاريخ الطلبات', value: '٥ طلب', icon: <Icon.receipt size={18} color={colors.statusIssueText} /> },
            { label: 'العناوين المحفوظة', value: '٣ عنوان', icon: <Icon.pin size={18} color={colors.statusIssueText} /> },
          ].map((item) => (
            <View
              key={item.label}
              style={{
                backgroundColor: 'rgba(197,59,44,0.05)',
                borderRadius: 10,
                padding: 12,
                flexDirection,
                alignItems: 'center',
                gap: 12,
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: 'rgba(197,59,44,0.1)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {item.icon}
              </View>
              <Text style={{ flex: 1, fontFamily: fonts.arabic, fontSize: 13.5, color: colors.ink, textAlign: 'left' }}>
                {item.label}
              </Text>
              <Text style={{ fontFamily: fonts.arabicBold, fontSize: 13.5, color: colors.statusIssueText }}>
                {item.value}
              </Text>
            </View>
          ))}
        </View>

        <Text
          style={{
            marginTop: 22,
            fontSize: 12,
            color: colors.inkMute,
            fontFamily: fonts.arabicSemiBold,
            letterSpacing: 0.4,
            marginBottom: 10,
            textAlign: 'left',
          }}
        >
          ساعدنا نتحسن — ليه قررت تمسح؟
        </Text>
        <View style={{ flexDirection, flexWrap: 'wrap', gap: 8 }}>
          {REASONS.map((r) => (
            <Pressable
              key={r}
              onPress={() => setReason(r)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 100,
                borderWidth: 1,
                borderColor: reason === r ? colors.statusIssueText : colors.canvas300,
                backgroundColor: reason === r ? 'rgba(197,59,44,0.05)' : colors.canvas,
              }}
            >
              <Text style={{ fontFamily: fonts.arabicMedium, fontSize: 13, color: reason === r ? colors.statusIssueText : colors.ink }}>
                {r}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <View
        style={{
          padding: 18,
          paddingBottom: Math.max(24, bottom),
          backgroundColor: colors.canvas,
          borderTopWidth: 1,
          borderTopColor: colors.canvas300,
          flexDirection,
          gap: 10,
        }}
      >
        <Button variant="ghost" style={{ flex: 1 }} onPress={() => safeBack('/(tabs)/profile')}>
          تراجع
        </Button>
        <Button
          variant="destructive"
          style={{ flex: 1 }}
          onPress={async () => {
            await signOut();
            showToast('اتحذف حسابك', <Icon.check size={16} color={colors.gold} />);
            router.replace('/');
          }}
        >
          متابعة
        </Button>
      </View>
    </View>
  );
}
