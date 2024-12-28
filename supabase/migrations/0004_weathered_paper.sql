/*
  # Add system cores and cover images

  1. New Tables
    - `system_cores`: Stores available cores for each system
    - `game_covers`: Stores uploaded cover images

  2. Changes
    - Add core_id reference to games table
    - Add cover_id reference to games table

  3. Security
    - Enable RLS on new tables
    - Add policies for authenticated users
*/

-- Create system_cores table
CREATE TABLE system_cores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  system_id text REFERENCES systems(id) ON DELETE CASCADE,
  name text NOT NULL,
  filename text NOT NULL,
  description text,
  version text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(system_id, filename)
);

-- Create game_covers table
CREATE TABLE game_covers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid REFERENCES games(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  width integer,
  height integer,
  size_bytes bigint,
  mime_type text,
  created_at timestamptz DEFAULT now()
);

-- Add references to games table
ALTER TABLE games
ADD COLUMN core_id uuid REFERENCES system_cores(id) ON DELETE SET NULL,
ADD COLUMN cover_id uuid REFERENCES game_covers(id) ON DELETE SET NULL;

-- Create updated_at trigger for system_cores
CREATE TRIGGER system_cores_updated_at
  BEFORE UPDATE ON system_cores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Enable RLS
ALTER TABLE system_cores ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_covers ENABLE ROW LEVEL SECURITY;

-- Create policies for system_cores
CREATE POLICY "System cores are viewable by everyone"
  ON system_cores
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can insert system cores"
  ON system_cores
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can update system cores"
  ON system_cores
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Create policies for game_covers
CREATE POLICY "Users can view game covers"
  ON game_covers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = game_covers.game_id
      AND games.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert covers for their games"
  ON game_covers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = game_covers.game_id
      AND games.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete covers for their games"
  ON game_covers
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = game_covers.game_id
      AND games.user_id = auth.uid()
    )
  );