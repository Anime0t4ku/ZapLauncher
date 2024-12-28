export type ViewMode = 'grid' | 'list';

export interface Game {
  id: string;
  title: string;
  core: string;
  path?: string;
  lastPlayed?: string;
  favorite: boolean;
  coverUrl?: string;
  description?: string;
  releaseYear?: string;
  developer?: string;
  genre?: string;
}