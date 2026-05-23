import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { zustandAsyncStorage } from '@/services/storage';
import {
  CHAT_HISTORY_INITIAL,
  type ChatMessage,
  type ChatPartyKind,
} from './data';

type State = {
  messages: ChatMessage[];
  typing: boolean;
  partyKind: ChatPartyKind;
};

type Actions = {
  sendMessage: (text: string, autoReplyKind?: ChatPartyKind) => void;
  setTyping: (typing: boolean) => void;
  setPartyKind: (kind: ChatPartyKind) => void;
  reset: () => void;
};

function nowAr(): string {
  const d = new Date();
  const hh = d.getHours().toString().padStart(2, '0');
  const mm = d.getMinutes().toString().padStart(2, '0');
  return `${hh}:${mm}`.replace(/[0-9]/g, (n) => '٠١٢٣٤٥٦٧٨٩'[Number(n)]!);
}

export const useChatStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      messages: CHAT_HISTORY_INITIAL,
      typing: false,
      partyKind: 'driver',
      sendMessage: (text, autoReplyKind) => {
        const trimmed = text.trim();
        if (!trimmed) return;
        const time = nowAr();
        set((s) => ({
          messages: [...s.messages, { id: 'c' + Date.now(), from: 'me', text: trimmed, time }],
        }));
        const kind = autoReplyKind ?? get().partyKind;
        const reply =
          kind === 'merchant' ? 'تمام، بنحضّر الطلب دلوقتي.' : 'تمام، أنا في الطريق، استنّى دقيقتين.';
        set({ typing: true });
        setTimeout(() => {
          set((s) => ({
            typing: false,
            messages: [
              ...s.messages,
              { id: 'c' + (Date.now() + 1), from: kind, text: reply, time: nowAr() },
            ],
          }));
        }, 1600);
      },
      setTyping: (typing) => set({ typing }),
      setPartyKind: (partyKind) => set({ partyKind }),
      reset: () => set({ messages: CHAT_HISTORY_INITIAL, typing: false }),
    }),
    {
      name: 'delngato.chat',
      storage: createJSONStorage(() => zustandAsyncStorage),
    },
  ),
);
