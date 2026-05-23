import { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { AppBar, Chip, Icon, IconBack, LiveDot } from '@/shared/ui';
import { FadeUp } from '@/shared/motion';
import { colors, fonts } from '@/shared/theme';
import { useRtl } from '@/shared/hooks/useRtl';
import { safeBack } from '@/shared/utils/nav';
import { useChatStore } from '@/features/chat/store';
import { CHAT_QUICK, type ChatPartyKind } from '@/features/chat/data';

export default function Chat() {
  const params = useLocalSearchParams<{ kind?: ChatPartyKind; name?: string; avatar?: string }>();
  const kind = (params.kind === 'merchant' ? 'merchant' : 'driver') as ChatPartyKind;
  const name = params.name ?? (kind === 'merchant' ? 'المحل' : 'محمود السيد');
  const avatar = params.avatar ?? (kind === 'merchant' ? 'م' : 'م');

  const { isRtl, flexDirection } = useRtl();
  const messages = useChatStore((s) => s.messages);
  const typing = useChatStore((s) => s.typing);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const setPartyKind = useChatStore((s) => s.setPartyKind);

  const [text, setText] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    setPartyKind(kind);
  }, [kind, setPartyKind]);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  }, [messages.length, typing]);

  const send = (t?: string) => {
    const msg = (t ?? text).trim();
    if (!msg) return;
    sendMessage(msg, kind);
    setText('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: colors.canvas }}
    >
      {/* Custom AppBar with avatar + presence */}
      <View
        style={{
          flexDirection,
          alignItems: 'center',
          gap: 12,
          paddingHorizontal: 18,
          paddingTop: 14,
          paddingBottom: 12,
          backgroundColor: colors.canvas,
          borderBottomWidth: 1,
          borderBottomColor: colors.canvas300,
        }}
      >
        <Pressable onPress={() => safeBack('/tracking')} hitSlop={8} style={{ padding: 6 }}>
          <IconBack size={24} color={colors.ink} />
        </Pressable>
        <View
          style={{
            width: 38,
            height: 38,
            borderRadius: 100,
            backgroundColor: colors.olive,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontFamily: fonts.arabicBold, fontSize: 16, color: colors.canvas }}>
            {avatar}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: fonts.arabicBold,
              fontSize: 14,
              color: colors.ink,
              textAlign: isRtl ? 'right' : 'left',
            }}
          >
            {name}
          </Text>
          <View style={{ flexDirection, alignItems: 'center', gap: 5, marginTop: 2 }}>
            <LiveDot size={6} color={colors.olive} />
            <Text style={{ fontFamily: fonts.arabic, fontSize: 11, color: colors.olive }}>
              {kind === 'merchant' ? 'المحل متصل دلوقتي' : 'الكابتن متصل دلوقتي'}
            </Text>
          </View>
        </View>
        <Pressable hitSlop={8} style={{ padding: 6 }}>
          <Icon.phone size={22} color={colors.olive} />
        </Pressable>
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ paddingHorizontal: 18, paddingVertical: 14, gap: 8 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ alignSelf: 'center' }}>
          <View
            style={{
              backgroundColor: colors.canvas200,
              borderRadius: 100,
              paddingHorizontal: 12,
              paddingVertical: 4,
            }}
          >
            <Text style={{ fontFamily: fonts.arabicMedium, fontSize: 11, color: colors.inkLight }}>
              الطلب DLN-٢٠٤٧ · دلوقتي
            </Text>
          </View>
        </View>

        {messages.map((m) => {
          const mine = m.from === 'me';
          return (
            <FadeUp key={m.id} distance={4}>
              <View
                style={{
                  alignSelf: mine ? 'flex-start' : 'flex-end',
                  maxWidth: '78%',
                  backgroundColor: mine ? colors.olive : colors.bgElevated,
                  borderColor: colors.canvas300,
                  borderWidth: mine ? 0 : 1,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 14,
                  borderBottomLeftRadius: mine ? 14 : 4,
                  borderBottomRightRadius: mine ? 4 : 14,
                }}
              >
                <Text
                  style={{
                    fontFamily: fonts.arabic,
                    fontSize: 14,
                    color: mine ? colors.canvas : colors.ink,
                    lineHeight: 21,
                  }}
                >
                  {m.text}
                </Text>
                <Text
                  style={{
                    fontFamily: fonts.arabicMedium,
                    fontSize: 10,
                    marginTop: 4,
                    color: mine ? 'rgba(250,248,243,0.7)' : colors.inkMute,
                    textAlign: 'left',
                  }}
                >
                  {m.time}
                </Text>
              </View>
            </FadeUp>
          );
        })}

        {typing ? (
          <FadeUp distance={4}>
            <View
              style={{
                alignSelf: 'flex-end',
                backgroundColor: colors.bgElevated,
                borderColor: colors.canvas300,
                borderWidth: 1,
                paddingHorizontal: 14,
                paddingVertical: 12,
                borderRadius: 14,
                borderBottomRightRadius: 4,
                flexDirection: 'row',
                gap: 4,
              }}
            >
              {[0, 1, 2].map((i) => (
                <View
                  key={i}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 100,
                    backgroundColor: colors.inkMute,
                    opacity: 0.4 + ((i + 1) / 3) * 0.6,
                  }}
                />
              ))}
            </View>
          </FadeUp>
        ) : null}
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 14, paddingVertical: 8, gap: 8 }}
      >
        {CHAT_QUICK.map((q) => (
          <Chip key={q} onPress={() => send(q)}>
            {q}
          </Chip>
        ))}
      </ScrollView>

      <View
        style={{
          flexDirection,
          alignItems: 'flex-end',
          gap: 8,
          paddingHorizontal: 14,
          paddingTop: 8,
          paddingBottom: 18,
          backgroundColor: colors.canvas,
          borderTopWidth: 1,
          borderTopColor: colors.canvas300,
        }}
      >
        <Pressable
          accessibilityLabel="ملحقات"
          hitSlop={6}
          style={{
            width: 40,
            height: 40,
            borderRadius: 100,
            backgroundColor: colors.canvas200,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon.plus size={20} color={colors.inkLight} />
        </Pressable>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="اكتب رسالة…"
          placeholderTextColor={colors.inkMute}
          multiline
          style={{
            flex: 1,
            maxHeight: 100,
            minHeight: 40,
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: 22,
            borderWidth: 1.5,
            borderColor: colors.canvas300,
            backgroundColor: colors.bgElevated,
            fontFamily: fonts.arabic,
            fontSize: 14,
            color: colors.ink,
            textAlign: isRtl ? 'right' : 'left',
            textAlignVertical: 'center',
          }}
        />
        <Pressable
          accessibilityLabel="إرسال"
          hitSlop={6}
          disabled={!text.trim()}
          onPress={() => send()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 100,
            backgroundColor: text.trim() ? colors.olive : colors.canvas300,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconBack size={20} color={colors.canvas} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
