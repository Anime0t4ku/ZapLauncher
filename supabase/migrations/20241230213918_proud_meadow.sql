/*
  # Initial Schema Setup

  1. Tables
    - `user_handles`: Stores user handles
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `handle` (text, unique)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `friends`: Manages friend relationships
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `friend_id` (uuid, references auth.users)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for handle viewing and updating
    - Add policies for friend management
*/

-- Create user_handles table
CREATE TABLE user_handles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  handle text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_user_handle UNIQUE (user_id),
  CONSTRAINT unique_handle UNIQUE (handle)
);

-- Create friends table
CREATE TABLE friends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, friend_id)
);

-- Enable RLS
ALTER TABLE user_handles ENABLE ROW LEVEL SECURITY;
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

-- Create policies for user_handles
CREATE POLICY "Users can view all handles"
  ON user_handles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own handle"
  ON user_handles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for friends
CREATE POLICY "Users can view their own friends"
  ON friends FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add friends"
  ON friends FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove friends"
  ON friends FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create handle management functions
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

-- Create trigger for new user signup
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

  success := true;
  error := null;
EXCEPTION
  WHEN OTHERS THEN
    success := false;
    error := 'Unable to update handle. Please try again.';
    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create friend management functions
CREATE OR REPLACE FUNCTION add_friend(friend_handle text)
RETURNS boolean AS $$
DECLARE
  friend_user_id uuid;
BEGIN
  -- Get friend's user_id from handle
  SELECT user_id INTO friend_user_id
  FROM user_handles
  WHERE handle = friend_handle;

  IF friend_user_id IS NULL THEN
    RETURN false;
  END IF;

  -- Add friend
  INSERT INTO friends (user_id, friend_id)
  VALUES (auth.uid(), friend_user_id)
  ON CONFLICT (user_id, friend_id) DO NOTHING;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION remove_friend(friend_handle text)
RETURNS boolean AS $$
DECLARE
  friend_user_id uuid;
BEGIN
  -- Get friend's user_id from handle
  SELECT user_id INTO friend_user_id
  FROM user_handles
  WHERE handle = friend_handle;

  IF friend_user_id IS NULL THEN
    RETURN false;
  END IF;

  -- Remove friend
  DELETE FROM friends
  WHERE user_id = auth.uid()
  AND friend_id = friend_user_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create friends view
CREATE OR REPLACE VIEW friends_with_handles AS
SELECT 
  f.user_id,
  f.friend_id,
  uh.handle as friend_handle,
  f.created_at
FROM friends f
JOIN user_handles uh ON uh.user_id = f.friend_id;

-- Grant necessary permissions
GRANT SELECT ON user_handles TO authenticated;
GRANT SELECT ON friends_with_handles TO authenticated;