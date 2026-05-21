import { useEffect, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { AppBar, Button, Card, Chip, EmptyState, Icon, Spinner, StickyActionBar, STICKY_CTA_HEIGHT } from '@/shared/ui';
import { FadeUp, Pop } from '@/shared/motion';
import { colors, fonts } from '@/shared/theme';
import { safeBack } from '@/shared/utils/nav';
import { detectAddress } from '@/services/api/endpoints/addressClient';
import type { AddressLabel } from '@/services/api/schemas/address';
import { useAddressStore } from '@/features/addresses/store';

type Step = 'detecting' | 'confirm' | 'detectFailed';

export default function AddressSetup() {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ manual?: string }>();
  const isManual = params.manual === '1';

  const [step, setStep] = useState<Step>(isManual ? 'confirm' : 'detecting');
  const [street, setStreet] = useState('');
  const [detail, setDetail] = useState('');
  const [label, setLabel] = useState<AddressLabel>('home');

  const addLocal = useAddressStore((s) => s.addLocal);

  useEffect(() => {
    if (step !== 'detecting') return;
    let cancelled = false;
    void (async () => {
      try {
        const found = await detectAddress();
        if (cancelled) return;
        setStreet(found.street);
        setDetail(found.detail);
        setStep('confirm');
      } catch {
        if (cancelled) return;
        setStep('detectFailed');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [step]);

  if (step === 'detecting') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.canvas }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 18, padding: 32 }}>
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 100,
              backgroundColor: 'rgba(31,74,61,0.08)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Spinner size={28} />
          </View>
          <Text style={{ fontFamily: fonts.arabicSemiBold, fontSize: 16, color: colors.ink }}>
            {t('address.detecting')}
          </Text>
          <Text style={{ fontFamily: fonts.arabic, fontSize: 13, color: colors.inkLight }}>
            {t('address.detectingSub')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (step === 'detectFailed') {
    return (
      <View style={{ flex: 1, backgroundColor: colors.canvas }}>
        <AppBar onBack={() => safeBack('/(onboarding)/location-permission')} />
        <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
          <View style={{ flex: 1, padding: 24, justifyContent: 'center' }}>
            <EmptyState
              icon={<Icon.pin size={28} color={colors.olive} />}
              title={t('address.detectFailedTitle')}
              body={t('address.detectFailedBody')}
            />
            <View style={{ gap: 12, marginTop: 24 }}>
              <Button variant="primary" full size="lg" onPress={() => setStep('detecting')}>
                {t('address.detectRetry')}
              </Button>
              <Button variant="ghost" full size="lg" onPress={() => setStep('confirm')}>
                {t('address.detectSwitchManual')}
              </Button>
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const canSave = street.trim().length > 1;
  const onSave = () => {
    addLocal({
      id: `local-${Date.now()}`,
      label,
      street: street.trim(),
      detail: detail.trim(),
    });
    router.replace('/');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <AppBar title={t('address.confirmTitle')} onBack={() => safeBack('/(onboarding)/location-permission')} />
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: STICKY_CTA_HEIGHT + 16 }}>
        {/* Map placeholder */}
        <View
          style={{
            height: 220,
            borderRadius: 14,
            overflow: 'hidden',
            position: 'relative',
            backgroundColor: colors.canvas300,
            borderWidth: 1,
            borderColor: colors.canvas300,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Pop>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 100,
                backgroundColor: colors.olive,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon.pin size={22} color={colors.canvas} />
            </View>
          </Pop>
        </View>

        <Card padding={14} style={{ marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: 'rgba(31,74,61,0.08)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon.pin size={18} color={colors.olive} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: fonts.arabicSemiBold, fontSize: 14, color: colors.ink }}>
              {street || '—'}
            </Text>
            <Text style={{ fontFamily: fonts.arabic, fontSize: 12, color: colors.inkLight }}>
              {detail || '—'}
            </Text>
          </View>
        </Card>

        <FadeUp delay={80} style={{ marginTop: 18, gap: 14 }}>
          <View>
            <Text
              style={{
                fontFamily: fonts.arabicSemiBold,
                fontSize: 12,
                color: colors.inkMute,
                marginBottom: 6,
                letterSpacing: 0.4,
              }}
            >
              {t('address.fieldLabel')}
            </Text>
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              {(['home', 'work', 'other'] as AddressLabel[]).map((k) => (
                <Chip
                  key={k}
                  active={label === k}
                  icon={
                    k === 'home' ? (
                      <Icon.home size={16} color={label === k ? colors.canvas : colors.ink} />
                    ) : k === 'work' ? (
                      <Icon.store size={16} color={label === k ? colors.canvas : colors.ink} />
                    ) : (
                      <Icon.pin size={16} color={label === k ? colors.canvas : colors.ink} />
                    )
                  }
                  onPress={() => setLabel(k)}
                >
                  {k === 'home'
                    ? t('address.labelHome')
                    : k === 'work'
                    ? t('address.labelWork')
                    : t('address.labelOther')}
                </Chip>
              ))}
            </View>
          </View>

          <View>
            <Text
              style={{
                fontFamily: fonts.arabicSemiBold,
                fontSize: 12,
                color: colors.inkMute,
                marginBottom: 6,
                letterSpacing: 0.4,
              }}
            >
              {t('address.fieldDetail')}
            </Text>
            <TextInput
              value={detail}
              onChangeText={setDetail}
              placeholder={t('address.fieldDetailPlaceholder')}
              placeholderTextColor={colors.inkMute}
              style={{
                height: 48,
                paddingHorizontal: 14,
                backgroundColor: colors.canvas200,
                borderRadius: 8,
                fontFamily: fonts.arabic,
                fontSize: 15,
                color: colors.ink,
              }}
            />
          </View>

          {isManual ? (
            <View>
              <Text
                style={{
                  fontFamily: fonts.arabicSemiBold,
                  fontSize: 12,
                  color: colors.inkMute,
                  marginBottom: 6,
                  letterSpacing: 0.4,
                }}
              >
                {t('address.fieldLabel')}
              </Text>
              <TextInput
                value={street}
                onChangeText={setStreet}
                placeholder="شارع الجلاء"
                placeholderTextColor={colors.inkMute}
                style={{
                  height: 48,
                  paddingHorizontal: 14,
                  backgroundColor: colors.canvas200,
                  borderRadius: 8,
                  fontFamily: fonts.arabic,
                  fontSize: 15,
                  color: colors.ink,
                }}
              />
            </View>
          ) : null}
        </FadeUp>
      </ScrollView>
      <StickyActionBar>
        <Button variant="primary" full size="lg" disabled={!canSave} onPress={onSave}>
          {t('address.done')}
        </Button>
      </StickyActionBar>
    </View>
  );
}
