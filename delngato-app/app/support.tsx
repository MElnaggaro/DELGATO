import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AppBar, Button, Icon } from '@/shared/ui';
import { FadeUp } from '@/shared/motion';
import { colors, fonts, shadow } from '@/shared/theme';
import { safeBack } from '@/shared/utils/nav';

const FAQS = [
  { q: 'ازاي أعدّل عنواني؟', a: 'من شاشة "حسابي" → "عناويني" تقدر تضيف، تعدّل، أو تختار العنوان الأساسي.' },
  { q: 'ازاي ألغي طلب؟', a: 'تقدر تلغي الطلب من شاشة التتبع لو لسه ما طلعش من المحل. بعد كده اتصل بينا.' },
  { q: 'الدفع كاش متاح؟', a: 'آه — كل المحلات بتقبل دفع كاش عند الاستلام، ومش هتدفع أي رسوم زيادة.' },
  { q: 'مفيش محل بلدي في التطبيق؟', a: 'كلمنا واحنا هنضيفه. بنشتغل علشان نضم كل محلات الدلنجات الواحد بعد التاني.' },
];

export default function Support() {
  const router = useRouter();
  const [open, setOpen] = useState<number | null>(null);
  const [problem, setProblem] = useState('');

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <AppBar title="مركز المساعدة" onBack={() => safeBack('/(tabs)/profile')} />

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Quick contact tiles */}
        <View
          style={{
            paddingHorizontal: 18,
            paddingTop: 14,
            flexDirection: 'row',
            gap: 10,
          }}
        >
          <ContactTile
            icon={<Icon.phone size={22} color={colors.olive} />}
            title="اتصل بينا"
            sub="٩ ص — ١ ص"
            accent="olive"
          />
          <ContactTile
            icon={<Icon.message size={22} color={colors.statusPendingText} />}
            title="شات مباشر"
            sub="رد في دقايق"
            accent="gold"
          />
        </View>

        {/* FAQ */}
        <View style={{ paddingHorizontal: 18, paddingTop: 14 }}>
          <Text
            style={{
              fontFamily: fonts.arabicSemiBold,
              fontSize: 12,
              color: colors.inkMute,
              letterSpacing: 0.4,
              marginBottom: 10,
            }}
          >
            أسئلة شائعة
          </Text>
          <View
            style={{
              backgroundColor: colors.bgElevated,
              borderRadius: 12,
              overflow: 'hidden',
              ...shadow.card,
            }}
          >
            {FAQS.map((f, i) => {
              const isOpen = open === i;
              return (
                <View key={f.q}>
                  <Pressable
                    onPress={() => setOpen(isOpen ? null : i)}
                    style={{
                      paddingVertical: 14,
                      paddingHorizontal: 16,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                    }}
                  >
                    <Text
                      style={{ fontFamily: fonts.arabicSemiBold, fontSize: 14, color: colors.ink, flex: 1 }}
                    >
                      {f.q}
                    </Text>
                    {isOpen ? (
                      <Icon.chevronUp size={18} color={colors.inkLight} />
                    ) : (
                      <Icon.chevronDown size={18} color={colors.inkLight} />
                    )}
                  </Pressable>
                  {isOpen ? (
                    <FadeUp distance={4} style={{ paddingHorizontal: 16, paddingBottom: 14 }}>
                      <Text
                        style={{
                          fontFamily: fonts.arabic,
                          fontSize: 13,
                          color: colors.inkLight,
                          lineHeight: 24,
                        }}
                      >
                        {f.a}
                      </Text>
                    </FadeUp>
                  ) : null}
                  {i < FAQS.length - 1 ? (
                    <View style={{ height: 1, backgroundColor: colors.canvas300, marginHorizontal: 16 }} />
                  ) : null}
                </View>
              );
            })}
          </View>
        </View>

        {/* Report problem */}
        <View style={{ paddingHorizontal: 18, paddingTop: 18 }}>
          <Text
            style={{
              fontFamily: fonts.arabicSemiBold,
              fontSize: 12,
              color: colors.inkMute,
              letterSpacing: 0.4,
              marginBottom: 10,
            }}
          >
            بلّغ عن مشكلة
          </Text>
          <TextInput
            value={problem}
            onChangeText={setProblem}
            multiline
            placeholder="اكتب المشكلة بالتفصيل — احنا بنحلها."
            placeholderTextColor={colors.inkMute}
            style={{
              minHeight: 100,
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
          <View style={{ marginTop: 12 }}>
            <Button variant="primary" full onPress={() => router.back()}>
              إرسال البلاغ
            </Button>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function ContactTile({
  icon,
  title,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
  accent: 'olive' | 'gold';
}) {
  const bg = accent === 'gold' ? 'rgba(232,177,79,0.18)' : 'rgba(31,74,61,0.08)';
  return (
    <Pressable
      style={({ pressed }) => ({
        flex: 1,
        backgroundColor: pressed ? colors.canvas200 : colors.bgElevated,
        borderRadius: 12,
        padding: 14,
        ...shadow.card,
      })}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          backgroundColor: bg,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 10,
        }}
      >
        {icon}
      </View>
      <Text style={{ fontFamily: fonts.arabicSemiBold, fontSize: 14, color: colors.ink }}>
        {title}
      </Text>
      <Text style={{ fontFamily: fonts.arabic, fontSize: 12, color: colors.inkLight, marginTop: 2 }}>
        {sub}
      </Text>
    </Pressable>
  );
}
