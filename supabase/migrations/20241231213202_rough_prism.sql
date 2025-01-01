-- Update storage bucket CORS configuration
UPDATE storage.buckets
SET public = true,
    file_size_limit = 5242880, -- 5MB
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    cors_origins = ARRAY['*']
WHERE id = 'system-images';

-- Ensure RLS policies are correctly set
DO $$ 
BEGIN
  -- Recreate storage policies with proper CORS headers
  DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
  CREATE POLICY "Allow public read access"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'system-images');

  DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
  CREATE POLICY "Allow authenticated uploads"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'system-images');

  DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
  CREATE POLICY "Allow authenticated updates"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'system-images');
END $$;