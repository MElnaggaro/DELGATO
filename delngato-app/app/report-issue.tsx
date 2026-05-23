import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';

import {
  AppBar,
  Button,
  Chip,
  Icon,
  StickyActionBar,
  STICKY_CTA_HEIGHT,
  showToast,
} from '@/shared/ui';
import { colors, fonts } from '@/shared/theme';
import { useRtl } from '@/shared/hooks/useRtl';
import { safeBack } from '@/shared/utils/nav';

const CATEGORIES = [
  'مشكلة في الطلب',
  'مشكلة في الكابتن',
  'مشكلة في المحل',
  'مشكلة في الدفع',
  'مشكلة في التطبيق',
  'سبب تاني',
];

export default function ReportIssue() {
  const router = useRouter();
  const { isRtl } = useRtl();
  const [category, setCategory] = useState('');
  const [detail, setDetail] = useState('');
  const [photos, setPhotos] = useState<number[]>([]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <AppBar title="بلّغ عن مشكلة" onBack={() => safeBack('/(tabs)/profile')} />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: STICKY_CTA_HEIGHT + 16, paddingTop: 10 }}
      >
        <Text style={section(isRtl)}>نوع المشكلة</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {CATEGORIES.map((c) => (
            <Chip key={c} active={category === c} onPress={() => setCategory(c)}>
              {c}
            </Chip>
          ))}
        </View>

        <Text style={section(isRtl)}>وصف المشكلة</Text>
        <TextInput
          multiline
          value={detail}
          onChangeText={setDetail}
          placeholder="اكتب المشكلة بالتفصيل — احنا بنحلها."
          placeholderTextColor={colors.inkMute}
          style={{
            minHeight: 140,
            backgroundColor: colors.bgElevated,
            borderRadius: 12,
            borderWidth: 1.5,
            borderColor: colors.canvas300,
            padding: 14,
            fontFamily: fonts.arabic,
            fontSize: 15,
            color: colors.ink,
            lineHeight: 22,
            textAlign: isRtl ? 'right' : 'left',
            textAlignVertical: 'top',
          }}
        />

        <Text style={section(isRtl)}>
          صور <Text style={{ fontFamily: fonts.arabic, color: colors.inkLight }}>(اختياري)</Text>
        </Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {[0, 1, 2].map((i) => {
            const has = photos.includes(i);
            return (
              <Pressable
                key={i}
                onPress={() => setPhotos((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]).slice(0, 3))}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 10,
                  backgroundColor: has ? colors.canvas200 : colors.bgElevated,
                  borderWidth: 1.5,
                  borderColor: colors.canvas300,
                  borderStyle: 'dashed',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {has ? (
                  <Icon.check size={20} color={colors.olive} />
                ) : (
                  <Icon.plus size={20} color={colors.inkLight} />
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <StickyActionBar>
        <Button
          variant="primary"
          size="lg"
          full
          disabled={!category || detail.length < 5}
          onPress={() => {
            showToast('وصلتنا المشكلة. هنرد عليك في ساعة', <Icon.check size={16} color={colors.gold} />);
            router.back();
          }}
        >
          إرسال البلاغ
        </Button>
      </StickyActionBar>
    </View>
  );
}

function section(isRtl: boolean) {
  return {
    fontFamily: fonts.arabicSemiBold,
    fontSize: 12,
    color: colors.inkMute,
    letterSpacing: 0.4,
    marginTop: 18,
    marginBottom: 10,
    textAlign: (isRtl ? 'right' : 'left') as 'right' | 'left',
  } as const;
}
