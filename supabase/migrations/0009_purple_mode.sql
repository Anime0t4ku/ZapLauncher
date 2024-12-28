/*
  # Add system backgrounds support
  
  1. Changes
    - Creates system_backgrounds table for storing custom background images
    - Enables RLS
    - Adds access policies
  
  2. Security
    - Everyone can view backgrounds
    - Only admins can modify backgrounds
*/

DO $$ 
BEGIN
  -- Create table if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'system_backgrounds'
  ) THEN
    CREATE TABLE system_backgrounds (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      system_id text REFERENCES systems(id) ON DELETE CASCADE,
      storage_path text NOT NULL,
      created_at timestamptz DEFAULT now(),
      UNIQUE(system_id)
    );

    -- Enable RLS
    ALTER TABLE system_backgrounds ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "System backgrounds are viewable by everyone" ON system_backgrounds;
  DROP POLICY IF EXISTS "Only admins can modify system backgrounds" ON system_backgrounds;

  -- Create policies
  CREATE POLICY "System backgrounds are viewable by everyone"
    ON system_backgrounds
    FOR SELECT
    TO authenticated
    USING (true);

  CREATE POLICY "Only admins can modify system backgrounds"
    ON system_backgrounds
    FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
      )
    );
END $$;