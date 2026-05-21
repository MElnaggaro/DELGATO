import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import {
  AppBar,
  Badge,
  Button,
  Card,
  Chip,
  Divider,
  EmptyState,
  FormInput,
  Icon,
  OfflineBanner,
  OrderProgress,
  Row,
  SearchField,
  Section,
  Spinner,
  Stepper,
} from '@/shared/ui';
import { colors, fonts } from '@/shared/theme';
import { useCurrency } from '@/shared/hooks/useCurrency';

/**
 * /_dev/kit — Storybook-lite. DEV-only route that renders every primitive
 * variant for visual verification against design-system/preview/*.html.
 *
 * Not linked from the app shell.
 */
export default function Kit() {
  const [qty, setQty] = useState(1);
  const [chip, setChip] = useState('all');
  const [search, setSearch] = useState('');
  const [step, setStep] = useState<0 | 1 | 2 | 3>(1);
  const c = useCurrency();

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <AppBar title="Kitchen sink" onBack={() => null} trailing={<Icon.bell />} />
      <OfflineBanner />
      <ScrollView contentContainerStyle={{ paddingBottom: 48 }}>
        <Section label="Buttons">
          <View style={{ gap: 10 }}>
            <Button variant="primary" size="lg" full onPress={() => null}>
              تأكيد الطلب
            </Button>
            <Button variant="secondary" size="lg" full onPress={() => null}>
              أضف للسلة
            </Button>
            <Button variant="tertiary" size="lg" full onPress={() => null}>
              تخطي دلوقتي
            </Button>
            <Button variant="ghost" size="lg" full onPress={() => null}>
              قيّم تجربتك
            </Button>
            <Button variant="solid-gold" size="md" onPress={() => null}>
              عرض اليوم
            </Button>
            <Button variant="primary" size="md" loading onPress={() => null}>
              …
            </Button>
            <Button variant="primary" size="md" disabled onPress={() => null}>
              معطّل
            </Button>
          </View>
        </Section>

        <Section label="Badges">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <Badge variant="active">مفتوح</Badge>
            <Badge variant="pending">قيد التحضير</Badge>
            <Badge variant="issue">في مشكلة</Badge>
            <Badge variant="solid-olive">في الطريق</Badge>
            <Badge variant="solid-gold">عرض اليوم</Badge>
            <Badge variant="solid-ink">جديد</Badge>
            <Badge variant="outline">مغلق</Badge>
          </View>
        </Section>

        <Section label="Chips">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {['all', 'grocery', 'pharmacy', 'food'].map((k) => (
              <Chip key={k} active={chip === k} onPress={() => setChip(k)}>
                {k === 'all'
                  ? 'الكل'
                  : k === 'grocery'
                  ? 'بقالة'
                  : k === 'pharmacy'
                  ? 'صيدلية'
                  : 'أكل'}
              </Chip>
            ))}
          </View>
        </Section>

        <Section label="Search field">
          <SearchField value={search} onChangeText={setSearch} onClear={() => setSearch('')} />
        </Section>

        <Section label="Stepper">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 24 }}>
            <Stepper value={qty} onChange={setQty} min={0} />
            <Stepper value={qty} onChange={setQty} min={1} compact />
          </View>
        </Section>

        <Section label="Card + Row">
          <Card padding={16}>
            <Row label="إجمالي المنتجات" value={c(177)} />
            <Row label="رسوم التوصيل" value={c(10)} />
            <Divider />
            <Row label="الإجمالي" value={c(187)} bold />
          </Card>
        </Section>

        <Section label="Order progress">
          <Card padding={16}>
            <OrderProgress step={step} />
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
              {[0, 1, 2, 3].map((n) => (
                <Chip key={n} active={step === n} onPress={() => setStep(n as 0 | 1 | 2 | 3)}>
                  {String(n)}
                </Chip>
              ))}
            </View>
          </Card>
        </Section>

        <Section label="Form Inputs">
          <View style={{ gap: 14 }}>
            <FormInput label="رقم الموبايل" placeholder="٠١xxxxxxxxx" />
            <FormInput label="العنوان" value="شارع الجلاء · بجوار صيدلية مصر" />
            <FormInput label="كود التحقق" value="١٢٣" error="الكود غلط. حاول تاني." />
            <FormInput label="البريد الإلكتروني (اختياري)" disabled value="—" />
          </View>
        </Section>

        <Section label="Spinner">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 8 }}>
            <Spinner />
            <Spinner size={28} />
            <Text style={{ fontFamily: fonts.arabic, color: colors.inkLight }}>بنحدد مكانك دلوقتي…</Text>
          </View>
        </Section>

        <Section label="Empty state">
          <Card padding={4} elevated>
            <EmptyState
              icon={<Icon.bag size={32} color={colors.olive} />}
              title="السلة فاضية"
              body="ابدأ تطلب من محلات الدلنجات — بقالة، صيدلية، أكل وأكتر."
              action={<Button variant="primary" onPress={() => null}>تصفّح المحلات</Button>}
            />
          </Card>
        </Section>
      </ScrollView>
    </View>
  );
}
