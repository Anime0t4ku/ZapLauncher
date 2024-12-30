/*
  # Create MiSTer Settings Table
  
  1. Tables
    - mister_settings: Stores MiSTer connection settings per user
      - id (uuid, primary key)
      - user_id (uuid, references auth.users)
      - ip_address (text)
      - last_connected (timestamptz)
      - is_connected (boolean)
      - created_at (timestamptz)
      - updated_at (timestamptz)
  
  2. Security
    - Enable RLS
    - Add policies for user access
*/

-- Create base table
CREATE TABLE mister_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  ip_address text NOT NULL,
  last_connected timestamptz,
  is_connected boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add unique constraint
ALTER TABLE mister_settings
ADD CONSTRAINT unique_user_settings UNIQUE (user_id);

-- Add indexes
CREATE INDEX idx_mister_settings_user_id ON mister_settings(user_id);
CREATE INDEX idx_mister_settings_is_connected ON mister_settings(is_connected);

-- Enable RLS
ALTER TABLE mister_settings ENABLE ROW LEVEL SECURITY;

-- Create basic policies
CREATE POLICY "Users can view own settings" ON mister_settings
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON mister_settings
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON mister_settings
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON mister_settings TO authenticated;