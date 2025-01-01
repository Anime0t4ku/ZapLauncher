-- Create function to generate a unique handle
CREATE OR REPLACE FUNCTION generate_unique_handle(base_handle text)
RETURNS text AS $$
DECLARE
  new_handle text;
  counter integer := 0;
BEGIN
  -- Initial attempt with just the base handle
  new_handle := base_handle;
  
  -- Keep trying with incrementing numbers until we find an unused handle
  WHILE EXISTS (SELECT 1 FROM user_handles WHERE handle = new_handle) LOOP
    counter := counter + 1;
    new_handle := base_handle || counter::text;
  END LOOP;
  
  RETURN new_handle;
END;
$$ LANGUAGE plpgsql;

-- Create handles for users who don't have one
DO $$ 
DECLARE
  user_record RECORD;
  default_handle text;
BEGIN
  FOR user_record IN 
    SELECT u.id, u.email
    FROM auth.users u
    LEFT JOIN user_handles uh ON uh.user_id = u.id
    WHERE uh.id IS NULL
  LOOP
    -- Generate base handle from email
    default_handle := COALESCE(
      regexp_replace(
        split_part(user_record.email, '@', 1),
        '[^a-zA-Z0-9_-]',
        '',
        'g'
      ),
      'user'
    );

    -- Ensure minimum length and valid format
    IF length(default_handle) < 3 OR default_handle !~ '^[a-zA-Z0-9][a-zA-Z0-9_-]*$' THEN
      default_handle := 'user' || substr(gen_random_uuid()::text, 1, 8);
    END IF;

    -- Get unique handle
    default_handle := generate_unique_handle(default_handle);

    -- Insert handle
    INSERT INTO user_handles (
      user_id,
      handle,
      created_at,
      updated_at
    )
    VALUES (
      user_record.id,
      default_handle,
      now(),
      now()
    )
    ON CONFLICT (user_id) DO NOTHING;

  END LOOP;
END $$;