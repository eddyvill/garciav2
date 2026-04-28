import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import type { UserProfile } from '../../lib/database.types';

// ── Context value shape ──────────────────────────────────────────────
interface AuthContextValue {
  /** Supabase Auth user (null when signed out) */
  user: User | null;
  /** User profile from the `profiles` table (includes role) */
  profile: UserProfile | null;
  /** True while the initial session is being restored */
  loading: boolean;
  /** Sign in with email + password. Returns an error string on failure, null on success. */
  signIn: (email: string, password: string) => Promise<string | null>;
  /** Sign the current user out */
  signOut: () => Promise<void>;
  /** Return the current Supabase session (or null) */
  getSession: () => Promise<Session | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ── Helper: fetch profile row ────────────────────────────────────────
async function fetchProfile(userId: string): Promise<UserProfile | null> {
  console.log('[AuthProvider] Fetching profile for:', userId);
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId);

    console.log('[AuthProvider] Profile result:', { data, error });

    if (error) {
      console.error('[AuthProvider] Error fetching profile:', error.message);
      return null;
    }

    if (!data || data.length === 0) {
      console.error('[AuthProvider] No profile found for user:', userId);
      return null;
    }

    return data[0] as UserProfile;
  } catch (err) {
    console.error('[AuthProvider] Profile fetch failed:', err);
    return null;
  }
}

// ── Provider ─────────────────────────────────────────────────────────
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount + listen for auth changes
  useEffect(() => {
    let isMounted = true;

    // 1. Restore existing session
    const restoreSession = async () => {
      try {
        console.log('[AuthProvider] Restoring session...');
        const {
          data: { session },
        } = await supabase.auth.getSession();

        console.log('[AuthProvider] Session:', session ? 'found' : 'none');
        if (!isMounted) return;

        if (session?.user) {
          setUser(session.user);
          const userProfile = await fetchProfile(session.user.id);
          console.log('[AuthProvider] Profile loaded:', userProfile);
          if (isMounted) setProfile(userProfile);
        }
      } catch (err) {
        console.error('[AuthProvider] Session restore failed:', err);
      } finally {
        console.log('[AuthProvider] Setting loading to false');
        if (isMounted) setLoading(false);
      }
    };

    restoreSession();

    // 2. Subscribe to auth state changes (sign-in, sign-out, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        const userProfile = await fetchProfile(session.user.id);
        if (isMounted) setProfile(userProfile);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        setUser(session.user);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // ── signIn ───────────────────────────────────────────────────────
  const signIn = useCallback(
    async (email: string, password: string): Promise<string | null> => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return mapAuthError(error);
      }

      // Profile is loaded by the onAuthStateChange listener
      return null;
    },
    [],
  );

  // ── signOut ──────────────────────────────────────────────────────
  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    // State is cleared by the onAuthStateChange listener
  }, []);

  // ── getSession ───────────────────────────────────────────────────
  const getSession = useCallback(async (): Promise<Session | null> => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session;
  }, []);

  const value: AuthContextValue = {
    user,
    profile,
    loading,
    signIn,
    signOut,
    getSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ── Hook ─────────────────────────────────────────────────────────────
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return ctx;
}

// ── Error mapping ────────────────────────────────────────────────────
// Returns a user-friendly, generic message so we don't leak which field
// was wrong (requirement 1.1 — secure auth).
function mapAuthError(error: AuthError): string {
  switch (error.message) {
    case 'Invalid login credentials':
      return 'Correo o contraseña incorrectos';
    case 'Email not confirmed':
      return 'Correo electrónico no confirmado';
    default:
      return 'Error al iniciar sesión. Intente nuevamente.';
  }
}
