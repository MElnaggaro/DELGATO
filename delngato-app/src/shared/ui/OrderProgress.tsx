import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors, fonts } from '@/shared/theme';
import { Icon } from './Icon';

type Props = {
  step: 0 | 1 | 2 | 3;
};

/**
 * Four-step horizontal progress: received → preparing → on the way → delivered.
 * Completed steps fill with olive + check glyph; current is outlined olive with
 * a live-dot center; future are canvas-200. Connector lines fill left-to-right
 * of progress (which the bidi engine flips correctly in RTL).
 */
export function OrderProgress({ step }: Props) {
  const { t } = useTranslation();
  const steps: { key: string; label: string }[] = [
    { key: 'received', label: t('tracking.steps.received') },
    { key: 'preparing', label: t('tracking.steps.preparing') },
    { key: 'onTheWay', label: t('tracking.steps.onTheWay') },
    { key: 'delivered', label: t('tracking.steps.delivered') },
  ];

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        {steps.map((_, i) => {
          const done = i < step;
          const cur = i === step;
          return (
            <View key={i} style={{ flex: i < steps.length - 1 ? 0 : 1, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: done ? colors.olive : cur ? colors.bgElevated : colors.canvas200,
                  borderWidth: cur ? 2 : 0,
                  borderColor: cur ? colors.olive : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {done ? (
                  <Icon.check size={14} color={colors.canvas} />
                ) : cur ? (
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.olive }} />
                ) : null}
              </View>
              {i < steps.length - 1 ? (
                <View
                  style={{
                    flex: 1,
                    height: 2,
                    backgroundColor: i < step ? colors.olive : colors.canvas300,
                  }}
                />
              ) : null}
            </View>
          );
        })}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
        {steps.map((s, i) => (
          <Text
            key={s.key}
            style={{
              flex: 1,
              textAlign: 'center',
              fontFamily: i === step ? fonts.arabicBold : i < step ? fonts.arabicSemiBold : fonts.arabicMedium,
              fontSize: 12,
              color:
                i === step ? colors.olive : i < step ? colors.ink : colors.inkLight,
            }}
          >
            {s.label}
          </Text>
        ))}
      </View>
    </View>
  );
}
