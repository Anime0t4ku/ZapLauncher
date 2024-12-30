export type ViewMode = 'grid' | 'list';

export interface Game {
  id: string;
  title: string;
  core: string;
  path?: string;
  lastPlayed?: string;
  favorite: boolean;
  cover_url?: string;
  description?: string;
  releaseYear?: string;
  developer?: string;
  genre?: string;
}