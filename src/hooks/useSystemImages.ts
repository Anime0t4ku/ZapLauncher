import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface SystemImage {
  system_id: string;
  storage_path: string;
  type: 'background' | 'logo' | 'thumbnail';
  width: number;
  height: number;
}

export function useSystemImages() {
  const [images, setImages] = useState<Record<string, SystemImage>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('system_images')
        .select('*');

      if (fetchError) throw fetchError;

      const imageMap = (data || []).reduce((acc, img) => {
        acc[img.system_id] = img;
        return acc;
      }, {} as Record<string, SystemImage>);

      setImages(imageMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load system images');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (systemId: string, type: 'background' | 'logo' | 'thumbnail'): string | null => {
    const image = images[systemId];
    if (!image?.storage_path) return null;

    try {
      const { data: { publicUrl } } = supabase.storage
        .from('system-images')
        .getPublicUrl(image.storage_path);

      return publicUrl;
    } catch (err) {
      console.error('Error getting public URL:', err);
      return null;
    }
  };

  return {
    images,
    loading,
    error,
    getImageUrl,
    refresh: loadImages
  };
}