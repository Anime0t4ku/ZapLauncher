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
          .select()
          .eq('user_id', user.id);

        if (fetchError) {
          if (fetchError.code === 'PGRST116') {
            // No settings found - this is okay for new users
            setSettings(null);
          } else {
            throw fetchError;
          }
        } else {
          setSettings(data?.[0] || null);
        }
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
      if (!user) {
        setError('User not authenticated');
        return;
      }

      const updates = {
        user_id: user.id,
        ip_address: ipAddress,
        is_connected: isConnected,
        last_connected: isConnected ? new Date().toISOString() : null
      };

      let result;
      if (settings?.id) {
        result = await supabase
          .from('mister_settings')
          .update(updates)
          .eq('id', settings.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('mister_settings')
          .insert([updates])
          .select()
          .single();
      }

      if (result.error) throw result.error;
      setSettings(result.data as MisterSettings);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
      throw err;
    }
  };

  return { settings, loading, error, updateSettings };
}