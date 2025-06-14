import React, { useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { 
  Play, 
  FileInput,
  FileOutput,
  CheckCircle2,
  Hash,
  Image,
  ToggleLeft,
  Sliders,
  Upload
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { FluxSchnellNode } from './nodes/FluxSchnellNode';
import { ImageOutputNode } from './nodes/ImageOutputNode';

const iconMap = {
  play: Play,
  fileInput: FileInput,
  fileOutput: FileOutput,
  checkCircle: CheckCircle2,
  hash: Hash,
  image: Image,
  toggleLeft: ToggleLeft,
  sliders: Sliders,
};

const getNodeStyles = (type: string) => {
  switch (type) {
    case 'trigger':
      return 'node-trigger';
    case 'input':
      return 'node-input bg-gradient-to-br from-red-500/20 to-orange-600/20 border-red-500/30';
    case 'output':
      return 'node-output bg-gradient-to-br from-green-500/20 to-emerald-600/20 border-green-500/30';
    case 'numberInput':
      return 'node-input bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30';
    case 'imageInput':
      return 'node-input bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30';
    case 'toggleInput':
      return 'node-input bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30';
    case 'sliderInput':
      return 'node-input bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 border-cyan-500/30';
    case 'fluxSchnell':
      return 'node-input bg-gradient-to-br from-purple-500/20 to-pink-600/20 border-purple-500/30';
    case 'imageOutput':
      return 'node-input bg-gradient-to-br from-purple-500/20 to-pink-600/20 border-purple-500/30';
    default:
      return '';
  }
};

export const WorkflowNode: React.FC<NodeProps> = ({ data, selected, id }) => {
  const nodeData = data as any;
  const [inputValue, setInputValue] = useState(nodeData.config?.inputText || '');
  const [numberValue, setNumberValue] = useState(nodeData.config?.inputValue || 0);
  const [imageUrl, setImageUrl] = useState(nodeData.config?.imageUrl || '');
  const [imageFile, setImageFile] = useState<File | null>(nodeData.config?.imageFile || null);
  const [uploadType, setUploadType] = useState(nodeData.config?.uploadType || 'url');
  const [toggleValue, setToggleValue] = useState(nodeData.config?.toggleValue || false);
  const [sliderValue, setSliderValue] = useState([nodeData.config?.sliderValue || 50]);
  
  const IconComponent = iconMap[nodeData.icon as keyof typeof iconMap] || Play;
  
  const handleInputChange = (value: string) => {
    setInputValue(value);
    if (nodeData.config) {
      nodeData.config.inputText = value;
    }
  };

  const handleNumberChange = (value: number) => {
    setNumberValue(value);
    if (nodeData.config) {
      nodeData.config.inputValue = value;
    }
  };

  const handleImageUrlChange = (value: string) => {
    setImageUrl(value);
    if (nodeData.config) {
      nodeData.config.imageUrl = value;
    }
  };

  const handleImageFileChange = (file: File | null) => {
    setImageFile(file);
    if (nodeData.config) {
      nodeData.config.imageFile = file;
    }
  };

  const handleUploadTypeChange = (type: 'url' | 'file') => {
    setUploadType(type);
    if (nodeData.config) {
      nodeData.config.uploadType = type;
      if (type === 'url') {
        nodeData.config.imageFile = null;
        setImageFile(null);
      } else {
        nodeData.config.imageUrl = '';
        setImageUrl('');
      }
    }
  };

  const handleToggleChange = (value: boolean) => {
    setToggleValue(value);
    if (nodeData.config) {
      nodeData.config.toggleValue = value;
    }
  };

  const handleSliderChange = (value: number[]) => {
    setSliderValue(value);
    if (nodeData.config) {
      nodeData.config.sliderValue = value[0];
    }
  };

  const handleDelete = () => {
    if (nodeData.onDelete) {
      nodeData.onDelete(id);
    }
  };

  const handleConfigUpdate = (newConfig: any) => {
    if (nodeData.config) {
      Object.assign(nodeData.config, newConfig);
    }
  };

  // Modern card-like container styles for node
  const cardContainerClass = cn(
    'workflow-node bg-card rounded-xl border border-border shadow-lg min-h-[80px] flex flex-col gap-2', // more visually consistent card design
    'transition-colors duration-150',
    selected && 'ring-2 ring-primary border-primary shadow-2xl',
    getNodeWidth(),
    getNodeStyles(nodeData.type)
  );

  // Modern header for improved readability
  const nodeHeader = (
    <div className={cn(
      'flex items-center gap-3 rounded-t-xl',
      nodeData.type === 'input' && 'bg-red-500/10',
      nodeData.type === 'output' && 'bg-green-500/10',
      nodeData.type === 'numberInput' && 'bg-green-500/10',
      nodeData.type === 'imageInput' && 'bg-blue-500/10',
      nodeData.type === 'toggleInput' && 'bg-purple-500/10',
      nodeData.type === 'sliderInput' && 'bg-cyan-500/10',
      nodeData.type === 'fluxSchnell' && 'bg-purple-700/10',
      'p-2 -m-4 mb-2 border-b border-border'
    )}>
      <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-white/50 border border-border">
        {iconMap[nodeData.icon as keyof typeof iconMap] ? (
          <IconComponent className="w-5 h-5 text-primary" />
        ) : (
          <Play className="w-5 h-5 text-primary" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-base text-foreground">{nodeData.label}</h3>
        {nodeData.description && (
          <p className="text-xs text-muted-foreground">{nodeData.description}</p>
        )}
      </div>
    </div>
  );

  // Use nodeHeader in all node content renderings for consistency:
  const renderNodeContent = () => {
    if (nodeData.type === 'input') {
      return (
        <>
          {nodeHeader}
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground font-medium">Text Input</label>
            <Textarea
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Enter your text here..."
              className="w-full min-h-[80px] bg-background/50 border-border/50 text-sm resize-none rounded-md"
              rows={3}
            />
          </div>
        </>
      );
    }

    if (nodeData.type === 'numberInput') {
      return (
        <>
          {nodeHeader}
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground font-medium">Number Input</label>
            <Input
              type="number"
              value={numberValue}
              onChange={(e) => handleNumberChange(Number(e.target.value))}
              className="w-full bg-background/50 border-border/50 text-sm rounded-md"
              min={nodeData.config?.min || 0}
              max={nodeData.config?.max || 100}
            />
          </div>
        </>
      );
    }

    if (nodeData.type === 'imageInput') {
      const previewUrl = uploadType === 'url' ? imageUrl : (imageFile ? URL.createObjectURL(imageFile) : '');
      
      return (
        <>
          {nodeHeader}
          <div className="space-y-2">
            <div className="flex gap-1">
              <Button
                variant={uploadType === 'url' ? 'default' : 'outline'}
                size="sm"
                className="flex-1 text-xs"
                onClick={() => handleUploadTypeChange('url')}
              >
                URL
              </Button>
              <Button
                variant={uploadType === 'file' ? 'default' : 'outline'}
                size="sm"
                className="flex-1 text-xs"
                onClick={() => handleUploadTypeChange('file')}
              >
                Upload
              </Button>
            </div>
            
            {uploadType === 'url' ? (
              <>
                <label className="text-xs text-muted-foreground font-medium">Image URL</label>
                <Input
                  value={imageUrl}
                  onChange={(e) => handleImageUrlChange(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-background/50 border-border/50 text-sm rounded-md"
                />
              </>
            ) : (
              <>
                <label className="text-xs text-muted-foreground font-medium">Upload File</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageFileChange(e.target.files?.[0] || null)}
                  className="w-full bg-background/50 border-border/50 text-sm rounded-md"
                />
                {imageFile && (
                  <p className="text-xs text-muted-foreground">
                    {imageFile.name}
                  </p>
                )}
              </>
            )}
            
            {previewUrl && (
              <div className="mt-2 p-2 bg-background/30 border border-border/30 rounded-lg">
                <img src={previewUrl} alt="Preview" className="max-h-20 object-contain w-full rounded" />
              </div>
            )}
          </div>
        </>
      );
    }

    if (nodeData.type === 'toggleInput') {
      return (
        <>
          {nodeHeader}
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground font-medium">Checkbox Input</label>
            <div className="flex items-center gap-2 p-3 bg-background/30 border border-border/30 rounded-lg">
              <Switch
                checked={toggleValue}
                onCheckedChange={handleToggleChange}
              />
              <span className="text-sm text-foreground">
                Toggle between true and false
              </span>
            </div>
          </div>
        </>
      );
    }

    if (nodeData.type === 'sliderInput') {
      return (
        <>
          {nodeHeader}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs text-muted-foreground font-medium">Slider Input</label>
              <span className="text-sm font-medium">{sliderValue[0]}</span>
            </div>
            <div className="p-3 bg-background/30 border border-border/30 rounded-lg">
              <Slider
                value={sliderValue}
                onValueChange={handleSliderChange}
                max={nodeData.config?.max || 100}
                min={nodeData.config?.min || 0}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{nodeData.config?.min || 0}</span>
                <span>{nodeData.config?.max || 100}</span>
              </div>
            </div>
          </div>
        </>
      );
    }

    if (nodeData.type === 'output') {
      return (
        <>
          {nodeHeader}
          <div className="space-y-2">
            <div className="p-3 bg-background/30 border border-border/30 rounded-lg min-h-[60px]">
              <p className="text-sm text-foreground">
                {nodeData.config?.outputText || 'Output will appear here...'}
              </p>
            </div>
          </div>
        </>
      );
    }

    // For custom node types:
    if (nodeData.type === 'fluxSchnell') {
      return (
        <FluxSchnellNode 
          data={{
            config: nodeData.config || {},
            onConfigUpdate: handleConfigUpdate,
          }}
        />
      );
    }

    if (nodeData.type === 'imageOutput') {
      return (
        <ImageOutputNode 
          data={{
            config: nodeData.config || {},
            onConfigUpdate: handleConfigUpdate,
          }}
        />
      );
    }    

    // Default trigger node with improvements
    return (
      <>
        {nodeHeader}
      </>
    );
  };

  const getNodeWidth = () => {
    switch (nodeData.type) {
      case 'input':
      case 'numberInput':
      case 'imageInput':
      case 'toggleInput':
      case 'sliderInput':
      case 'fluxSchnell':
      case 'imageOutput':
        return 'min-w-[320px]';
      case 'output':
        return 'min-w-[250px]';
      default:
        return 'min-w-[200px]';
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className={cardContainerClass}>
          {nodeData.type !== 'trigger' && (
            <Handle
              type="target"
              position={Position.Left}
              className="!w-3 !h-3 !border-2"
            />
          )}
          {renderNodeContent()}
          <Handle
            type="source"
            position={Position.Right}
            className="!w-3 !h-3 !border-2"
          />
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600">
          Delete Node
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
