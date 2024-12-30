/*
  # Initial Schema Setup for Game Launcher

  1. New Tables
    - `systems`
      - `id` (text, primary key) - System identifier (e.g., 'nes', 'snes')
      - `name` (text) - Full system name
      - `short_name` (text) - Abbreviated name
      - `icon` (text) - Icon identifier
      - `description` (text) - System description
      - `year` (text) - Release year
      - `manufacturer` (text) - System manufacturer
      - `color` (text) - Theme color
      - `gradient` (text) - CSS gradient
      - `created_at` (timestamptz) - Creation timestamp

    - `games`
      - `id` (uuid, primary key)
      - `title` (text) - Game title
      - `system_id` (text) - Reference to systems table
      - `path` (text) - Game file path
      - `last_played` (timestamptz) - Last played timestamp
      - `favorite` (boolean) - Favorite status
      - `cover_url` (text) - Cover image URL
      - `description` (text) - Game description
      - `release_year` (text) - Release year
      - `developer` (text) - Game developer
      - `genre` (text) - Game genre
      - `user_id` (uuid) - Reference to auth.users
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create systems table
CREATE TABLE systems (
  id text PRIMARY KEY,
  name text NOT NULL,
  short_name text,
  icon text,
  description text,
  year text,
  manufacturer text,
  color text,
  gradient text,
  created_at timestamptz DEFAULT now()
);

-- Create games table
CREATE TABLE games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  system_id text REFERENCES systems(id) ON DELETE CASCADE,
  path text,
  last_played timestamptz,
  favorite boolean DEFAULT false,
  cover_url text,
  description text,
  release_year text,
  developer text,
  genre text,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_system FOREIGN KEY (system_id) REFERENCES systems(id)
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER games_updated_at
  BEFORE UPDATE ON games
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Enable Row Level Security
ALTER TABLE systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- Create policies for systems
CREATE POLICY "Systems are viewable by everyone"
  ON systems
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for games
CREATE POLICY "Users can view their own games"
  ON games
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own games"
  ON games
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own games"
  ON games
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own games"
  ON games
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);