import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';

import { Badge, BottomSheet, Button, Icon } from '@/shared/ui';
import { colors, fonts } from '@/shared/theme';
import { useArabicDigits } from '@/shared/hooks/useArabicDigits';
import { useRtl } from '@/shared/hooks/useRtl';
import { TOPUP_METHODS, TOPUP_PRESETS, type TopupMethod } from './data';

type Props = {
  visible: boolean;
  onClose: () => void;
  /** Called with the validated amount and method after the simulated payment succeeds. */
  onConfirm: (payload: { amount: number; method: TopupMethod }) => void;
};

const MIN_AMOUNT = 10;
const MAX_AMOUNT = 5000;

const METHOD_ICON: Record<TopupMethod['kind'], React.ReactNode> = {
  card: <Icon.card size={20} color={colors.olive} />,
  vcash: <Icon.phone size={20} color={colors.olive} />,
  instapay: <Icon.zap size={20} color={colors.olive} />,
};

export function TopupSheet({ visible, onClose, onConfirm }: Props) {
  const arDigits = useArabicDigits();
  const { isRtl, flexDirection } = useRtl();

  const defaultMethod = useMemo(
    () => TOPUP_METHODS.find((m) => m.def) ?? TOPUP_METHODS[0]!,
    [],
  );

  const [amount, setAmount] = useState<number>(TOPUP_PRESETS[0]);
  const [customMode, setCustomMode] = useState(false);
  const [customText, setCustomText] = useState('');
  const [methodId, setMethodId] = useState(defaultMethod.id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setAmount(TOPUP_PRESETS[0]);
    setCustomMode(false);
    setCustomText('');
    setMethodId(defaultMethod.id);
    setLoading(false);
    setError(null);
  };

  const close = () => {
    if (loading) return;
    reset();
    onClose();
  };

  const method = TOPUP_METHODS.find((m) => m.id === methodId) ?? defaultMethod;
  const validAmount = Number.isFinite(amount) && amount >= MIN_AMOUNT && amount <= MAX_AMOUNT;
  const canSubmit = validAmount && !loading;

  const onSelectPreset = (n: number) => {
    setError(null);
    setCustomMode(false);
    setCustomText('');
    setAmount(n);
  };

  const onCustomChange = (text: string) => {
    setError(null);
    // Accept Western digits only — keep input mode numeric.
    const cleaned = text.replace(/[^\d]/g, '');
    setCustomText(cleaned);
    setAmount(cleaned ? Number(cleaned) : 0);
  };

  const onSubmit = async () => {
    if (!validAmount) {
      setError(`اكتب مبلغ بين ${arDigits(MIN_AMOUNT)} و ${arDigits(MAX_AMOUNT)} ج.م`);
      return;
    }
    setLoading(true);
    setError(null);
    // Simulated network round-trip for the payment provider.
    await new Promise<void>((resolve) => setTimeout(resolve, 600));
    onConfirm({ amount, method });
    reset();
    onClose();
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={close}
      title="شحن المحفظة"
      dismissOnScrim={!loading}
      dismissOnDrag={!loading}
    >
      <View style={{ paddingHorizontal: 18, paddingTop: 14, paddingBottom: 24 }}>
        {/* Amount display */}
        <View
          style={{
            backgroundColor: colors.canvas200,
            borderRadius: 12,
            paddingVertical: 20,
            paddingHorizontal: 16,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontFamily: fonts.arabic, fontSize: 11, color: colors.inkMute }}>
            مبلغ الشحن
          </Text>
          <Text
            style={{
              fontFamily: fonts.arabicBold,
              fontSize: 38,
              lineHeight: 40,
              color: colors.olive,
              marginTop: 4,
            }}
          >
            {validAmount ? arDigits(amount) : '—'}{' '}
            <Text style={{ fontFamily: fonts.arabicMedium, fontSize: 14, color: colors.inkLight }}>
              ج.م
            </Text>
          </Text>
        </View>

        {/* Preset grid */}
        <View
          style={{
            marginTop: 16,
            flexDirection: 'row',
            gap: 8,
          }}
        >
          {TOPUP_PRESETS.map((n) => {
            const active = !customMode && amount === n;
            return (
              <Pressable
                key={n}
                onPress={() => onSelectPreset(n)}
                accessibilityLabel={`اشحن ${arDigits(n)} جنيه`}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 10,
                  backgroundColor: active ? colors.olive : colors.bgElevated,
                  borderWidth: active ? 0 : 1.5,
                  borderColor: colors.canvas300,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontFamily: fonts.arabicBold,
                    fontSize: 14,
                    color: active ? colors.canvas : colors.ink,
                  }}
                >
                  {arDigits(n)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Custom amount toggle + input */}
        <View style={{ marginTop: 10 }}>
          {customMode ? (
            <View
              style={{
                flexDirection,
                alignItems: 'center',
                gap: 10,
                borderRadius: 10,
                borderWidth: 1.5,
                borderColor: validAmount ? colors.olive : colors.canvas300,
                paddingHorizontal: 14,
                paddingVertical: 10,
                backgroundColor: colors.bgElevated,
              }}
            >
              <Text style={{ fontFamily: fonts.arabicSemiBold, fontSize: 13, color: colors.inkLight }}>
                مبلغ مخصص
              </Text>
              <TextInput
                value={customText}
                onChangeText={onCustomChange}
                keyboardType="number-pad"
                placeholder={`من ${arDigits(MIN_AMOUNT)} لـ ${arDigits(MAX_AMOUNT)}`}
                placeholderTextColor={colors.inkMute}
                autoFocus
                style={{
                  flex: 1,
                  fontFamily: fonts.arabicSemiBold,
                  fontSize: 15,
                  color: colors.ink,
                  textAlign: isRtl ? 'right' : 'left',
                  paddingVertical: 4,
                }}
              />
              <Text style={{ fontFamily: fonts.arabicMedium, fontSize: 12, color: colors.inkLight }}>
                ج.م
              </Text>
            </View>
          ) : (
            <Pressable
              onPress={() => {
                setCustomMode(true);
                setCustomText('');
                setAmount(0);
              }}
              style={({ pressed }) => ({
                paddingVertical: 10,
                alignItems: 'center',
                borderRadius: 10,
                backgroundColor: pressed ? colors.canvas200 : 'transparent',
              })}
            >
              <Text
                style={{
                  fontFamily: fonts.arabicSemiBold,
                  fontSize: 13,
                  color: colors.olive,
                }}
              >
                مبلغ تاني · أكتب مبلغ مخصص
              </Text>
            </Pressable>
          )}
          {error ? (
            <Text
              style={{
                marginTop: 6,
                fontFamily: fonts.arabicSemiBold,
                fontSize: 12,
                color: colors.statusIssueText,
                textAlign: isRtl ? 'right' : 'left',
              }}
            >
              {error}
            </Text>
          ) : null}
        </View>

        {/* Method picker */}
        <Text
          style={{
            marginTop: 18,
            marginBottom: 8,
            fontFamily: fonts.arabicSemiBold,
            fontSize: 12,
            color: colors.inkMute,
            letterSpacing: 0.4,
            textAlign: isRtl ? 'right' : 'left',
          }}
        >
          الشحن من
        </Text>
        <View style={{ gap: 8 }}>
          {TOPUP_METHODS.map((m) => {
            const active = m.id === methodId;
            return (
              <Pressable
                key={m.id}
                onPress={() => setMethodId(m.id)}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                style={({ pressed }) => ({
                  flexDirection,
                  alignItems: 'center',
                  gap: 10,
                  padding: 12,
                  borderRadius: 12,
                  borderWidth: 1.5,
                  borderColor: active ? colors.olive : 'transparent',
                  backgroundColor: pressed ? colors.canvas200 : colors.bgElevated,
                })}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: colors.canvas200,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {METHOD_ICON[m.kind]}
                </View>
                <Text
                  style={{
                    flex: 1,
                    fontFamily: fonts.arabicSemiBold,
                    fontSize: 13.5,
                    color: colors.ink,
                    textAlign: isRtl ? 'right' : 'left',
                  }}
                >
                  {m.label}
                </Text>
                {m.def ? <Badge variant="active">افتراضي</Badge> : null}
              </Pressable>
            );
          })}
        </View>

        {/* CTA */}
        <View style={{ marginTop: 18 }}>
          <Button
            variant="primary"
            size="lg"
            full
            disabled={!canSubmit}
            loading={loading}
            onPress={onSubmit}
          >
            {loading ? (
              <ActivityIndicator color={colors.canvas} />
            ) : (
              `اشحن ${validAmount ? arDigits(amount) : ''} ج.م`
            )}
          </Button>
        </View>
      </View>
    </BottomSheet>
  );
}
