import axios, { type AxiosInstance } from 'axios';

import { API_BASE_URL } from './config';

/**
 * HTTP client. Only used when API_MODE === 'http'. In mock mode, endpoint
 * functions resolve from local fixtures and never touch the network.
 *
 * Auth token is attached lazily through a getter so we don't import the
 * Zustand store from here (services/ never imports features/).
 */
type TokenGetter = () => string | null;

let tokenGetter: TokenGetter = () => null;

export function setTokenGetter(getter: TokenGetter) {
  tokenGetter = getter;
}

export const http: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12_000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

http.interceptors.request.use((config) => {
  const token = tokenGetter();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * 401/403 trigger a sign-out via a registered callback. Same dependency-
 * inversion trick as the token getter — features/auth registers itself.
 */
type SignOutHandler = () => void;
let signOutHandler: SignOutHandler = () => {};
export function setSignOutHandler(handler: SignOutHandler) {
  signOutHandler = handler;
}

http.interceptors.response.use(
  (r) => r,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      signOutHandler();
    }
    return Promise.reject(error);
  },
);
