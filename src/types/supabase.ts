export interface Database {
  public: {
    Tables: {
      games: {
        Row: {
          id: string;
          title: string;
          system_id: string;
          path: string | null;
          last_played: string | null;
          favorite: boolean;
          cover_url: string | null;
          description: string | null;
          release_year: string | null;
          developer: string | null;
          genre: string | null;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
      };
      mister_settings: {
        Row: {
          id: string;
          user_id: string;
          ip_address: string;
          last_connected: string | null;
          is_connected: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: 'admin' | 'parent' | 'child';
          parent_id: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      user_restrictions: {
        Row: {
          id: string;
          user_id: string;
          max_age_rating: string | null;
          restricted_systems: string[];
          allowed_play_times: {
            weekday?: { start: string; end: string };
            weekend?: { start: string; end: string };
          } | null;
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
}