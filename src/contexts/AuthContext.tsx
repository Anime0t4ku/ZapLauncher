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

export const AuthContext = createContext<AuthContextType>({
  user: { id: 'mock-user', email: 'test@example.com' },
  loading: false,
  error: null,
  isAdmin: true,
  isParent: false,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}