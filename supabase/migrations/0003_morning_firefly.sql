/*
  # Add MiSTer FPGA Settings

  1. New Tables
    - `mister_settings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `ip_address` (text)
      - `last_connected` (timestamptz)
      - `is_connected` (boolean)
      - Created/updated timestamps

  2. Security
    - Enable RLS
    - Add policies for user access
*/

CREATE TABLE mister_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  ip_address text NOT NULL,
  last_connected timestamptz,
  is_connected boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add updated_at trigger
CREATE TRIGGER mister_settings_updated_at
  BEFORE UPDATE ON mister_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Enable RLS
ALTER TABLE mister_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own MiSTer settings"
  ON mister_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own MiSTer settings"
  ON mister_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own MiSTer settings"
  ON mister_settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);