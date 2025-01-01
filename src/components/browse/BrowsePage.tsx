import React from 'react';
import FeaturedBanner from '../ui/FeaturedBanner';
import Carousel from '../ui/Carousel';
import CarouselItem from '../ui/CarouselItem';
import { useZaparoo } from '../../hooks/useZaparoo';
import { games } from '../../data/mockData';
import { systems } from '../../data/systems';

export default function BrowsePage() {
  const { launchGame } = useZaparoo();

  const featuredGame = games[0];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <FeaturedBanner
        title={featuredGame.title}
        description={featuredGame.description || ''}
        imageUrl={featuredGame.cover_url || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f'}
        onPlay={() => featuredGame.path && launchGame(featuredGame.path)}
      />

      <div className="-mt-32 relative z-10">
        <Carousel title="Popular Systems">
          {systems.map((system) => (
            <CarouselItem key={system.id} aspectRatio="landscape">
              <div className={`absolute inset-0 bg-gradient-to-br ${system.gradient || 'from-blue-500 to-blue-600'}`}>
                <div className="absolute inset-0 p-6 flex flex-col justify-between">
                  <h3 className="text-xl font-bold text-white">{system.name}</h3>
                  <p className="text-white/80 text-sm">{system.manufacturer}</p>
                </div>
              </div>
            </CarouselItem>
          ))}
        </Carousel>

        <Carousel title="Recently Added">
          {games.map((game) => (
            <CarouselItem key={game.id}>
              <img
                src={game.cover_url || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f'}
                alt={game.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 p-4">
                  <h3 className="text-white font-semibold">{game.title}</h3>
                  <p className="text-gray-200 text-sm">{game.developer}</p>
                </div>
              </div>
            </CarouselItem>
          ))}
        </Carousel>

        <Carousel title="Your Collection">
          {games.filter(g => g.favorite).map((game) => (
            <CarouselItem key={game.id}>
              <img
                src={game.cover_url || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f'}
                alt={game.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 p-4">
                  <h3 className="text-white font-semibold">{game.title}</h3>
                  <p className="text-gray-200 text-sm">{game.system_id}</p>
                </div>
              </div>
            </CarouselItem>
          ))}
        </Carousel>
      </div>
    </div>
  );
}