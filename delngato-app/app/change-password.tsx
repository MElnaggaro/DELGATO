import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AppBar, Button, FieldLabel, Icon, StickyActionBar, STICKY_CTA_HEIGHT, showToast } from '@/shared/ui';
import { colors, fonts } from '@/shared/theme';
import { useRtl } from '@/shared/hooks/useRtl';
import { safeBack } from '@/shared/utils/nav';

export default function ChangePassword() {
  const router = useRouter();
  const { isRtl } = useRtl();
  const [show, setShow] = useState(false);
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');

  const valid = oldPw.length >= 6 && newPw.length >= 6 && newPw === confirmPw;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: colors.canvas }}
    >
      <AppBar title="تغيير كلمة السر" onBack={() => safeBack('/security')} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 10, paddingBottom: STICKY_CTA_HEIGHT + 16 }}>
        <View style={{ gap: 14 }}>
          <FieldLabel label="كلمة السر الحالية">
            <PwInput value={oldPw} onChangeText={setOldPw} show={show} setShow={setShow} isRtl={isRtl} />
          </FieldLabel>
          <FieldLabel label="كلمة السر الجديدة">
            <PwInput value={newPw} onChangeText={setNewPw} show={show} setShow={setShow} isRtl={isRtl} />
          </FieldLabel>
          <FieldLabel label="تأكيد كلمة السر الجديدة">
            <PwInput value={confirmPw} onChangeText={setConfirmPw} show={show} setShow={setShow} isRtl={isRtl} error={!!confirmPw && newPw !== confirmPw} />
          </FieldLabel>
        </View>
      </ScrollView>

      <StickyActionBar>
        <Button
          variant="primary"
          size="lg"
          full
          disabled={!valid}
          onPress={() => {
            showToast('اتغيرت كلمة السر بنجاح', <Icon.check size={16} color={colors.gold} />);
            router.back();
          }}
        >
          حفظ كلمة السر
        </Button>
      </StickyActionBar>
    </KeyboardAvoidingView>
  );
}

function PwInput({
  value,
  onChangeText,
  show,
  setShow,
  isRtl,
  error,
}: {
  value: string;
  onChangeText: (v: string) => void;
  show: boolean;
  setShow: (v: boolean) => void;
  isRtl: boolean;
  error?: boolean;
}) {
  return (
    <View style={{ position: 'relative' }}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={!show}
        style={{
          minHeight: 56,
          backgroundColor: colors.bgElevated,
          borderRadius: 8,
          borderWidth: 1.5,
          borderColor: error ? colors.statusIssue : colors.canvas300,
          paddingHorizontal: 14,
          paddingEnd: 48,
          fontFamily: fonts.arabic,
          fontSize: 17,
          color: colors.ink,
          textAlign: isRtl ? 'right' : 'left',
        }}
      />
      <Pressable
        onPress={() => setShow(!show)}
        hitSlop={6}
        style={{
          position: 'absolute',
          insetInlineEnd: 8,
          top: 0,
          bottom: 0,
          width: 40,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {show ? <Icon.x size={18} color={colors.inkLight} /> : <Icon.search size={18} color={colors.inkLight} />}
      </Pressable>
    </View>
  );
}
