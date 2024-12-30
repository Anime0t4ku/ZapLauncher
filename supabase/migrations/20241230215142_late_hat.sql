/*
  # Fix Schema Migration

  1. Tables
    - Create mister_settings table
    - Add missing indexes
    
  2. Security
    - Enable RLS
    - Create policies
*/

-- Create mister_settings table
CREATE TABLE IF NOT EXISTS mister_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  ip_address text NOT NULL,
  last_connected timestamptz,
  is_connected boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_user_settings UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE mister_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own settings"
  ON mister_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON mister_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON mister_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_mister_settings_user_id ON mister_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_mister_settings_is_connected ON mister_settings(is_connected);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON mister_settings TO authenticated;