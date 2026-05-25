import * as Linking from 'expo-linking';
import { router, type Href } from 'expo-router';

import { parseDeepLink, type ParsedDeepLink } from './DeepLinkRouter';
import { useAuthStore } from '@/features/auth/store';
import { showToast } from '@/shared/ui/toast';
import { getAppState, subscribeAppState } from '@/runtime/AppStateMachine';
import { push as pushPendingDeepLink, drain as drainPendingDeepLink } from '@/runtime/PendingDeepLink';
import { getPushCapabilities } from './capabilities';

function buildHref(parsed: ParsedDeepLink): Href {
  if (parsed.params && Object.keys(parsed.params).length > 0) {
    return { pathname: parsed.path, params: parsed.params } as unknown as Href;
  }
  return parsed.path as Href;
}

function consume(parsed: ParsedDeepLink, navigate: (href: Href) => void): void {
  const state = getAppState();
  const auth = useAuthStore.getState();

  // Auth gating: queue if not yet authed.
  if (parsed.requireAuth && !auth.authed) {
    pushPendingDeepLink({
      path: parsed.path,
      capturedAt: Date.now(),
      ...(parsed.requireRole ? { requireRole: parsed.requireRole } : {}),
    });
    return;
  }

  // Not-ready gating: queue until READY.
  if (state.tag !== 'READY') {
    pushPendingDeepLink({
      path: parsed.path,
      capturedAt: Date.now(),
      ...(parsed.requireRole ? { requireRole: parsed.requireRole } : {}),
    });
    return;
  }

  // Role gating: prompt on mismatch
  if (parsed.requireRole && state.role !== parsed.requireRole) {
    showToast(
      parsed.requireRole === 'merchant'
        ? 'الرابط ده لتطبيق التاجر. بدّل الدور من الإعدادات.'
        : 'الرابط ده لتطبيق العميل. بدّل الدور من الإعدادات.',
    );
    return;
  }

  navigate(buildHref(parsed));
}

export async function initResponseListener(): Promise<void> {
  const { supportsLocalNotifications } = getPushCapabilities();

  // ── Push ─────────────────────────────────────────────
  if (supportsLocalNotifications) {
    try {
      const Notifications = await import('expo-notifications');
      
      Notifications.addNotificationResponseReceivedListener((response) => {
        const link = (response.notification.request.content.data?.deepLink as string | undefined) ?? null;
        if (!link) return;
        const parsed = parseDeepLink(link);
        if (!parsed) return;
        consume(parsed, (href) => router.push(href));
      });

      Notifications.addNotificationReceivedListener((n) => {
        const title = n.request.content.title;
        if (title) showToast(title);
      });
    } catch (err) {
      if (__DEV__) console.warn('[ResponseListener] Failed to initialize push listeners:', err);
    }
  }

  // ── Linking ──────────────────────────────────────────
  Linking.addEventListener('url', ({ url }) => {
    const parsed = parseDeepLink(url);
    if (!parsed) return;
    consume(parsed, (href) => router.push(href));
  });

  void Linking.getInitialURL().then((url) => {
    if (!url) return;
    const parsed = parseDeepLink(url);
    if (!parsed) return;
    consume(parsed, (href) => router.push(href));
  });

  // ── Drain queue when AppState transitions into READY ──────────────
  subscribeAppState((next) => {
    if (next.tag !== 'READY') return;
    const queued = drainPendingDeepLink();
    if (!queued) return;
    const parsed = parseDeepLink(queued.path);
    if (!parsed) return;
    consume(parsed, (href) => router.push(href));
  });
}
