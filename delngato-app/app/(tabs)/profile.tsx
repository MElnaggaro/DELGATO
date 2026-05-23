import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';

import { ConfirmDialog, Icon, ListRow } from '@/shared/ui';
import { FadeUp } from '@/shared/motion';
import { colors, fonts, shadow } from '@/shared/theme';
import { useArabicDigits } from '@/shared/hooks/useArabicDigits';
import { useAuthStore } from '@/features/auth/store';
import { formatNationalDisplay } from '@/shared/utils/phone';
import { useCartStore } from '@/features/cart/store';
import { useAddressStore } from '@/features/addresses/store';
import { useOrdersStore } from '@/features/orders/store';
import { useRtl } from '@/shared/hooks/useRtl';

export default function Profile() {
  const { t } = useTranslation();
  const router = useRouter();
  const { flexDirection } = useRtl();
  const arDigits = useArabicDigits();
  const user = useAuthStore((s) => s.user);
  const phone = useAuthStore((s) => s.phone);
  const signOut = useAuthStore((s) => s.signOut);
  const favorites = useCartStore((s) => s.favorites);
  const addresses = useAddressStore((s) => s.list);
  const orders = useOrdersStore((s) => s.orders);
  const [logoutVisible, setLogoutVisible] = useState(false);

  const displayName = user?.displayName ?? 'أحمد محمد';
  const initial = displayName?.[0] ?? 'أ';
  const phoneDisplay = phone ? formatNationalDisplay(phone) : '10 234 5678';
  const doneCount = orders.filter((o) => o.status === 'done').length;

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <SafeAreaView edges={['top']} />
      <ScrollView contentContainerStyle={{ paddingBottom: 28 }}>
        {/* Header card */}
        <FadeUp style={{ paddingHorizontal: 18, paddingTop: 18, paddingBottom: 12 }}>
          <View
            style={{
              backgroundColor: colors.olive,
              borderRadius: 16,
              padding: 20,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {/* Decorative DAL letter watermark (gold @ 10%) — matches design reference */}
            <Text
              style={{
                position: 'absolute',
                top: -30,
                insetInlineEnd: -20,
                fontFamily: fonts.arabicBold,
                fontSize: 180,
                lineHeight: 180 * 0.85,
                color: 'rgba(232,177,79,0.10)',
              }}
            >
              د
            </Text>
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 100,
                backgroundColor: colors.canvas,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontFamily: fonts.arabicBold, fontSize: 26, color: colors.olive }}>
                {initial}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: fonts.arabicBold, fontSize: 17, color: colors.canvas }}>
                {displayName}
              </Text>
              <View style={{ direction: 'ltr', alignSelf: 'flex-start', marginTop: 2 }}>
                <Text
                  style={{
                    fontFamily: fonts.arabic,
                    fontSize: 12,
                    color: 'rgba(250,248,243,0.7)',
                  }}
                >
                  +20 {phoneDisplay}
                </Text>
              </View>
            </View>
            <Pressable
              onPress={() => router.push('/edit-profile')}
              style={({ pressed }) => ({
                backgroundColor: pressed ? 'rgba(250,248,243,0.24)' : 'rgba(250,248,243,0.14)',
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 8,
              })}
            >
              <Text
                style={{ fontFamily: fonts.arabicSemiBold, fontSize: 13, color: colors.canvas }}
              >
                {t('common.edit')}
              </Text>
            </Pressable>
          </View>
        </FadeUp>

        {/* Stats */}
        <View
          style={{
            paddingHorizontal: 18,
            paddingBottom: 14,
            flexDirection: 'row',
            gap: 8,
          }}
        >
          {[
            { l: 'محفظة - ج.م', v: 248, icon: <Icon.wallet size={18} color={colors.olive} />, bg: 'rgba(31,74,61,0.08)' },
            { l: 'نقطة', v: '١,٨٢٠', icon: <Icon.star size={18} color={colors.gold} />, bg: 'rgba(232,177,79,0.12)' },
            { l: 'ادع صديق - ج.م', v: 30, icon: <Icon.heart size={18} color={colors.olive} />, bg: 'rgba(31,74,61,0.08)' },
          ].map((s) => (
            <View
              key={s.l}
              style={{
                flex: 1,
                backgroundColor: colors.bgElevated,
                borderRadius: 12,
                padding: 12,
                alignItems: 'center',
                ...shadow.card,
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: s.bg,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 10,
                }}
              >
                {s.icon}
              </View>
              <Text style={{ fontFamily: fonts.arabicBold, fontSize: 16, color: colors.olive }}>
                {typeof s.v === 'number' ? arDigits(s.v) : s.v}
              </Text>
              <Text
                style={{ fontFamily: fonts.arabic, fontSize: 11, color: colors.inkLight, marginTop: 4 }}
              >
                {s.l}
              </Text>
            </View>
          ))}
        </View>

        <Group title="الحساب">
          <ListRow
            icon={<Icon.pin size={18} color={colors.olive} />}
            label={t('profile.addresses')}
            sub={`${arDigits(addresses.length)} عناوين محفوظة`}
            onPress={() => router.push('/addresses')}
          />
          <Hairline />
          <ListRow
            icon={<Icon.card size={18} color={colors.olive} />}
            label={t('profile.paymentMethods')}
            sub="ضيف بطاقة أو محفظة"
            onPress={() => router.push('/payment-methods')}
          />
          <Hairline />
          <ListRow
            icon={<Icon.heart size={18} color={colors.olive} />}
            label="المحلات المفضلة"
            sub={`${arDigits(favorites.length)} محلات`}
            onPress={() => router.push('/favorites')}
          />
        </Group>

        <Group title="التطبيق">
          <ListRow
            icon={<Icon.bell size={18} color={colors.olive} />}
            label={t('notifications.title')}
            sub="مفعّلة"
            onPress={() => router.push('/notification-settings')}
          />
          <Hairline />
          <ListRow
            icon={<Icon.globe size={18} color={colors.olive} />}
            label={t('settings.languageTitle')}
            value={t('settings.ar')}
            onPress={() =>
              Alert.alert(t('settings.languageTitle'), t('settings.languageHint'), [
                { text: t('common.ok') ?? 'تمام' },
              ])
            }
          />
          <Hairline />
          <ListRow
            icon={<Icon.shieldCheck size={18} color={colors.olive} />}
            label="الخصوصية والأمان"
            onPress={() =>
              Alert.alert(t('profile.comingSoonTitle'), t('profile.comingSoonBody'), [
                { text: t('common.ok') ?? 'تمام' },
              ])
            }
          />
        </Group>

        <Group title="المساعدة">
          <ListRow
            icon={<Icon.help size={18} color={colors.olive} />}
            label="مركز المساعدة"
            onPress={() => router.push('/support')}
          />
          <Hairline />
          <ListRow
            icon={<Icon.message size={18} color={colors.olive} />}
            label="تواصل معانا"
            sub="جاهزين لرد على أي سؤال"
            onPress={() => router.push('/support')}
          />
          <Hairline />
          <ListRow
            icon={<Icon.info size={18} color={colors.olive} />}
            label="عن دلنجاتُو"
            sub="إصدار ١٫٠٫٠"
            onPress={() =>
              Alert.alert('دلنجاتُو', 'من الدلنجات · لأهل الدلنجات\nإصدار ١٫٠٫٠', [
                { text: 'تمام' },
              ])
            }
          />
        </Group>

        <View style={{ paddingHorizontal: 22, paddingTop: 8 }}>
          <Pressable
            onPress={() => setLogoutVisible(true)}
            style={{ flexDirection, alignItems: 'center', gap: 8, paddingVertical: 12 }}
          >
            <Icon.logout size={18} color={colors.statusIssueText} />
            <Text
              style={{
                fontFamily: fonts.arabicSemiBold,
                fontSize: 14,
                color: colors.statusIssueText,
              }}
            >
              {t('profile.logout')}
            </Text>
          </Pressable>
        </View>

        <Text
          style={{
            fontFamily: fonts.arabic,
            fontSize: 11,
            color: colors.inkMute,
            textAlign: 'center',
            marginTop: 14,
          }}
        >
          من الدلنجات · لأهل الدلنجات · © ٢٠٢٦
        </Text>
      </ScrollView>

      <ConfirmDialog
        visible={logoutVisible}
        title="تخرج من حسابك؟"
        body="هتحتاج تدخل رقم تليفونك تاني علشان ترجع."
        cancelLabel={t('common.cancel')}
        confirmLabel="خروج"
        destructive
        onCancel={() => setLogoutVisible(false)}
        onConfirm={async () => {
          setLogoutVisible(false);
          await signOut();
          router.replace('/');
        }}
      />
    </View>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  const { isRtl } = useRtl();
  return (
    <View style={{ paddingHorizontal: 18, paddingTop: 4, paddingBottom: 14 }}>
      <Text
        style={{
          fontFamily: fonts.arabicSemiBold,
          fontSize: 12,
          color: colors.inkMute,
          letterSpacing: 0.4,
          marginBottom: 8,
          textAlign: isRtl ? 'right' : 'left',
        }}
      >
        {title}
      </Text>
      <View
        style={{
          backgroundColor: colors.bgElevated,
          borderRadius: 12,
          overflow: 'hidden',
          ...shadow.card,
        }}
      >
        {children}
      </View>
    </View>
  );
}

function Hairline() {
  return <View style={{ height: 1, backgroundColor: colors.canvas300, marginHorizontal: 16 }} />;
}

