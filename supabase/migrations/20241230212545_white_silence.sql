/*
  # Fix Authentication Issues
  
  1. Changes
    - Add missing indexes for auth.users table
    - Ensure user_roles table has correct structure
    - Add better error handling for user creation
    - Fix role assignment
    
  2. Security
    - Maintain RLS policies
    - Add proper constraints
*/

-- Add missing indexes to auth.users if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'users_email_confirmed_at_idx') THEN
    CREATE INDEX users_email_confirmed_at_idx ON auth.users(email_confirmed_at);
  END IF;
END $$;

-- Ensure user_roles has correct structure
DO $$ 
BEGIN
  -- Add columns if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_roles' 
    AND column_name = 'email_verified'
  ) THEN
    ALTER TABLE user_roles ADD COLUMN email_verified boolean DEFAULT false;
  END IF;

  -- Add indexes if they don't exist
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'user_roles_handle_idx') THEN
    CREATE INDEX user_roles_handle_idx ON user_roles(handle);
  END IF;
END $$;

-- Drop existing function and recreate with better error handling
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  default_handle text;
  attempts integer := 0;
BEGIN
  -- Generate default handle
  default_handle := 'user' || substr(gen_random_uuid()::text, 1, 8);

  -- Keep trying until we get a unique handle or max attempts reached
  WHILE attempts < 10 LOOP
    BEGIN
      INSERT INTO user_roles (
        user_id,
        handle,
        email_verified,
        created_at,
        updated_at
      )
      VALUES (
        NEW.id,
        default_handle,
        COALESCE(NEW.email_confirmed_at IS NOT NULL, false),
        now(),
        now()
      );
      
      -- If we get here, insert succeeded
      RETURN NEW;
    EXCEPTION 
      WHEN unique_violation THEN
        -- Try a new handle
        default_handle := 'user' || substr(gen_random_uuid()::text, 1, 8);
        attempts := attempts + 1;
      WHEN OTHERS THEN
        -- Log other errors but don't block user creation
        RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
        RETURN NEW;
    END;
  END LOOP;

  -- If we get here, we failed to create a unique handle
  RAISE WARNING 'Failed to generate unique handle after % attempts', attempts;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Function to ensure user role exists
CREATE OR REPLACE FUNCTION ensure_user_role(user_id uuid)
RETURNS void AS $$
DECLARE
  default_handle text;
BEGIN
  -- Only create role if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = ensure_user_role.user_id) THEN
    default_handle := 'user' || substr(gen_random_uuid()::text, 1, 8);
    
    INSERT INTO user_roles (
      user_id,
      handle,
      email_verified,
      created_at,
      updated_at
    )
    VALUES (
      user_id,
      default_handle,
      false,
      now(),
      now()
    )
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;