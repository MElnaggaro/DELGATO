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
  language: 'ar' | 'en';
  /**
   * @deprecated Use `hasSeenIntro` instead. Kept in state for migration; the
   * persist `migrate` step copies its value into `hasSeenIntro` on the first
   * launch of v2 so we don't reset returning users back through the intro.
   */
  hasCompletedOnboarding: boolean;
  /**
   * True once the user has dismissed (or completed) the first-run intro
   * carousel. Replaces the older `hasCompletedOnboarding` flag — see
   * DELGATO_CANONICAL_FLOW_SPEC.md § 5.1.
   */
  hasSeenIntro: boolean;
};

type Actions = {
  setNotification: (key: keyof NotificationPrefs, value: boolean) => void;
  setPrivacy: (key: keyof PrivacyPrefs, value: boolean) => void;
  setLanguage: (lang: 'ar' | 'en') => void;
  markIntroSeen: () => void;
  /** @deprecated Use `markIntroSeen`. Kept until Phase 3 migrates call sites. */
  markOnboardingComplete: () => void;
};

export const useSettingsStore = create<State & Actions>()(
  persist(
    (set) => ({
      notifications: { orders: true, promos: true, news: false, push: true, sms: true },
      privacy: { shareLocation: true, allowMarketing: false, shareUsage: true },
      language: 'ar',
      hasCompletedOnboarding: false,
      hasSeenIntro: false,
      setNotification: (key, value) =>
        set((s) => ({ notifications: { ...s.notifications, [key]: value } })),
      setPrivacy: (key, value) => set((s) => ({ privacy: { ...s.privacy, [key]: value } })),
      setLanguage: (language) => set({ language }),
      markIntroSeen: () => set({ hasSeenIntro: true, hasCompletedOnboarding: true }),
      markOnboardingComplete: () =>
        set({ hasCompletedOnboarding: true, hasSeenIntro: true }),
    }),
    {
      name: 'delngato.settings',
      version: 2,
      storage: createJSONStorage(() => zustandAsyncStorage),
      // Migrate v0/v1 (no version) → v2: seed `hasSeenIntro` from the legacy
      // `hasCompletedOnboarding` flag so returning users don't re-see the intro.
      migrate: (persisted: unknown, version: number): State => {
        const prev = (persisted ?? {}) as Partial<State>;
        if (version < 2) {
          return {
            notifications:
              prev.notifications ?? {
                orders: true,
                promos: true,
                news: false,
                push: true,
                sms: true,
              },
            privacy:
              prev.privacy ?? { shareLocation: true, allowMarketing: false, shareUsage: true },
            language: prev.language ?? 'ar',
            hasCompletedOnboarding: prev.hasCompletedOnboarding ?? false,
            hasSeenIntro: prev.hasSeenIntro ?? prev.hasCompletedOnboarding ?? false,
          };
        }
        return prev as State;
      },
    },
  ),
);
