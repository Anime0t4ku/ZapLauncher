/*
  # Add updated_at column to systems table

  1. Changes
    - Add updated_at column to systems table
    - Add trigger to automatically update the timestamp
*/

-- Add updated_at column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'systems' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE systems 
    ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Create or replace trigger function
CREATE OR REPLACE FUNCTION update_systems_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS systems_updated_at ON systems;
CREATE TRIGGER systems_updated_at
  BEFORE UPDATE ON systems
  FOR EACH ROW
  EXECUTE FUNCTION update_systems_updated_at();