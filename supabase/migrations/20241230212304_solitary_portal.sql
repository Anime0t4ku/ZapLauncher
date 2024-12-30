/*
  # Add Missing User Roles
  
  1. Changes
    - Add user roles for any existing users that don't have them
    - Generate unique handles for these users
    - Set default values for required fields
    
  2. Security
    - Maintains existing RLS policies
    - Safe handle generation
*/

-- Function to safely add missing user roles
DO $$ 
DECLARE
  user_record RECORD;
  default_handle text;
  attempts integer;
BEGIN
  -- Loop through users without roles
  FOR user_record IN 
    SELECT u.id, u.email, u.email_confirmed_at
    FROM auth.users u
    LEFT JOIN user_roles ur ON ur.user_id = u.id
    WHERE ur.id IS NULL
  LOOP
    -- Generate handle from email or random string
    default_handle := COALESCE(
      regexp_replace(
        split_part(user_record.email, '@', 1),
        '[^a-zA-Z0-9_-]',
        '',
        'g'
      ),
      'user'
    );

    -- Ensure minimum length
    IF length(default_handle) < 3 THEN
      default_handle := 'user' || substr(gen_random_uuid()::text, 1, 8);
    END IF;

    -- Truncate if too long
    default_handle := substring(default_handle from 1 for 20);

    -- Add random suffix if handle exists
    attempts := 0;
    WHILE EXISTS (
      SELECT 1 FROM user_roles WHERE handle = default_handle
    ) AND attempts < 10 LOOP
      default_handle := substring(default_handle from 1 for 16) 
        || substr(gen_random_uuid()::text, 1, 4);
      attempts := attempts + 1;
    END LOOP;

    -- Insert user role
    INSERT INTO user_roles (
      user_id,
      handle,
      email_verified,
      created_at,
      updated_at
    )
    VALUES (
      user_record.id,
      default_handle,
      COALESCE(user_record.email_confirmed_at IS NOT NULL, false),
      now(),
      now()
    )
    ON CONFLICT (user_id) DO NOTHING;

  END LOOP;
END $$;