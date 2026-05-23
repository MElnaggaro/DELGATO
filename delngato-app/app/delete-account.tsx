import { useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';

import {
  AppBar,
  Button,
  ConfirmDialog,
  Icon,
  StickyActionBar,
  STICKY_CTA_HEIGHT,
  showToast,
} from '@/shared/ui';
import { colors, fonts } from '@/shared/theme';
import { useRtl } from '@/shared/hooks/useRtl';
import { safeBack } from '@/shared/utils/nav';
import { useAuthStore } from '@/features/auth/store';

const PHRASE = 'احذف';

export default function DeleteAccount() {
  const router = useRouter();
  const { isRtl } = useRtl();
  const signOut = useAuthStore((s) => s.signOut);
  const [confirm, setConfirm] = useState('');
  const [visible, setVisible] = useState(false);
  const enabled = confirm.trim() === PHRASE;

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <AppBar title="حذف الحساب" onBack={() => safeBack('/(tabs)/profile')} />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: STICKY_CTA_HEIGHT + 16, paddingTop: 10 }}
      >
        <View
          style={{
            backgroundColor: 'rgba(197,59,44,0.08)',
            borderRadius: 12,
            padding: 14,
            flexDirection: 'row',
            gap: 10,
            alignItems: 'flex-start',
          }}
        >
          <Icon.info size={18} color={colors.statusIssueText} />
          <Text
            style={{
              flex: 1,
              fontFamily: fonts.arabic,
              fontSize: 13,
              color: colors.statusIssueText,
              lineHeight: 21,
              textAlign: isRtl ? 'right' : 'left',
            }}
          >
            <Text style={{ fontFamily: fonts.arabicBold }}>حذف نهائي:</Text> هتمسح حسابك، عناوينك،
            طلباتك، ورصيد المحفظة. الأكشن ده مش هيرجع.
          </Text>
        </View>

        <Text style={{ marginTop: 24, fontFamily: fonts.arabicBold, fontSize: 17, color: colors.ink, textAlign: isRtl ? 'right' : 'left' }}>
          هتفقد:
        </Text>
        <View style={{ marginTop: 10, gap: 8 }}>
          {[
            'كل سجل طلباتك السابقة',
            `${'٢٤٨'} ج.م رصيد في المحفظة`,
            '١,٨٢٠ نقطة مكافآت',
            'العناوين المحفوظة وطرق الدفع',
          ].map((item) => (
            <View key={item} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              <Icon.x size={14} color={colors.statusIssueText} />
              <Text style={{ fontFamily: fonts.arabic, fontSize: 14, color: colors.inkLight }}>
                {item}
              </Text>
            </View>
          ))}
        </View>

        <Text
          style={{
            marginTop: 24,
            fontFamily: fonts.arabicSemiBold,
            fontSize: 13,
            color: colors.ink,
            textAlign: isRtl ? 'right' : 'left',
            lineHeight: 21,
          }}
        >
          لتأكيد، اكتب{' '}
          <Text style={{ fontFamily: fonts.arabicBold, color: colors.statusIssueText }}>
            "{PHRASE}"
          </Text>{' '}
          في الخانة:
        </Text>
        <TextInput
          value={confirm}
          onChangeText={setConfirm}
          placeholder={PHRASE}
          placeholderTextColor={colors.inkMute}
          style={{
            marginTop: 10,
            minHeight: 56,
            backgroundColor: colors.bgElevated,
            borderRadius: 8,
            borderWidth: 1.5,
            borderColor: enabled ? colors.statusIssue : colors.canvas300,
            paddingHorizontal: 14,
            fontFamily: fonts.arabicBold,
            fontSize: 17,
            color: colors.ink,
            textAlign: isRtl ? 'right' : 'left',
          }}
        />
      </ScrollView>

      <StickyActionBar>
        <Button variant="destructive" size="lg" full disabled={!enabled} onPress={() => setVisible(true)}>
          احذف الحساب نهائياً
        </Button>
      </StickyActionBar>

      <ConfirmDialog
        visible={visible}
        title="مؤكد تحذف حسابك؟"
        body="الحذف نهائي. مش هتقدر ترجع للحساب أو البيانات."
        cancelLabel="تراجع"
        confirmLabel="احذف نهائياً"
        destructive
        onCancel={() => setVisible(false)}
        onConfirm={async () => {
          setVisible(false);
          await signOut();
          showToast('اتحذف حسابك', <Icon.check size={16} color={colors.gold} />);
          router.replace('/');
        }}
      />
    </View>
  );
}
