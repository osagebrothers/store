import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { fetchCurrentUser, loginUrl, logoutUrl, signupUrl, User } from './iam';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signIn: (returnPath?: string) => void;
  signUp: (returnPath?: string) => void;
  signOut: (returnPath?: string) => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setUser(await fetchCurrentUser());
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const signIn = (returnPath?: string) => {
    window.location.href = loginUrl(returnPath);
  };
  const signUp = (returnPath?: string) => {
    window.location.href = signupUrl(returnPath);
  };
  const signOut = (returnPath?: string) => {
    window.location.href = logoutUrl(returnPath);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
