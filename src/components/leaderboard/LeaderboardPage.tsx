import React from 'react';
import { Trophy, Medal, Users, Star } from 'lucide-react';
import Carousel from '../ui/Carousel';
import CarouselItem from '../ui/CarouselItem';

interface PlayerStats {
  handle: string;
  total_points: number;
  games_played: number;
  total_playtime: string;
  rank?: number;
}

const mockPlayers: PlayerStats[] = [
  { handle: "ProGamer123", total_points: 15750, games_played: 142, total_playtime: "168:30:00", rank: 1 },
  { handle: "RetroKing", total_points: 12340, games_played: 98, total_playtime: "124:45:00", rank: 2 },
  { handle: "PixelMaster", total_points: 8920, games_played: 76, total_playtime: "89:15:00", rank: 3 },
];

export default function LeaderboardPage() {
  const topPlayer = mockPlayers[0];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      {/* Featured Player Banner */}
      <div className="relative h-[60vh] min-h-[500px] mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-600" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511512578047-dfb367046420')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50" />
        
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-8 h-8 text-yellow-500" />
              <span className="text-yellow-400 font-semibold text-xl">
                #1 Player
              </span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              {topPlayer.handle}
            </h1>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="text-white">
                  {topPlayer.total_points.toLocaleString()} points
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                <span className="text-white">
                  {topPlayer.games_played} games played
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Players */}
      <Carousel title="Top Players">
        {mockPlayers.map((player) => (
          <CarouselItem key={player.handle} aspectRatio="landscape">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-600">
              <div className="absolute inset-0 p-6 flex flex-col justify-between">
                <div className="flex items-center gap-2">
                  <Medal className={`w-6 h-6 ${
                    player.rank === 1 ? 'text-yellow-400' :
                    player.rank === 2 ? 'text-gray-300' :
                    'text-amber-700'
                  }`} />
                  <span className="text-white font-bold">#{player.rank}</span>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {player.handle}
                  </h3>
                  <p className="text-white/80">
                    {player.total_points.toLocaleString()} points
                  </p>
                  <p className="text-white/60 text-sm">
                    {player.games_played} games played
                  </p>
                </div>
              </div>
            </div>
          </CarouselItem>
        ))}
      </Carousel>
    </div>
  );
}