/*
  # Add user roles and permissions system

  1. New Tables
    - `user_roles`: Stores user role assignments (admin, parent, child)
    - `age_ratings`: Stores game age rating categories
    - `user_restrictions`: Stores user-specific content restrictions
    - `game_ratings`: Links games to age ratings

  2. Security
    - Enable RLS on new tables
    - Add policies for role-based access
*/

-- Create enum for role types
CREATE TYPE user_role_type AS ENUM ('admin', 'parent', 'child');

-- Create age ratings table
CREATE TABLE age_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  min_age integer NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create user roles table
CREATE TABLE user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role_type NOT NULL DEFAULT 'child',
  parent_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create user restrictions table
CREATE TABLE user_restrictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  max_age_rating uuid REFERENCES age_ratings(id) ON DELETE SET NULL,
  restricted_systems text[],
  allowed_play_times jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create game ratings table
CREATE TABLE game_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid REFERENCES games(id) ON DELETE CASCADE,
  rating_id uuid REFERENCES age_ratings(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(game_id, rating_id)
);

-- Add triggers for updated_at
CREATE TRIGGER user_roles_updated_at
  BEFORE UPDATE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER user_restrictions_updated_at
  BEFORE UPDATE ON user_restrictions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Enable RLS
ALTER TABLE age_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_restrictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_ratings ENABLE ROW LEVEL SECURITY;

-- Create policies for age_ratings
CREATE POLICY "Age ratings are viewable by everyone"
  ON age_ratings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can modify age ratings"
  ON age_ratings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Create policies for user_roles
CREATE POLICY "Users can view their own role"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    parent_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'
    )
  );

CREATE POLICY "Only admins and parents can modify roles"
  ON user_roles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND (user_roles.role = 'admin' OR user_roles.role = 'parent')
    )
  );

-- Create policies for user_restrictions
CREATE POLICY "Users can view their own restrictions"
  ON user_restrictions
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND (user_roles.role = 'admin' OR 
           (user_roles.role = 'parent' AND user_roles.user_id IN (
             SELECT ur.user_id FROM user_roles ur WHERE ur.parent_id = auth.uid()
           )))
    )
  );

CREATE POLICY "Only admins and parents can modify restrictions"
  ON user_restrictions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND (user_roles.role = 'admin' OR 
           (user_roles.role = 'parent' AND user_roles.user_id IN (
             SELECT ur.user_id FROM user_roles ur WHERE ur.parent_id = auth.uid()
           )))
    )
  );

-- Create policies for game_ratings
CREATE POLICY "Game ratings are viewable by everyone"
  ON game_ratings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can modify game ratings"
  ON game_ratings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Insert default age ratings
INSERT INTO age_ratings (name, min_age, description) VALUES
  ('Everyone', 0, 'Content is generally suitable for all ages'),
  ('Everyone 10+', 10, 'Content is generally suitable for ages 10 and up'),
  ('Teen', 13, 'Content is generally suitable for ages 13 and up'),
  ('Mature', 17, 'Content is generally suitable for ages 17 and up');