import { router } from 'expo-router';

type ReplaceArg = Parameters<typeof router.replace>[0];

export function safeBack(fallback: ReplaceArg) {
  if (router.canGoBack()) router.back();
  else router.replace(fallback);
}
