import { Pressable, Text, View } from 'react-native';

import { colors, fonts } from '@/shared/theme';
import { useArabicDigits } from '@/shared/hooks/useArabicDigits';
import type { Product } from '@/features/catalog/data';
import { Badge } from './Badge';
import { Icon } from './Icon';
import { Stepper } from './Stepper';

type Props = {
  product: Product;
  qty: number;
  onTap?: () => void;
  onAdd?: () => void;
  onChange?: (n: number) => void;
};

export function ProductTile({ product, qty, onTap, onAdd, onChange }: Props) {
  const arDigits = useArabicDigits();
  return (
    <Pressable
      onPress={onTap}
      style={({ pressed }) => ({
        backgroundColor: colors.bgElevated,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.canvas300,
        padding: 10,
        gap: 8,
        opacity: pressed ? 0.92 : 1,
      })}
    >
      <View
        style={{
          height: 96,
          borderRadius: 10,
          backgroundColor: product.hue,
          padding: 8,
          overflow: 'hidden',
          justifyContent: 'flex-end',
        }}
      >
        <Text
          style={{
            position: 'absolute',
            top: 4,
            insetInlineEnd: 10,
            fontFamily: fonts.arabicBold,
            fontSize: 60,
            lineHeight: 60,
            color: 'rgba(15,26,23,0.18)',
          }}
        >
          {product.name[0]}
        </Text>
        {product.tag ? (
          <Badge variant={product.tag === 'عرض' ? 'pending' : 'solid-olive'}>{product.tag}</Badge>
        ) : null}
      </View>
      <View style={{ gap: 2 }}>
        <Text
          numberOfLines={2}
          style={{
            fontFamily: fonts.arabicSemiBold,
            fontSize: 13,
            lineHeight: 18,
            color: colors.ink,
            minHeight: 36,
          }}
        >
          {product.name}
        </Text>
        <Text style={{ fontFamily: fonts.arabic, fontSize: 11, color: colors.inkLight }}>
          {product.sub}
        </Text>
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
          <Text style={{ fontFamily: fonts.arabicBold, fontSize: 15, color: colors.ink }}>
            {arDigits(product.price)}
          </Text>
          <Text style={{ fontFamily: fonts.arabicMedium, fontSize: 11, color: colors.inkLight }}>
            ج.م
          </Text>
        </View>
        {qty > 0 ? (
          <View onStartShouldSetResponder={() => true}>
            <Stepper compact value={qty} min={0} onChange={(n) => onChange?.(n)} />
          </View>
        ) : (
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              onAdd?.();
            }}
            accessibilityLabel="أضف"
            style={({ pressed }) => ({
              width: 30,
              height: 30,
              borderRadius: 8,
              backgroundColor: pressed ? colors.olive700 : colors.olive,
              alignItems: 'center',
              justifyContent: 'center',
            })}
          >
            <Icon.plus size={16} color={colors.canvas} />
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}
