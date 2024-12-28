import React from 'react';
import { AuthContext } from '../../contexts/AuthContext';

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const mockAuth = {
    user: { id: '00000000-0000-0000-0000-000000000000', email: 'test@example.com' },
    loading: false,
    error: null,
    isAdmin: true,
    isParent: false,
    signIn: async () => ({ error: null }),
    signUp: async () => ({ error: null }),
    signOut: async () => {},
  };

  return (
    <AuthContext.Provider value={mockAuth}>
      {children}
    </AuthContext.Provider>
  );
}