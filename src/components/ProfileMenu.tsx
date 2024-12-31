import React, { useState, useRef, useEffect } from 'react';
import { User, Settings, LogOut, Edit } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

interface ProfileMenuProps {
  onOpenSettings: () => void;
}

export default function ProfileMenu({ onOpenSettings }: ProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [handle, setHandle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isEditingHandle, setIsEditingHandle] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAuth();

  useEffect(() => {
    async function loadUserHandle() {
      if (!user) return;
      const { data, error } = await supabase
        .from('user_handles')
        .select('handle')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error loading handle:', error);
        return;
      }

      if (data && data.length > 0) {
        setHandle(data[0].handle);
      } else {
        console.warn('No handle found for user');
      }
    }

    loadUserHandle();
  }, [user]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updateHandle = async (newHandle: string) => {
    if (!user) return;
    if (!newHandle.trim()) return;
    if (newHandle === handle) {
      setIsEditingHandle(false);
      return;
    }

    setError(null);

    try {
      const { data, error: verifyError } = await supabase.rpc('verify_user_handle', {
        user_id: user.id,
        new_handle: newHandle
      });

      if (verifyError) throw verifyError;

      if (data && data.success) {
        setHandle(data.handle);
        setIsEditingHandle(false);
      } else {
        throw new Error(data?.error || 'Failed to update handle');
      }
    } catch (error) {
      console.error('Failed to update handle:', error);
      setError(error instanceof Error ? error.message : 'Failed to update handle');
      setIsEditingHandle(true);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
      >
        <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">Signed in as</p>
              <button
                onClick={() => setIsEditingHandle(!isEditingHandle)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <Edit className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            {isEditingHandle ? (
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value.trim())}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    updateHandle(handle);
                  } else if (e.key === 'Escape') {
                    setIsEditingHandle(false);
                    setError(null);
                  }
                }}
                onBlur={() => {
                  if (handle.trim()) {
                    updateHandle(handle);
                  } else {
                    setIsEditingHandle(false);
                    setError(null);
                  }
                }}
                className="mt-1 w-full px-2 py-1 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                placeholder="Enter handle..."
                autoFocus
                maxLength={30}
                pattern="^[a-zA-Z0-9][a-zA-Z0-9_-]*$"
              />
            ) : (
              <p className="mt-1 font-medium text-gray-900 dark:text-white">
                {handle || 'Set handle'}
              </p>
            )}
            {error && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {user?.email}
            </p>
          </div>

          <div className="py-2">
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenSettings();
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
            <button 
              onClick={async () => {
                setIsOpen(false);
                try {
                  await signOut();
                  window.location.href = '/auth';
                } catch (error) {
                  console.error('Error signing out:', error);
                }
              }}
              className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}