/*
  # Fix auth system and user creation
  
  1. Changes
    - Improve error handling in handle_new_user function
    - Add better handle validation
    - Add proper error logging
    
  2. Security
    - Ensure proper user role creation
    - Add transaction handling
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Create improved function to handle new user signup with better error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  default_handle text;
  clean_email text;
BEGIN
  -- Use transaction for atomicity
  BEGIN
    -- Extract username part from email and clean it
    clean_email := regexp_replace(
      split_part(NEW.email, '@', 1),
      '[^a-zA-Z0-9_-]',
      '',
      'g'
    );
    
    -- Ensure minimum length and valid format
    IF length(clean_email) < 3 OR clean_email !~ '^[a-zA-Z0-9][a-zA-Z0-9_-]*$' THEN
      clean_email := 'user' || substr(gen_random_uuid()::text, 1, 8);
    END IF;
    
    -- Truncate if too long
    default_handle := substring(clean_email from 1 for 20);
    
    -- Add random suffix if handle exists
    WHILE EXISTS (SELECT 1 FROM user_roles WHERE handle = default_handle) LOOP
      default_handle := substring(clean_email from 1 for 16) || substr(gen_random_uuid()::text, 1, 4);
    END LOOP;

    -- Insert new user role with generated handle
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
    )
    ON CONFLICT (user_id) DO UPDATE
    SET
      handle = EXCLUDED.handle,
      email_verified = EXCLUDED.email_verified,
      updated_at = now()
    WHERE user_roles.handle IS NULL;

    RETURN NEW;
  EXCEPTION
    WHEN OTHERS THEN
      -- Log error details
      RAISE WARNING 'Error in handle_new_user for user %: %', NEW.id, SQLERRM;
      -- Still return NEW to allow user creation even if role creation fails
      RETURN NEW;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();