import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AppBar, Badge, Card, Icon } from '@/shared/ui';
import { colors, fonts } from '@/shared/theme';
import { safeBack } from '@/shared/utils/nav';

type Method = {
  id: string;
  brand: string;
  last4: string;
  exp: string;
  def: boolean;
};

const INITIAL: Method[] = [
  { id: 'm1', brand: 'فيزا', last4: '٤٢٣٢', exp: '٠٨/٢٧', def: true },
];

export default function PaymentMethods() {
  const router = useRouter();
  const [methods, setMethods] = useState<Method[]>(INITIAL);

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <AppBar title="طرق الدفع" onBack={() => safeBack('/(tabs)/profile')} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 14, paddingBottom: 24 }}>
        <View style={{ gap: 10 }}>
          {methods.map((m) => (
            <Card key={m.id} padding={14}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    backgroundColor: colors.olive,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon.card size={20} color={colors.canvas} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <Text style={{ fontFamily: fonts.arabicSemiBold, fontSize: 14, color: colors.ink }}>
                      {m.brand}
                    </Text>
                    <Text style={{ fontFamily: fonts.arabicMedium, fontSize: 13, color: colors.ink }}>
                      •••• {m.last4}
                    </Text>
                    {m.def ? <Badge variant="active">افتراضي</Badge> : null}
                  </View>
                  <Text
                    style={{ fontFamily: fonts.arabic, fontSize: 12, color: colors.inkLight, marginTop: 2 }}
                  >
                    صلاحية {m.exp}
                  </Text>
                </View>
                <Pressable
                  onPress={() => setMethods(methods.filter((x) => x.id !== m.id))}
                  hitSlop={6}
                  style={{ padding: 4 }}
                >
                  <Icon.trash size={18} color={colors.inkMute} />
                </Pressable>
              </View>
            </Card>
          ))}
        </View>

        <Pressable
          onPress={() => router.push('/payment')}
          style={({ pressed }) => ({
            marginTop: 14,
            borderRadius: 12,
            padding: 16,
            backgroundColor: pressed ? colors.canvas200 : colors.bgElevated,
            borderWidth: 1.5,
            borderColor: colors.canvas300,
            borderStyle: 'dashed',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          })}
        >
          <Icon.plus size={18} color={colors.olive} />
          <Text style={{ fontFamily: fonts.arabicSemiBold, fontSize: 14, color: colors.olive }}>
            ضيف طريقة دفع جديدة
          </Text>
        </Pressable>

        <View
          style={{
            marginTop: 22,
            backgroundColor: colors.canvas200,
            borderRadius: 10,
            padding: 12,
            flexDirection: 'row',
            gap: 10,
          }}
        >
          <Icon.shieldCheck size={16} color={colors.inkLight} />
          <Text style={{ flex: 1, fontFamily: fonts.arabic, fontSize: 12, color: colors.inkLight, lineHeight: 22 }}>
            كل البطاقات مؤمَّنة بتشفير ٢٥٦-بت. دلنجاتُو مش بتحفظ بيانات بطاقتك.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
