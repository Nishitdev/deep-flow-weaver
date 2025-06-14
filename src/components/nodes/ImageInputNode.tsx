
import React, { useState } from 'react';
import { Image } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { NodeHeader } from './NodeHeader';

/**
 * ImageInputNode Component
 * 
 * Provides image input capabilities through URL or file upload.
 * Supports preview functionality for both input methods.
 */
interface ImageInputNodeProps {
  data: {
    config: {
      imageUrl?: string;
      imageFile?: File | null;
      uploadType?: 'url' | 'file';
    };
    label: string;
    description: string;
    onConfigUpdate?: (config: any) => void;
  };
}

export const ImageInputNode: React.FC<ImageInputNodeProps> = ({ data }) => {
  const [imageUrl, setImageUrl] = useState(data.config?.imageUrl || '');
  const [imageFile, setImageFile] = useState<File | null>(data.config?.imageFile || null);
  const [uploadType, setUploadType] = useState(data.config?.uploadType || 'url');

  /**
   * Handle URL input changes
   */
  const handleImageUrlChange = (value: string) => {
    setImageUrl(value);
    if (data.onConfigUpdate) {
      data.onConfigUpdate({ ...data.config, imageUrl: value });
    }
  };

  /**
   * Handle file upload changes
   */
  const handleImageFileChange = (file: File | null) => {
    setImageFile(file);
    if (data.onConfigUpdate) {
      data.onConfigUpdate({ ...data.config, imageFile: file });
    }
  };

  /**
   * Switch between URL and file upload modes
   */
  const handleUploadTypeChange = (type: 'url' | 'file') => {
    setUploadType(type);
    if (data.onConfigUpdate) {
      const newConfig = { 
        ...data.config, 
        uploadType: type 
      };
      
      // Clear the other input method when switching
      if (type === 'url') {
        newConfig.imageFile = null;
        setImageFile(null);
      } else {
        newConfig.imageUrl = '';
        setImageUrl('');
      }
      
      data.onConfigUpdate(newConfig);
    }
  };

  // Generate preview URL based on current input method
  const previewUrl = uploadType === 'url' ? imageUrl : (imageFile ? URL.createObjectURL(imageFile) : '');

  return (
    <div className="w-full space-y-4">
      <NodeHeader
        icon={Image}
        label={data.label}
        description="Upload or provide an image"
        nodeType="imageInput"
      />
      
      <div className="space-y-3">
        {/* Upload type selector */}
        <div className="flex gap-2">
          <Button
            variant={uploadType === 'url' ? 'default' : 'outline'}
            size="sm"
            className="flex-1 text-sm"
            onClick={() => handleUploadTypeChange('url')}
          >
            URL
          </Button>
          <Button
            variant={uploadType === 'file' ? 'default' : 'outline'}
            size="sm"
            className="flex-1 text-sm"
            onClick={() => handleUploadTypeChange('file')}
          >
            Upload
          </Button>
        </div>
        
        {/* URL input mode */}
        {uploadType === 'url' ? (
          <>
            <label className="text-sm font-medium text-foreground">Image URL</label>
            <Input
              value={imageUrl}
              onChange={(e) => handleImageUrlChange(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full bg-background/80 border-border/70 text-sm focus:border-primary/50 transition-colors"
            />
          </>
        ) : (
          /* File upload mode */
          <>
            <label className="text-sm font-medium text-foreground">Upload File</label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageFileChange(e.target.files?.[0] || null)}
              className="w-full bg-background/80 border-border/70 text-sm focus:border-primary/50 transition-colors"
            />
            {imageFile && (
              <p className="text-sm text-muted-foreground">
                Selected: {imageFile.name}
              </p>
            )}
          </>
        )}
        
        {/* Image preview */}
        {previewUrl && (
          <div className="mt-3 p-3 bg-background/50 border border-border/50 rounded-lg">
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="max-h-24 object-contain w-full rounded" 
            />
          </div>
        )}
      </div>
    </div>
  );
};
