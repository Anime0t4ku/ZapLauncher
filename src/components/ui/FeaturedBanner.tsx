import React from 'react';
import { Play, Info } from 'lucide-react';

interface FeaturedBannerProps {
  title: string;
  description: string;
  imageUrl: string;
  onPlay?: () => void;
  onInfo?: () => void;
}

export default function FeaturedBanner({
  title,
  description,
  imageUrl,
  onPlay,
  onInfo
}: FeaturedBannerProps) {
  return (
    <div className="relative h-[80vh] min-h-[600px]">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50" />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-end pb-20 px-8">
        <div className="max-w-2xl space-y-6">
          <h1 className="text-5xl font-bold text-white">{title}</h1>
          <p className="text-lg text-gray-200">{description}</p>
          
          <div className="flex gap-4">
            <button
              onClick={onPlay}
              className="flex items-center gap-2 px-8 py-3 bg-white text-gray-900 rounded-lg
                font-semibold hover:bg-gray-100 transition-colors"
            >
              <Play className="w-5 h-5" />
              Play
            </button>
            
            <button
              onClick={onInfo}
              className="flex items-center gap-2 px-8 py-3 bg-gray-500/70 text-white rounded-lg
                font-semibold hover:bg-gray-500/80 transition-colors"
            >
              <Info className="w-5 h-5" />
              More Info
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}