/*
  # Fix Authentication Flow
  
  1. Changes
    - Simplify user role creation
    - Add better error handling
    - Improve handle generation
    
  2. Security
    - Proper error handling in functions
    - Better transaction management
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Create improved function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  default_handle text;
BEGIN
  -- Use transaction for atomicity
  BEGIN
    -- Generate simple default handle
    default_handle := 'user' || substr(gen_random_uuid()::text, 1, 8);

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
      false,
      now(),
      now()
    );

    RETURN NEW;
  EXCEPTION
    WHEN unique_violation THEN
      -- Handle already exists, try again with new random suffix
      default_handle := 'user' || substr(gen_random_uuid()::text, 1, 8);
      
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
        false,
        now(),
        now()
      );
      
      RETURN NEW;
    WHEN OTHERS THEN
      -- Log error but don't block user creation
      RAISE WARNING 'Error creating user role: %', SQLERRM;
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

-- Update handle verification function
CREATE OR REPLACE FUNCTION verify_user_handle(
  user_id uuid,
  new_handle text,
  OUT success boolean,
  OUT error text,
  OUT handle text
)
RETURNS record AS $$
BEGIN
  -- Validate handle format
  IF new_handle !~ '^[a-zA-Z0-9][a-zA-Z0-9_-]{2,29}$' THEN
    success := false;
    error := 'Handle must start with a letter or number and be 3-30 characters';
    RETURN;
  END IF;

  -- Check if handle is taken
  IF EXISTS (
    SELECT 1 FROM user_roles 
    WHERE handle = new_handle 
    AND user_id != verify_user_handle.user_id
  ) THEN
    success := false;
    error := 'This handle is already taken';
    RETURN;
  END IF;

  -- Update handle within transaction
  BEGIN
    UPDATE user_roles
    SET 
      handle = new_handle,
      updated_at = now()
    WHERE user_id = verify_user_handle.user_id
    RETURNING handle INTO handle;

    success := true;
    error := null;
  EXCEPTION
    WHEN OTHERS THEN
      success := false;
      error := 'Unable to update handle. Please try again.';
      RETURN;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;