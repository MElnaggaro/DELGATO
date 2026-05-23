import { useState } from 'react';
import { Dimensions, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { AppBar } from '@/shared/ui';
import { colors, fonts } from '@/shared/theme';
import { safeBack } from '@/shared/utils/nav';
import { PRODUCTS, findProduct } from '@/features/catalog/data';

const PHOTO_HUES = ['#F2EEE3', '#E9D7A8', '#D9DFC8', '#FAE3B6'];

export default function ProductGallery() {
  const params = useLocalSearchParams<{ id?: string }>();
  const product = findProduct(params.id ?? '') ?? PRODUCTS[0]!;
  const [index, setIndex] = useState(0);
  const screenW = Dimensions.get('window').width;

  return (
    <View style={{ flex: 1, backgroundColor: colors.ink }}>
      <AppBar title={product.name} onBack={() => safeBack('/product')} />

      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const i = Math.round(e.nativeEvent.contentOffset.x / screenW);
            setIndex(i);
          }}
        >
          {PHOTO_HUES.map((hue, i) => (
            <View
              key={i}
              style={{
                width: screenW,
                aspectRatio: 1,
                backgroundColor: hue,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  fontFamily: fonts.arabicBold,
                  fontSize: 280,
                  lineHeight: 280 * 0.9,
                  color: 'rgba(15,26,23,0.12)',
                }}
              >
                {product.name[0]}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={{ paddingHorizontal: 18, paddingVertical: 18, alignItems: 'center', gap: 14 }}>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {PHOTO_HUES.map((_, i) => (
            <View
              key={i}
              style={{
                width: i === index ? 22 : 8,
                height: 8,
                borderRadius: 100,
                backgroundColor: i === index ? colors.canvas : 'rgba(250,248,243,0.4)',
              }}
            />
          ))}
        </View>
        <Text style={{ fontFamily: fonts.arabic, fontSize: 12, color: 'rgba(250,248,243,0.7)' }}>
          صورة {index + 1} من {PHOTO_HUES.length}
        </Text>
      </View>
    </View>
  );
}
