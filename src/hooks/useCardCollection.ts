import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Card {
  nfc_id: string;
  card_type: string;
  rarity: string;
  artwork_url: string;
  game_title?: string;
  system_id?: string;
  collected_at: string;
}

export function useCardCollection() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCollection();
  }, []);

  const loadCollection = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('user_collection_details')
        .select('*')
        .order('collected_at', { ascending: false });

      if (fetchError) throw fetchError;
      setCards(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load collection');
    } finally {
      setLoading(false);
    }
  };

  const addCard = async (nfcId: string) => {
    try {
      const { data, error: addError } = await supabase
        .rpc('add_card_to_collection', { nfc_id: nfcId });

      if (addError) throw addError;
      if (!data.success) throw new Error(data.error);

      await loadCollection();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add card');
      return false;
    }
  };

  return {
    cards,
    loading,
    error,
    addCard,
    refresh: loadCollection
  };
}