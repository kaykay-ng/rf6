import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { loadSession, clearSession as clearStoredSession, type Session } from '@/lib/session';

type Ctx = {
  session: Session | null;
  loading: boolean;
  reload: () => Promise<void>;
  logout: () => Promise<void>;
};

const SessionContext = createContext<Ctx | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  async function reload() {
    const s = await loadSession();
    setSession(s);
  }

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, []);

  async function logout() {
    await clearStoredSession();
    setSession(null);
  }

  return (
    <SessionContext.Provider value={{ session, loading, reload, logout }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside SessionProvider');
  return ctx;
}
