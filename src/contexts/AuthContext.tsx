import { createContext, useContext } from 'react';

interface AuthContextType {
  user: any;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  isParent: boolean;
  signIn: () => Promise<{ error: null }>;
  signUp: () => Promise<{ error: null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: { id: '00000000-0000-0000-0000-000000000000', email: 'test@example.com' },
  loading: false,
  error: null,
  isAdmin: true,
  isParent: false,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
});

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { AuthContext };