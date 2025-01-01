-- Add storage policies for system-images bucket
BEGIN;

-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'system-images' AND
  auth.role() = 'authenticated'
);

-- Allow authenticated users to update their uploaded files
CREATE POLICY "Allow authenticated updates"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'system-images' AND
  auth.role() = 'authenticated'
);

-- Allow public access to read files
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'system-images');

COMMIT;