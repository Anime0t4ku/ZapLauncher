-- Update storage bucket configuration
UPDATE storage.buckets
SET public = true,
    file_size_limit = 5242880, -- 5MB
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
WHERE id = 'system-images';

-- Ensure RLS policies exist
DO $$ 
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
  DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
  DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;

  -- Create new policies
  CREATE POLICY "Allow public read access"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'system-images');

  CREATE POLICY "Allow authenticated uploads"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'system-images');

  CREATE POLICY "Allow authenticated updates"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'system-images');
END $$;