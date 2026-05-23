import { useRef, useState } from 'react';
import { Dimensions, Pressable, ScrollView, Share, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { AppBar, Icon } from '@/shared/ui';
import { colors, fonts } from '@/shared/theme';
import { useArabicDigits } from '@/shared/hooks/useArabicDigits';
import { safeBack } from '@/shared/utils/nav';
import { PRODUCTS, findProduct } from '@/features/catalog/data';

const PHOTO_HUES = ['#F2EEE3', '#E9D7A8', '#D9DFC8', '#FAE3B6'];

export default function ProductGallery() {
  const params = useLocalSearchParams<{ id?: string }>();
  const product = findProduct(params.id ?? '') ?? PRODUCTS[0]!;
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const screenW = Dimensions.get('window').width;
  const arDigits = useArabicDigits();

  const onShare = async () => {
    try {
      await Share.share({
        message: `شوف ${product.name} على دلنجاتُو`,
      });
    } catch {
      /* user cancelled or share unavailable */
    }
  };

  const goTo = (i: number) => {
    setIndex(i);
    scrollRef.current?.scrollTo({ x: i * screenW, animated: true });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.ink }}>
      <AppBar
        title={`${arDigits(index + 1)} / ${arDigits(PHOTO_HUES.length)}`}
        onBack={() => safeBack('/product')}
        bg={colors.ink}
        tint={colors.canvas}
        centerTitle
        trailing={
          <Pressable onPress={onShare} accessibilityLabel="مشاركة" hitSlop={8} style={{ padding: 6 }}>
            <Icon.share size={20} color={colors.canvas} />
          </Pressable>
        }
      />

      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ScrollView
          ref={scrollRef}
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
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 32,
              }}
            >
              <View
                style={{
                  width: '100%',
                  aspectRatio: 1,
                  maxWidth: 320,
                  borderRadius: 22,
                  backgroundColor: hue,
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                <Text
                  style={{
                    fontFamily: fonts.arabicBold,
                    fontSize: 240,
                    lineHeight: 240 * 0.9,
                    color: 'rgba(15,26,23,0.18)',
                  }}
                >
                  {product.name[0]}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Thumbnail strip */}
      <View
        style={{
          paddingHorizontal: 18,
          paddingBottom: 14,
          paddingTop: 6,
          flexDirection: 'row',
          gap: 8,
          justifyContent: 'center',
        }}
      >
        {PHOTO_HUES.map((hue, i) => (
          <Pressable
            key={i}
            onPress={() => goTo(i)}
            accessibilityLabel={`صورة ${arDigits(i + 1)}`}
            style={{
              width: 56,
              height: 56,
              borderRadius: 10,
              backgroundColor: hue,
              borderWidth: 2,
              borderColor: i === index ? colors.gold : 'transparent',
              overflow: 'hidden',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                fontFamily: fonts.arabicBold,
                fontSize: 28,
                lineHeight: 30,
                color: 'rgba(15,26,23,0.18)',
              }}
            >
              {product.name[0]}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Footer text */}
      <View style={{ paddingHorizontal: 18, paddingBottom: 18, alignItems: 'center' }}>
        <Text style={{ fontFamily: fonts.arabicBold, fontSize: 18, color: colors.canvas }}>
          {product.name}
        </Text>
        <Text
          style={{
            fontFamily: fonts.arabic,
            fontSize: 13,
            color: 'rgba(250,248,243,0.7)',
            marginTop: 4,
          }}
        >
          {product.sub}
        </Text>
      </View>
    </View>
  );
}
