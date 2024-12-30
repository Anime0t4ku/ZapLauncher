/*
  # Fix User Handles System

  1. Tables
    - Creates user_handles table for storing user handles
    - Simple structure with user_id, handle, and timestamps
  
  2. Policies
    - Allows authenticated users to view all handles
    - Allows users to update their own handle
  
  3. Functions
    - Handles new user creation with automatic handle generation
    - Provides handle verification and update functionality
*/

-- Drop existing objects if they exist
DROP TABLE IF EXISTS user_handles CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS verify_user_handle(uuid, text);

-- Create user_handles table
CREATE TABLE user_handles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  handle text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_user_handle UNIQUE (user_id),
  CONSTRAINT unique_handle UNIQUE (handle)
);

-- Enable RLS
ALTER TABLE user_handles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all handles"
  ON user_handles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own handle"
  ON user_handles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create function to handle new users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  default_handle text;
  attempts integer := 0;
  max_attempts integer := 10;
BEGIN
  -- Generate default handle from email or random string
  default_handle := COALESCE(
    regexp_replace(
      split_part(NEW.email, '@', 1),
      '[^a-zA-Z0-9_-]',
      '',
      'g'
    ),
    'user'
  );

  -- Ensure valid handle format
  IF length(default_handle) < 3 OR default_handle !~ '^[a-zA-Z0-9][a-zA-Z0-9_-]*$' THEN
    default_handle := 'user' || substr(gen_random_uuid()::text, 1, 8);
  END IF;

  -- Truncate if too long
  default_handle := substring(default_handle from 1 for 20);

  -- Keep trying until we get a unique handle
  WHILE attempts < max_attempts LOOP
    BEGIN
      INSERT INTO user_handles (
        user_id,
        handle,
        created_at,
        updated_at
      )
      VALUES (
        NEW.id,
        default_handle,
        now(),
        now()
      );
      
      RETURN NEW;
    EXCEPTION 
      WHEN unique_violation THEN
        default_handle := substring(default_handle from 1 for 16) 
          || substr(gen_random_uuid()::text, 1, 4);
        attempts := attempts + 1;
      WHEN OTHERS THEN
        RAISE WARNING 'Error creating user handle: %', SQLERRM;
        RETURN NEW;
    END;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Create handle verification function
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
    SELECT 1 FROM user_handles 
    WHERE handle = new_handle 
    AND user_id != verify_user_handle.user_id
  ) THEN
    success := false;
    error := 'This handle is already taken';
    RETURN;
  END IF;

  -- Update handle
  UPDATE user_handles
  SET 
    handle = new_handle,
    updated_at = now()
  WHERE user_id = verify_user_handle.user_id
  RETURNING handle INTO handle;

  IF handle IS NULL THEN
    -- Insert new handle if it doesn't exist
    INSERT INTO user_handles (user_id, handle)
    VALUES (verify_user_handle.user_id, new_handle)
    RETURNING handle INTO handle;
  END IF;

  success := true;
  error := null;
EXCEPTION
  WHEN OTHERS THEN
    success := false;
    error := 'Unable to update handle. Please try again.';
    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON user_handles TO authenticated;