import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Zustand persist adapter wired to AsyncStorage. Used by cart, addresses,
 * favorites, locale preference — non-sensitive state that benefits from
 * cold-start hydration.
 */
export const zustandAsyncStorage = {
  getItem: (key: string) => AsyncStorage.getItem(key),
  setItem: (key: string, value: string) => AsyncStorage.setItem(key, value),
  removeItem: (key: string) => AsyncStorage.removeItem(key),
};

export { AsyncStorage };
