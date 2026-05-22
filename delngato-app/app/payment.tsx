import { useState } from 'react';
import { Platform, ScrollView, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { AppBar, Button, Icon, StickyActionBar, STICKY_CTA_HEIGHT } from '@/shared/ui';
import { colors, fonts } from '@/shared/theme';
import { safeBack } from '@/shared/utils/nav';

const MONO_FAMILY = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });

export default function Payment() {
  const router = useRouter();
  const { t } = useTranslation();
  const [num, setNum] = useState('');
  const [name, setName] = useState('');
  const [exp, setExp] = useState('');
  const [cvv, setCvv] = useState('');
  const [loading, setLoading] = useState(false);

  const valid =
    num.replace(/\s/g, '').length >= 16 && name.length >= 3 && exp.length >= 5 && cvv.length >= 3;

  const fmtNum = (s: string) =>
    s.replace(/[^0-9]/g, '').replace(/(.{4})/g, '$1 ').trim();
  const fmtExp = (s: string) => {
    const v = s.replace(/[^0-9]/g, '');
    return v.length > 2 ? v.slice(0, 2) + '/' + v.slice(2, 4) : v;
  };
  const masked = (fmtNum(num).padEnd(19, '•').replace(/•{4}/g, '•••• ')).trim();

  const submit = () => {
    setLoading(true);
    setTimeout(() => router.replace('/order-success'), 900);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <AppBar title={t('payment.title')} onBack={() => safeBack('/checkout')} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: STICKY_CTA_HEIGHT + 16 }}>
        {/* Card visual — olive → olive-700 diagonal gradient with gold accent ring. */}
        <LinearGradient
          colors={[colors.olive, colors.olive700]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            height: 200,
            borderRadius: 16,
            padding: 20,
            overflow: 'hidden',
            justifyContent: 'space-between',
          }}
        >
          <View
            style={{
              position: 'absolute',
              top: -40,
              insetInlineEnd: -30,
              width: 140,
              height: 140,
              borderRadius: 100,
              backgroundColor: 'rgba(232,177,79,0.18)',
            }}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ width: 38, height: 28, borderRadius: 4, backgroundColor: colors.gold }} />
            <Text
              style={{
                fontFamily: fonts.displayBold,
                letterSpacing: 3,
                fontSize: 14,
                color: colors.gold,
              }}
            >
              DELNGATO
            </Text>
          </View>
          <Text
            style={{
              fontFamily: MONO_FAMILY,
              fontSize: 19,
              letterSpacing: 3,
              color: colors.canvas,
            }}
          >
            {masked || '•••• •••• •••• ••••'}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
            }}
          >
            <View>
              <Text style={{ fontSize: 9, color: 'rgba(250,248,243,0.7)', letterSpacing: 0.4 }}>
                اسم حامل البطاقة
              </Text>
              <Text
                style={{
                  fontFamily: fonts.arabicSemiBold,
                  fontSize: 13,
                  color: colors.canvas,
                  marginTop: 2,
                }}
              >
                {name || '—'}
              </Text>
            </View>
            <View>
              <Text style={{ fontSize: 9, color: 'rgba(250,248,243,0.7)', letterSpacing: 0.4 }}>
                الصلاحية
              </Text>
              <Text
                style={{
                  fontFamily: MONO_FAMILY,
                  fontSize: 13,
                  color: colors.canvas,
                  marginTop: 2,
                }}
              >
                {exp || '••/••'}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Form */}
        <View style={{ gap: 14, paddingTop: 20 }}>
          <Field label={t('payment.number')}>
            <CInput
              placeholder="1234 5678 9012 3456"
              value={num}
              onChangeText={(s) => setNum(fmtNum(s).slice(0, 19))}
              keyboardType="number-pad"
              ltr
            />
          </Field>
          <Field label={t('payment.holder')}>
            <CInput
              placeholder={t('payment.holderPlaceholder')}
              value={name}
              onChangeText={setName}
            />
          </Field>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Field label={t('payment.expiry')}>
                <CInput
                  placeholder={t('payment.expiryPlaceholder')}
                  value={exp}
                  onChangeText={(s) => setExp(fmtExp(s).slice(0, 5))}
                  keyboardType="number-pad"
                  ltr
                />
              </Field>
            </View>
            <View style={{ width: 110 }}>
              <Field label={t('payment.cvv')}>
                <CInput
                  placeholder={t('payment.cvvPlaceholder')}
                  value={cvv}
                  onChangeText={(s) => setCvv(s.replace(/[^0-9]/g, '').slice(0, 4))}
                  keyboardType="number-pad"
                  ltr
                  secureTextEntry
                />
              </Field>
            </View>
          </View>

          <View
            style={{
              backgroundColor: colors.canvas200,
              borderRadius: 10,
              padding: 12,
              flexDirection: 'row',
              gap: 8,
              alignItems: 'center',
            }}
          >
            <Icon.shieldCheck size={16} color={colors.inkLight} />
            <Text style={{ flex: 1, fontFamily: fonts.arabic, fontSize: 12, color: colors.inkLight }}>
              {t('payment.secured')}
            </Text>
          </View>
        </View>
      </ScrollView>

      <StickyActionBar>
        <Button
          variant="primary"
          size="lg"
          full
          disabled={!valid}
          loading={loading}
          onPress={submit}
        >
          {t('payment.payNow')}
        </Button>
      </StickyActionBar>
    </View>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View>
      <Text
        style={{
          fontFamily: fonts.arabicSemiBold,
          fontSize: 12,
          color: colors.inkMute,
          marginBottom: 6,
          letterSpacing: 0.3,
        }}
      >
        {label}
      </Text>
      {children}
    </View>
  );
}

function CInput({
  ltr,
  ...rest
}: React.ComponentProps<typeof TextInput> & { ltr?: boolean }) {
  return (
    <TextInput
      {...rest}
      placeholderTextColor={colors.inkMute}
      style={{
        height: 48,
        backgroundColor: colors.bgElevated,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: colors.canvas300,
        paddingHorizontal: 14,
        fontFamily: fonts.arabic,
        fontSize: 16,
        color: colors.ink,
        textAlign: ltr ? 'left' : 'right',
        ...(ltr ? { writingDirection: 'ltr' } : {}),
      }}
    />
  );
}
