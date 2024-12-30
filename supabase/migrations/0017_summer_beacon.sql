/*
  # Add user handles

  1. Changes
    - Add handle column to user_roles table
    - Add unique constraint for handles
    - Add function to generate default handle
    - Update handle verification function
    - Remove parental control and user management features
*/

-- Remove parental control and user management features
DROP TABLE IF EXISTS user_restrictions CASCADE;
DROP TABLE IF EXISTS age_ratings CASCADE;
DROP TABLE IF EXISTS game_ratings CASCADE;

-- Add handle column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_roles' 
    AND column_name = 'handle'
  ) THEN
    ALTER TABLE user_roles 
    ADD COLUMN handle text;

    -- Add unique constraint
    ALTER TABLE user_roles
    ADD CONSTRAINT unique_handle UNIQUE (handle);
  END IF;
END $$;

-- Function to generate a default handle
CREATE OR REPLACE FUNCTION generate_default_handle(base_handle text)
RETURNS text AS $$
DECLARE
  new_handle text;
  counter integer := 0;
BEGIN
  -- Initial attempt with just the base handle
  new_handle := base_handle;
  
  -- Keep trying with incrementing numbers until we find an unused handle
  WHILE EXISTS (SELECT 1 FROM user_roles WHERE handle = new_handle) LOOP
    counter := counter + 1;
    new_handle := base_handle || counter::text;
  END LOOP;
  
  RETURN new_handle;
END;
$$ LANGUAGE plpgsql;

-- Update handle verification function
CREATE OR REPLACE FUNCTION verify_user_handle(user_id uuid, new_handle text)
RETURNS void AS $$
BEGIN
  -- Validate handle format
  IF new_handle !~ '^[a-zA-Z0-9_-]{3,30}$' THEN
    RAISE EXCEPTION 'Invalid handle format. Use 3-30 characters, letters, numbers, underscore, or hyphen.';
  END IF;

  -- Update handle
  UPDATE user_roles
  SET handle = new_handle
  WHERE user_id = user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Update user_roles type to remove parent role
ALTER TYPE user_role_type RENAME TO user_role_type_old;
CREATE TYPE user_role_type AS ENUM ('admin', 'user');
ALTER TABLE user_roles 
  ALTER COLUMN role TYPE user_role_type 
  USING CASE 
    WHEN role::text = 'parent' THEN 'user'::user_role_type 
    WHEN role::text = 'child' THEN 'user'::user_role_type 
    ELSE role::text::user_role_type 
  END;
DROP TYPE user_role_type_old;

-- Remove parent_id column from user_roles
ALTER TABLE user_roles DROP COLUMN IF EXISTS parent_id;