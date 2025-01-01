import React from 'react';

interface CarouselItemProps {
  children: React.ReactNode;
  aspectRatio?: 'portrait' | 'landscape';
  className?: string;
  onClick?: () => void;
}

export default function CarouselItem({ 
  children, 
  aspectRatio = 'portrait',
  className = '',
  onClick
}: CarouselItemProps) {
  return (
    <div
      className={`flex-none snap-start cursor-pointer group ${
        aspectRatio === 'portrait' ? 'w-[200px]' : 'w-[300px]'
      } ${className}`}
      onClick={onClick}
    >
      <div className={`
        relative overflow-hidden rounded-lg shadow-lg transition-transform 
        duration-300 group-hover:scale-105 group-hover:shadow-xl
        ${aspectRatio === 'portrait' ? 'aspect-[2/3]' : 'aspect-video'}
      `}>
        {children}
      </div>
    </div>
  );
}