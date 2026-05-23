import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { zustandAsyncStorage } from '@/services/storage';

export type NotificationPrefs = {
  orders: boolean;
  promos: boolean;
  news: boolean;
  push: boolean;
  sms: boolean;
};

export type PrivacyPrefs = {
  shareLocation: boolean;
  allowMarketing: boolean;
  shareUsage: boolean;
};

type State = {
  notifications: NotificationPrefs;
  privacy: PrivacyPrefs;
  biometricEnabled: boolean;
  language: 'ar' | 'en';
};

type Actions = {
  setNotification: (key: keyof NotificationPrefs, value: boolean) => void;
  setPrivacy: (key: keyof PrivacyPrefs, value: boolean) => void;
  setBiometricEnabled: (enabled: boolean) => void;
  setLanguage: (lang: 'ar' | 'en') => void;
};

export const useSettingsStore = create<State & Actions>()(
  persist(
    (set) => ({
      notifications: { orders: true, promos: true, news: false, push: true, sms: true },
      privacy: { shareLocation: true, allowMarketing: false, shareUsage: true },
      biometricEnabled: false,
      language: 'ar',
      setNotification: (key, value) =>
        set((s) => ({ notifications: { ...s.notifications, [key]: value } })),
      setPrivacy: (key, value) => set((s) => ({ privacy: { ...s.privacy, [key]: value } })),
      setBiometricEnabled: (biometricEnabled) => set({ biometricEnabled }),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'delngato.settings',
      storage: createJSONStorage(() => zustandAsyncStorage),
    },
  ),
);
