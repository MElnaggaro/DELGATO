import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { AppBar, Button, Chip, Icon } from '@/shared/ui';
import { FadeUp } from '@/shared/motion';
import { colors, fonts } from '@/shared/theme';
import { safeBack } from '@/shared/utils/nav';

const LABELS = ['سيء', 'مش كويس', 'مقبول', 'كويس', 'ممتاز'];

export default function Rate() {
  const router = useRouter();
  const [stars, setStars] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [note, setNote] = useState('');

  const opts =
    stars >= 4
      ? ['التوصيل سريع', 'المنتجات نضيفة', 'الكابتن مؤدب', 'الأسعار مناسبة', 'التطبيق سهل']
      : ['التوصيل اتأخر', 'منتج ناقص', 'تغليف ضعيف', 'الكابتن مش مؤدب', 'الأسعار غالية'];

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <AppBar title="قيّم تجربتك" onBack={() => safeBack('/(tabs)/orders')} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}>
        <View style={{ alignItems: 'center', marginTop: 20 }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 100,
              backgroundColor: colors.olive,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontFamily: fonts.arabicBold, fontSize: 28, color: colors.canvas }}>
              أ
            </Text>
          </View>
          <Text
            style={{
              fontFamily: fonts.arabicBold,
              fontSize: 18,
              color: colors.ink,
              marginTop: 12,
            }}
          >
            سوبر ماركت أبو حسن
          </Text>
          <Text style={{ fontFamily: fonts.arabic, fontSize: 12, color: colors.inkLight, marginTop: 2 }}>
            الطلب اتسلم بنجاح
          </Text>
        </View>

        <View
          style={{
            marginTop: 32,
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 10,
          }}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <Pressable key={n} onPress={() => setStars(n)} hitSlop={6} style={{ padding: 4 }}>
              <Icon.star
                size={40}
                color={stars >= n ? colors.gold : colors.canvas300}
                fill={stars >= n ? colors.gold : 'transparent'}
              />
            </Pressable>
          ))}
        </View>
        <Text
          style={{
            textAlign: 'center',
            fontFamily: fonts.arabicMedium,
            fontSize: 14,
            color: colors.inkLight,
            marginTop: 8,
            height: 22,
          }}
        >
          {stars > 0 ? LABELS[stars - 1] : ' '}
        </Text>

        {stars > 0 ? (
          <FadeUp delay={100} style={{ marginTop: 20 }}>
            <Text
              style={{
                fontFamily: fonts.arabicSemiBold,
                fontSize: 12,
                color: colors.inkMute,
                letterSpacing: 0.4,
              }}
            >
              {stars >= 4 ? 'إيه اللي عجبك؟' : 'إيه اللي ممكن نحسنه؟'}
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
              {opts.map((tag) => (
                <Chip
                  key={tag}
                  active={tags.includes(tag)}
                  onPress={() =>
                    setTags(tags.includes(tag) ? tags.filter((x) => x !== tag) : [...tags, tag])
                  }
                >
                  {tag}
                </Chip>
              ))}
            </View>
            <TextInput
              value={note}
              onChangeText={setNote}
              multiline
              placeholder="اكتب ملاحظة (اختياري)"
              placeholderTextColor={colors.inkMute}
              style={{
                marginTop: 18,
                minHeight: 88,
                backgroundColor: colors.bgElevated,
                borderRadius: 10,
                borderWidth: 1.5,
                borderColor: colors.canvas300,
                padding: 12,
                fontFamily: fonts.arabic,
                fontSize: 14,
                color: colors.ink,
                textAlign: 'right',
                textAlignVertical: 'top',
              }}
            />
          </FadeUp>
        ) : null}
      </ScrollView>

      <SafeAreaView
        edges={['bottom']}
        style={{
          paddingHorizontal: 18,
          paddingTop: 12,
          paddingBottom: 12,
          backgroundColor: colors.canvas,
          borderTopWidth: 1,
          borderTopColor: colors.canvas300,
        }}
      >
        <Button
          variant="primary"
          size="lg"
          full
          disabled={stars === 0}
          onPress={() => router.back()}
        >
          إرسال التقييم
        </Button>
      </SafeAreaView>
    </View>
  );
}
