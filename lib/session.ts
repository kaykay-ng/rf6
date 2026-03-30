import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const KEY = 'clash_session';
const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

type Session = {
  campId: string;
  campName: string;
  address: string;
  pinHash: string;
  savedAt: number;
};

export type { Session };

const store = {
  async get(key: string): Promise<string | null> {
    if (Platform.OS === 'web') return localStorage.getItem(key);
    return SecureStore.getItemAsync(key);
  },
  async set(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') { localStorage.setItem(key, value); return; }
    await SecureStore.setItemAsync(key, value);
  },
  async del(key: string): Promise<void> {
    if (Platform.OS === 'web') { localStorage.removeItem(key); return; }
    await SecureStore.deleteItemAsync(key);
  },
};

export async function saveSession(s: Omit<Session, 'savedAt'>): Promise<void> {
  await store.set(KEY, JSON.stringify({ ...s, savedAt: Date.now() }));
}

export async function loadSession(): Promise<Session | null> {
  const raw = await store.get(KEY);
  if (!raw) return null;
  try {
    const s: Session = JSON.parse(raw);
    if (Date.now() - s.savedAt > TTL_MS) { await clearSession(); return null; }
    return s;
  } catch {
    await clearSession();
    return null;
  }
}

export async function clearSession(): Promise<void> {
  await store.del(KEY);
}
