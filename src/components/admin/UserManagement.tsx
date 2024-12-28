import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Shield, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import type { Database } from '../../types/supabase';

type UserRole = Database['public']['Tables']['user_roles']['Row'];

interface UserWithRole {
  id: string;
  email: string;
  role: UserRole['role'];
  parent_id: string | null;
}

export default function UserManagement() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();
      if (authError) throw authError;

      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');
      if (rolesError) throw rolesError;

      const combinedUsers = authUsers.map(authUser => {
        const userRole = roles?.find(role => role.user_id === authUser.id);
        return {
          id: authUser.id,
          email: authUser.email || '',
          role: userRole?.role || 'child',
          parent_id: userRole?.parent_id
        };
      });

      setUsers(combinedUsers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  const updateUserRole = async (userId: string, role: UserRole['role']) => {
    try {
      const { error: updateError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role,
          updated_at: new Date().toISOString()
        });

      if (updateError) throw updateError;

      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId ? { ...user, role } : user
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user role');
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          User Management
        </h3>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          onClick={() => {/* TODO: Implement invite user */}}
        >
          <UserPlus className="w-4 h-4" />
          Invite User
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-gray-200 dark:border-gray-700">
              <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                Email
              </th>
              <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                Role
              </th>
              <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                  {user.email}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.role === 'admin'
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                      : user.role === 'parent'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                  }`}>
                    <Shield className="w-3 h-3" />
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={user.role}
                    onChange={(e) => updateUserRole(user.id, e.target.value as UserRole['role'])}
                    disabled={user.id === currentUser?.id}
                    className="text-sm bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1"
                  >
                    <option value="admin">Admin</option>
                    <option value="parent">Parent</option>
                    <option value="child">Child</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}