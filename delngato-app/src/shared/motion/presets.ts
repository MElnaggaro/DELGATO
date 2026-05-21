import { Easing } from 'react-native-reanimated';

/**
 * Brand motion: 150ms micro / 300ms transition · ease-out enter, ease-in exit.
 * No springs. No bounces. Confident and calm.
 */

export const dur = {
  micro: 150,
  transition: 300,
  slow: 600,
} as const;

export const ease = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  in: Easing.bezier(0.7, 0, 0.84, 0),
} as const;

export const timingOut = (duration: number = dur.transition) => ({
  duration,
  easing: ease.out,
});

export const timingIn = (duration: number = dur.micro) => ({
  duration,
  easing: ease.in,
});
