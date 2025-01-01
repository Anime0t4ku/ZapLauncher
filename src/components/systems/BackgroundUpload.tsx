import React, { useState } from 'react';
import { Upload, X, ImageIcon, Camera } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface BackgroundUploadProps {
  systemId: string;
  onUploadComplete: (url: string) => void;
}

export default function BackgroundUpload({ systemId, onUploadComplete }: BackgroundUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleModalOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleModalClose = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsModalOpen(false);
    setError(null);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Get image dimensions
      const img = new Image();
      const imgUrl = URL.createObjectURL(file);
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imgUrl;
      });

      // Upload to storage
      const timestamp = new Date().getTime();
      const storagePath = `${systemId}/background-${timestamp}.${file.name.split('.').pop()}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('system-images')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Create image record
      const { error: insertError } = await supabase.rpc('upload_system_image', {
        system_id: systemId,
        image_type: 'background',
        storage_path: storagePath,
        width: img.width,
        height: img.height,
        size_bytes: file.size
      });

      if (insertError) throw insertError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('system-images')
        .getPublicUrl(storagePath);
      
      console.log('Uploaded image URL:', publicUrl);

      onUploadComplete(publicUrl);
      handleModalClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleModalOpen}
        className="p-2 rounded-full bg-black/20 hover:bg-black/30 transition-colors"
      >
        <Camera className="w-5 h-5 text-white" />
      </button>

      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={handleModalClose}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Upload Background Image
              </h3>
              <button
                onClick={handleModalClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="background-upload"
              disabled={uploading}
            />
            <label
              htmlFor="background-upload"
              className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer
                ${uploading
                  ? 'border-gray-300 bg-gray-50 dark:bg-gray-800/50'
                  : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50/5 dark:border-gray-700 dark:hover:border-blue-500'
                }`}
            >
              <div className="space-y-2 text-center">
                {uploading ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                ) : (
                  <>
                    <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Click or drag image to upload
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        PNG, JPG up to 5MB
                      </p>
                    </div>
                  </>
                )}
              </div>
            </label>

            {error && (
              <div className="mt-4 flex items-center justify-between text-sm text-red-500 bg-red-50 dark:bg-red-900/30 px-3 py-2 rounded">
                <span>{error}</span>
                <button onClick={() => setError(null)}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}