import React, { useState, useEffect } from 'react';
import { Shield, Clock, Gamepad2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { systems } from '../../data/systems';

interface ParentalControlsProps {
  userId: string;
}

interface Restrictions {
  id?: string;
  max_age_rating?: string;
  restricted_systems: string[];
  allowed_play_times?: {
    weekday?: { start: string; end: string };
    weekend?: { start: string; end: string };
  };
}

export default function ParentalControls({ userId }: ParentalControlsProps) {
  const [restrictions, setRestrictions] = useState<Restrictions>({
    restricted_systems: [],
    allowed_play_times: {
      weekday: { start: '09:00', end: '21:00' },
      weekend: { start: '09:00', end: '22:00' }
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRestrictions();
  }, [userId]);

  async function loadRestrictions() {
    try {
      const { data, error: fetchError } = await supabase
        .from('user_restrictions')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (fetchError) throw fetchError;
      if (data) {
        setRestrictions(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load restrictions');
    } finally {
      setLoading(false);
    }
  }

  async function updateRestrictions(updates: Partial<Restrictions>) {
    try {
      const newRestrictions = { ...restrictions, ...updates };
      
      const { error: updateError } = await supabase
        .from('user_restrictions')
        .upsert({
          user_id: userId,
          ...newRestrictions
        });

      if (updateError) throw updateError;
      setRestrictions(newRestrictions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update restrictions');
    }
  }

  const toggleSystem = (systemId: string) => {
    const currentSystems = restrictions.restricted_systems || [];
    const newSystems = currentSystems.includes(systemId)
      ? currentSystems.filter(id => id !== systemId)
      : [...currentSystems, systemId];
    
    updateRestrictions({ restricted_systems: newSystems });
  };

  const updatePlayTime = (period: 'weekday' | 'weekend', type: 'start' | 'end', value: string) => {
    const newTimes = {
      ...restrictions.allowed_play_times,
      [period]: {
        ...restrictions.allowed_play_times?.[period],
        [type]: value
      }
    };
    updateRestrictions({ allowed_play_times: newTimes });
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="flex items-center gap-2 text-lg font-medium text-gray-900 dark:text-white mb-4">
          <Shield className="w-5 h-5" />
          Age Restrictions
        </h3>
        <select
          value={restrictions.max_age_rating || ''}
          onChange={(e) => updateRestrictions({ max_age_rating: e.target.value })}
          className="w-full max-w-xs bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2"
        >
          <option value="">No age restriction</option>
          <option value="everyone">Everyone (All ages)</option>
          <option value="everyone10">Everyone 10+</option>
          <option value="teen">Teen (13+)</option>
          <option value="mature">Mature (17+)</option>
        </select>
      </div>

      <div>
        <h3 className="flex items-center gap-2 text-lg font-medium text-gray-900 dark:text-white mb-4">
          <Clock className="w-5 h-5" />
          Play Time Restrictions
        </h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Weekdays</h4>
            <div className="flex items-center gap-4">
              <input
                type="time"
                value={restrictions.allowed_play_times?.weekday?.start || '09:00'}
                onChange={(e) => updatePlayTime('weekday', 'start', e.target.value)}
                className="bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1"
              />
              <span className="text-gray-500">to</span>
              <input
                type="time"
                value={restrictions.allowed_play_times?.weekday?.end || '21:00'}
                onChange={(e) => updatePlayTime('weekday', 'end', e.target.value)}
                className="bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1"
              />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Weekends</h4>
            <div className="flex items-center gap-4">
              <input
                type="time"
                value={restrictions.allowed_play_times?.weekend?.start || '09:00'}
                onChange={(e) => updatePlayTime('weekend', 'start', e.target.value)}
                className="bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1"
              />
              <span className="text-gray-500">to</span>
              <input
                type="time"
                value={restrictions.allowed_play_times?.weekend?.end || '22:00'}
                onChange={(e) => updatePlayTime('weekend', 'end', e.target.value)}
                className="bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1"
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="flex items-center gap-2 text-lg font-medium text-gray-900 dark:text-white mb-4">
          <Gamepad2 className="w-5 h-5" />
          Restricted Systems
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {systems.map((system) => (
            <label
              key={system.id}
              className="flex items-center gap-3 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer"
            >
              <input
                type="checkbox"
                checked={restrictions.restricted_systems?.includes(system.id)}
                onChange={() => toggleSystem(system.id)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-gray-900 dark:text-white">{system.name}</span>
            </label>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}