import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

const signIn = async (email: string, password: string) => {
  try {
    // Validate input
    if (!email || !password) {
      return { error: 'Email and password are required' };
    }

    // Attempt sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (signInError) {
      // Map error messages to user-friendly versions
      const errorMessage = signInError.message === 'Invalid login credentials'
        ? 'Invalid email or password'
        : 'Unable to sign in. Please try again.';
      return { error: errorMessage };
    }

    return { error: null };
  } catch (err) {
    console.error('Sign in error:', err);
    return { error: 'Unable to connect to the server. Please try again later.' };
  }
};