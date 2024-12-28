import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';

type MisterSettings = Database['public']['Tables']['mister_settings']['Row'];

export function useMisterSettings() {
  const [settings, setSettings] = useState<MisterSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError('User not authenticated');
          return;
        }

        const { data, error: fetchError } = await supabase
          .from('mister_settings')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (fetchError) throw fetchError;
        setSettings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load settings');
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  const updateSettings = async (ipAddress: string, isConnected: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const updates = {
        user_id: user.id,
        ip_address: ipAddress,
        is_connected: isConnected,
        last_connected: isConnected ? new Date().toISOString() : null
      };

      if (settings?.id) {
        const { error } = await supabase
          .from('mister_settings')
          .update(updates)
          .eq('id', settings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('mister_settings')
          .insert([updates]);
        if (error) throw error;
      }

      setSettings({ ...settings, ...updates } as MisterSettings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
      throw err;
    }
  };

  return { settings, loading, error, updateSettings };
}