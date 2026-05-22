import { Fragment } from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors, fonts } from '@/shared/theme';
import { Icon } from './Icon';
import { LiveDot } from './LiveDot';

type Props = {
  step: 0 | 1 | 2 | 3;
};

/**
 * Four-step horizontal progress. Mirrors design reference Atoms.jsx OrderProgress:
 * circles are flex-rigid siblings, connectors are flex:1 between them.
 *   - done: olive circle + check glyph
 *   - current: white circle, 2px olive border, pulsing live-dot center
 *   - future: canvas-200 circle, empty
 *   - connector: 2px line, olive (done) / canvas-300 (future)
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
        {steps.map((s, i) => {
          const done = i < step;
          const cur = i === step;
          return (
            <Fragment key={s.key}>
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: done
                    ? colors.olive
                    : cur
                      ? colors.bgElevated
                      : colors.canvas200,
                  borderWidth: cur ? 2 : 0,
                  borderColor: cur ? colors.olive : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {done ? (
                  <Icon.check size={14} color={colors.canvas} strokeWidth={3} />
                ) : cur ? (
                  <LiveDot size={8} color={colors.olive} />
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
            </Fragment>
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
              fontFamily:
                i === step
                  ? fonts.arabicBold
                  : i < step
                    ? fonts.arabicSemiBold
                    : fonts.arabicMedium,
              fontSize: 11.5,
              color:
                i === step
                  ? colors.olive
                  : i < step
                    ? colors.ink
                    : colors.inkMute,
              includeFontPadding: false,
            }}
          >
            {s.label}
          </Text>
        ))}
      </View>
    </View>
  );
}
