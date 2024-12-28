import React from 'react';
import { Zap } from 'lucide-react';
import ThemeToggle from '../ThemeToggle';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      <header className="p-4 absolute top-0 left-0 right-0">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Zap className="w-8 h-8 text-blue-500" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              ZapBox
            </span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 mt-16">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md mx-auto backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90 border border-gray-200 dark:border-gray-700">
          {children}
        </div>
      </main>

      <footer className="py-8 text-center text-sm text-gray-600 dark:text-gray-400 absolute bottom-0 left-0 right-0 backdrop-blur-sm">
        <p>
          A fork of the Zaparoo project by{' '}
          <span className="font-medium text-gray-900 dark:text-white">Callan Barrett</span> and{' '}
          <span className="font-medium text-gray-900 dark:text-white">Bjorn Logan</span>
        </p>
      </footer>
    </div>
  );
}