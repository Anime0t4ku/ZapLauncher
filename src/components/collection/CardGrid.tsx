import React from 'react';
import { Star, GamepadIcon, Sparkles } from 'lucide-react';

interface Card {
  nfc_id: string;
  card_type: string;
  rarity: string;
  artwork_url: string;
  game_title?: string;
  system_id?: string;
  collected_at: string;
}

interface CardGridProps {
  cards: Card[];
}

const rarityColors = {
  common: 'bg-gray-500',
  uncommon: 'bg-green-500',
  rare: 'bg-blue-500',
  'ultra-rare': 'bg-purple-500',
  legendary: 'bg-yellow-500'
};

export default function CardGrid({ cards }: CardGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {cards.map((card) => (
        <div
          key={card.nfc_id}
          className="relative group aspect-[3/4] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <img
            src={card.artwork_url || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400'}
            alt={card.game_title || 'Game Card'}
            className="absolute inset-0 w-full h-full object-cover"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-100 group-hover:opacity-90 transition-opacity">
            <div className="absolute top-2 right-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${rarityColors[card.rarity as keyof typeof rarityColors] || 'bg-gray-500'}`}>
                <Sparkles className="w-3 h-3 mr-1" />
                {card.rarity}
              </span>
            </div>

            <div className="absolute bottom-0 p-3 w-full">
              <h3 className="text-white font-semibold truncate mb-1">
                {card.game_title || 'Unknown Game'}
              </h3>
              {card.system_id && (
                <p className="text-gray-300 text-sm flex items-center gap-1">
                  <GamepadIcon className="w-3 h-3" />
                  {card.system_id.toUpperCase()}
                </p>
              )}
              <p className="text-gray-400 text-xs mt-1">
                Collected {new Date(card.collected_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}