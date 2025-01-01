-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;

-- Recreate policies with proper bucket access
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'system-images'
);

CREATE POLICY "Allow authenticated updates"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'system-images'
);

CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'system-images');

-- Ensure bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('system-images', 'system-images', true)
ON CONFLICT (id) DO UPDATE
SET public = true;