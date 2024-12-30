import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Friend {
  friend_id: string;
  friend_handle: string;
  created_at: string;
}

export function useFriends() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('friends_with_handles')
        .select('friend_id, friend_handle, created_at');

      if (fetchError) throw fetchError;
      setFriends(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load friends');
    } finally {
      setLoading(false);
    }
  };

  const addFriend = async (handle: string) => {
    try {
      const { data, error: addError } = await supabase
        .rpc('add_friend', { friend_handle: handle });

      if (addError) throw addError;
      if (!data) throw new Error('Friend not found');

      await loadFriends();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add friend');
      return false;
    }
  };

  const removeFriend = async (handle: string) => {
    try {
      const { data, error: removeError } = await supabase
        .rpc('remove_friend', { friend_handle: handle });

      if (removeError) throw removeError;
      if (!data) throw new Error('Friend not found');

      await loadFriends();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove friend');
      return false;
    }
  };

  return {
    friends,
    loading,
    error,
    addFriend,
    removeFriend,
    refresh: loadFriends
  };
}