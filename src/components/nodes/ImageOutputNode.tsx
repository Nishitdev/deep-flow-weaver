
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Image } from 'lucide-react';

interface ImageOutputNodeProps {
  data: {
    config: {
      imageUrl?: string;
      imageFile?: File | null;
      uploadType?: 'url' | 'file';
      displayImageUrl?: string;
    };
    onConfigUpdate: (config: any) => void;
  };
}

export const ImageOutputNode: React.FC<ImageOutputNodeProps> = ({ data }) => {
  const { config } = data;
  
  // Priority: displayImageUrl (from workflow) > imageUrl (manual input) > imageFile
  const previewUrl = config.displayImageUrl || 
                     (config.uploadType === 'url' ? config.imageUrl : 
                      (config.imageFile ? URL.createObjectURL(config.imageFile) : ''));

  // Update local state when displayImageUrl changes (e.g., from workflow execution)
  React.useEffect(() => {
    if (config.imageUrl && config.uploadType === 'url' && !config.displayImageUrl) {
      if (data.onConfigUpdate) {
        data.onConfigUpdate({ 
          ...config, 
          displayImageUrl: config.imageUrl 
        });
      }
    }
  }, [config.imageUrl, config.uploadType, config.displayImageUrl, data.onConfigUpdate]);

  return (
    <div className="w-full space-y-3">
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !border-2"
      />
      
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-500/30 flex items-center justify-center">
          <Image className="w-4 h-4 text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-foreground">
            Image Output
          </h3>
          <p className="text-xs text-muted-foreground">
            Display generated or uploaded images
          </p>
        </div>
      </div>
      
      <div className="space-y-3">
        {previewUrl ? (
          <div className="p-3 bg-background/30 border border-border/30 rounded-lg">
            <img 
              src={previewUrl} 
              alt="Image Output" 
              className="w-full h-auto max-h-64 object-contain rounded" 
            />
          </div>
        ) : (
          <div className="p-8 bg-background/30 border border-border/30 rounded-lg border-dashed">
            <div className="text-center">
              <Image className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No image to display
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Connect an image source to this node
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
