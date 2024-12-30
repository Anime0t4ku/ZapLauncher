import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { AuthContext } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      if (!email || !password) {
        return { error: 'Please enter your email and password' };
      }

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
      console.error('Unexpected error during sign in:', err);
      return { error: 'Unable to connect to the server. Please try again later.' };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      if (!email || !password) {
        return { error: 'Email and password are required' };
      }

      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (signUpError) {
        console.error('Sign up error:', signUpError);
        return { error: signUpError.message };
      }

      return { error: null };
    } catch (err) {
      console.error('Unexpected error during sign up:', err);
      return { error: 'Failed to create account. Please try again.' };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      window.location.replace('/auth');
    } catch (err) {
      console.error('Error signing out:', err);
      // Still attempt to clear state even if API call fails
      setUser(null);
      window.location.replace('/auth');
    }
  };

  const value = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}