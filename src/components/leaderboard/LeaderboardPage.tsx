import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Clock, Gamepad } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface PlayerStats {
  user_id: string;
  total_points: number;
  games_played: number;
  total_playtime: string;
  user_email?: string;
}

export default function LeaderboardPage() {
  const [players, setPlayers] = useState<PlayerStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadLeaderboard() {
      try {
        const { data: stats, error: statsError } = await supabase
          .from('player_stats')
          .select('*')
          .order('total_points', { ascending: false });

        if (statsError) throw statsError;

        // Get user emails in a separate query
        const { data: users } = await supabase.auth.admin.listUsers();
        const userMap = new Map(users?.users.map(u => [u.id, u.email]) || []);

        const formattedStats = stats.map(stat => ({
          user_id: stat.user_id,
          total_points: stat.total_points,
          games_played: stat.games_played,
          total_playtime: stat.total_playtime,
          user_email: userMap.get(stat.user_id) || 'Unknown User'
        }));

        setPlayers(formattedStats);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
      } finally {
        setLoading(false);
      }
    }

    loadLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex items-center gap-2 mb-8">
        <Trophy className="w-6 h-6 text-yellow-500" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Leaderboard
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {players.slice(0, 3).map((player, index) => (
          <div
            key={player.user_id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 relative overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-16 h-16 ${
              index === 0 ? 'bg-yellow-500' :
              index === 1 ? 'bg-gray-400' :
              'bg-amber-700'
            } transform rotate-45 translate-x-8 -translate-y-8`} />
            
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {index + 1}. {player.user_email?.split('@')[0]}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {player.total_points.toLocaleString()} pts
                </p>
              </div>
              <Medal className={`w-8 h-8 ${
                index === 0 ? 'text-yellow-500' :
                index === 1 ? 'text-gray-400' :
                'text-amber-700'
              }`} />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Gamepad className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {player.games_played} games
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {Math.floor(parseInt(player.total_playtime) / 3600)}h played
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Player
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Points
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Games
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Time Played
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {players.map((player, index) => (
                <tr key={player.user_id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {player.user_email?.split('@')[0]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {player.total_points.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {player.games_played}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {Math.floor(parseInt(player.total_playtime) / 3600)}h
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}