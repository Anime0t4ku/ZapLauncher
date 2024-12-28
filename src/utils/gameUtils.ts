import { Game } from '../types';
import { SortOption } from '../components/search/SortSelect';

export function groupGamesByLetter(games: Game[]): Record<string, Game[]> {
  return games.reduce((acc, game) => {
    const firstLetter = game.title[0].toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(game);
    return acc;
  }, {} as Record<string, Game[]>);
}

export function sortGames(games: Game[], sortBy: SortOption): Game[] {
  return [...games].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'lastPlayed':
        if (!a.lastPlayed) return 1;
        if (!b.lastPlayed) return -1;
        return new Date(b.lastPlayed).getTime() - new Date(a.lastPlayed).getTime();
      case 'releaseYear':
        if (!a.releaseYear) return 1;
        if (!b.releaseYear) return -1;
        return parseInt(b.releaseYear) - parseInt(a.releaseYear);
      default:
        return 0;
    }
  });
}