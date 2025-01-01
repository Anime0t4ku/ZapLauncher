-- Create storage bucket for system images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('system-images', 'system-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create system_images table
CREATE TABLE IF NOT EXISTS system_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  system_id text REFERENCES systems(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  type text NOT NULL CHECK (type IN ('background', 'logo', 'thumbnail')),
  width integer,
  height integer,
  size_bytes bigint,
  created_at timestamptz DEFAULT now(),
  UNIQUE(system_id, type)
);

-- Enable RLS
ALTER TABLE system_images ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "System images are viewable by everyone"
  ON system_images FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only authenticated users can upload system images"
  ON system_images FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create function to handle image upload
CREATE OR REPLACE FUNCTION upload_system_image(
  system_id text,
  image_type text,
  storage_path text,
  width integer,
  height integer,
  size_bytes bigint,
  OUT success boolean,
  OUT error text
)
RETURNS record
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Validate image type
  IF image_type NOT IN ('background', 'logo', 'thumbnail') THEN
    success := false;
    error := 'Invalid image type';
    RETURN;
  END IF;

  -- Insert or update image record
  INSERT INTO system_images (
    system_id,
    type,
    storage_path,
    width,
    height,
    size_bytes
  )
  VALUES (
    system_id,
    image_type,
    storage_path,
    width,
    height,
    size_bytes
  )
  ON CONFLICT (system_id, type) 
  DO UPDATE SET
    storage_path = EXCLUDED.storage_path,
    width = EXCLUDED.width,
    height = EXCLUDED.height,
    size_bytes = EXCLUDED.size_bytes;

  success := true;
  error := null;
EXCEPTION
  WHEN OTHERS THEN
    success := false;
    error := 'Failed to save image record';
    RETURN;
END;
$$;