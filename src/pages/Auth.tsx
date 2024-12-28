import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AuthLayout from '../components/auth/AuthLayout';
import SignInForm from '../components/auth/SignInForm';
import SignUpForm from '../components/auth/SignUpForm';
import ResetPasswordForm from '../components/auth/ResetPasswordForm';

type AuthView = 'signIn' | 'signUp' | 'resetPassword';

export default function Auth() {
  const [view, setView] = useState<AuthView>('signIn');
  const { user, loading } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (user) {
    return <Navigate to={from} replace />;
  }

  return (
    <AuthLayout>
      {view === 'signIn' && (
        <SignInForm
          onSignUp={() => setView('signUp')}
          onForgotPassword={() => setView('resetPassword')}
        />
      )}
      {view === 'signUp' && (
        <SignUpForm
          onSignIn={() => setView('signIn')}
        />
      )}
      {view === 'resetPassword' && (
        <ResetPasswordForm
          onBack={() => setView('signIn')}
        />
      )}
    </AuthLayout>
  );
}