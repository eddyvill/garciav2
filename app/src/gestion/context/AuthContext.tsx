import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { api, type UserProfile } from '../../lib/api';

interface AuthContextValue {
  user: UserProfile | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  getSession: () => Promise<{ user: UserProfile } | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        const token = api.auth.getToken();
        if (token) {
          const { user: profile } = await api.auth.getMe();
          if (isMounted) {
            setUser(profile);
          }
        }
      } catch (err) {
        console.error('[AuthProvider] Error al restaurar sesión:', err);
        api.auth.logout();
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const signIn = useCallback(
    async (email: string, password: string): Promise<string | null> => {
      try {
        const { user: loggedInUser } = await api.auth.login(email, password);
        setUser(loggedInUser);
        return null;
      } catch (err: any) {
        return err.message || 'Error al iniciar sesión';
      }
    },
    []
  );

  const signOut = useCallback(async () => {
    api.auth.logout();
    setUser(null);
  }, []);

  const getSession = useCallback(async () => {
    if (!user) return null;
    return { user };
  }, [user]);

  const value: AuthContextValue = {
    user,
    profile: user,
    loading,
    signIn,
    signOut,
    getSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return ctx;
}
