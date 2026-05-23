/**
 * Chat mock data — mirrors design/design-reference/app/data.jsx
 * (CHAT_QUICK, CHAT_HISTORY).
 */

export type ChatPartyKind = 'driver' | 'merchant';
export type ChatMessageFrom = 'me' | ChatPartyKind;

export type ChatMessage = {
  id: string;
  from: ChatMessageFrom;
  text: string;
  time: string;
};

export const CHAT_QUICK = [
  'بس بدقيقة',
  'أنا في الطريق',
  'وصلت',
  'العنوان مظبوط؟',
  'استنّى دقيقة',
];

export const CHAT_HISTORY_INITIAL: ChatMessage[] = [
  { id: 'c1', from: 'driver', text: 'السلام عليكم، أنا في الطريق ليك دلوقتي.', time: '٧:٣٢' },
  { id: 'c2', from: 'me', text: 'وعليكم السلام، تمام يا كابتن.', time: '٧:٣٣' },
  { id: 'c3', from: 'driver', text: 'حضرتك في شارع الجلاء بجوار صيدلية مصر صح؟', time: '٧:٣٣' },
  { id: 'c4', from: 'me', text: 'آه. العمارة البيضا اللي على الناصية.', time: '٧:٣٤' },
];
