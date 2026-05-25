import { Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ShoppingCart, Store as StoreIcon } from 'lucide-react-native';

import { AppBar } from '@/shared/ui/AppBar';
import { FadeUp } from '@/shared/motion';
import { colors, fonts } from '@/shared/theme';
import { safeBack } from '@/shared/utils/nav';

export default function RoleSelection() {
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type: 'login' | 'register' }>();

  const isLogin = type === 'login';
  const title = isLogin ? 'تسجيل الدخول كـ' : 'إنشاء حساب كـ';

  const choose = (role: 'customer' | 'merchant') => {
    if (isLogin) {
      if (role === 'customer') router.push('/(auth)/customer-login' as any);
      else router.push('/(auth)/merchant-login' as any);
    } else {
      if (role === 'customer') router.push('/(auth)/customer-register' as any);
      else router.push('/(auth)/merchant-register' as any);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
        <AppBar onBack={() => safeBack('/(onboarding)/welcome')} />
        <View style={{ flex: 1, padding: 28, justifyContent: 'space-between' }}>
          <FadeUp style={{ marginTop: 18 }}>
            <Text
              style={{
                fontFamily: fonts.arabicBold,
                fontSize: 28,
                color: colors.ink,
                lineHeight: 34,
              }}
            >
              {title}
            </Text>
          </FadeUp>

          <View style={{ gap: 14 }}>
            <RoleTile
              icon={<ShoppingCart size={28} color={colors.olive} />}
              title={isLogin ? 'دخول كعميل' : 'تسجيل عميل جديد'}
              sub="اطلب من محلات الدلنجات"
              onPress={() => choose('customer')}
            />
            <RoleTile
              icon={<StoreIcon size={28} color={colors.olive} />}
              title={isLogin ? 'دخول كتاجر' : 'تسجيل تاجر جديد'}
              sub="إدارة طلبات ومنتجات محلك"
              onPress={() => choose('merchant')}
            />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

function RoleTile({
  icon,
  title,
  sub,
  onPress,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: pressed ? colors.canvas200 : colors.bgElevated,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: colors.canvas300,
        paddingVertical: 22,
        paddingHorizontal: 18,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
      })}
    >
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 14,
          backgroundColor: 'rgba(31,74,61,0.08)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: fonts.arabicBold, fontSize: 18, color: colors.ink }}>
          {title}
        </Text>
        <Text
          style={{
            fontFamily: fonts.arabic,
            fontSize: 13,
            color: colors.inkLight,
            marginTop: 4,
          }}
        >
          {sub}
        </Text>
      </View>
    </Pressable>
  );
}
