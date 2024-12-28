import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface CoverUploadProps {
  gameId: string;
  onUploadComplete: (coverId: string) => void;
}

export default function CoverUpload({ gameId, onUploadComplete }: CoverUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      // Upload to storage
      const storagePath = `covers/${gameId}/${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('game-covers')
        .upload(storagePath, file);

      if (uploadError) throw uploadError;

      // Create cover record
      const { data: coverData, error: insertError } = await supabase
        .from('game_covers')
        .insert([{
          game_id: gameId,
          storage_path: storagePath,
          width: 0, // TODO: Get actual dimensions
          height: 0,
          size_bytes: file.size,
          mime_type: file.type
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      onUploadComplete(coverData.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload cover');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        id="cover-upload"
        disabled={uploading}
      />
      <label
        htmlFor="cover-upload"
        className={`flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer
          ${uploading
            ? 'border-gray-300 bg-gray-50'
            : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50/5'
          }`}
      >
        <div className="space-y-1 text-center">
          <Upload className="mx-auto h-8 w-8 text-gray-400" />
          <div className="text-sm text-gray-600">
            {uploading ? 'Uploading...' : 'Click to upload cover image'}
          </div>
        </div>
      </label>

      {error && (
        <div className="absolute -bottom-6 left-0 right-0 flex items-center justify-between text-sm text-red-500 bg-red-50 dark:bg-red-900/30 px-3 py-1 rounded">
          <span>{error}</span>
          <button onClick={() => setError(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}