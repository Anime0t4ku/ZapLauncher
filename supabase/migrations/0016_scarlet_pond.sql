/*
  # Simplify user roles and add handles

  1. Changes
    - Remove parental control features
    - Add handle column to user_roles
    - Add handle verification function
    - Simplify roles to admin/user
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

-- Create new role type and update existing roles
DO $$ 
BEGIN
  -- Create new enum type
  CREATE TYPE user_role_type_new AS ENUM ('admin', 'user');

  -- Update existing roles to new values first
  UPDATE user_roles 
  SET role = CASE 
    WHEN role::text = 'parent' THEN 'user'
    WHEN role::text = 'child' THEN 'user'
    ELSE role::text
  END::text;

  -- Alter the column type
  ALTER TABLE user_roles 
    ALTER COLUMN role DROP DEFAULT,
    ALTER COLUMN role TYPE user_role_type_new USING role::text::user_role_type_new;

  -- Set new default
  ALTER TABLE user_roles 
    ALTER COLUMN role SET DEFAULT 'user'::user_role_type_new;

  -- Drop old type if it exists
  DROP TYPE IF EXISTS user_role_type;

  -- Rename new type to final name
  ALTER TYPE user_role_type_new RENAME TO user_role_type;
END $$;

-- Remove parent_id column
ALTER TABLE user_roles DROP COLUMN IF EXISTS parent_id;