-- Update storage bucket configuration
UPDATE storage.buckets
SET public = true,
    file_size_limit = 5242880, -- 5MB
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
WHERE id = 'system-images';

-- Set CORS configuration via storage.buckets_config
INSERT INTO storage.buckets_config (bucket_id, cors_rule)
VALUES (
  'system-images',
  jsonb_build_array(
    jsonb_build_object(
      'AllowedOrigins', ARRAY['*'],
      'AllowedMethods', ARRAY['GET', 'POST', 'PUT', 'DELETE', 'HEAD'],
      'AllowedHeaders', ARRAY['*'],
      'MaxAgeSeconds', 3600
    )
  )
)
ON CONFLICT (bucket_id) 
DO UPDATE SET cors_rule = EXCLUDED.cors_rule;