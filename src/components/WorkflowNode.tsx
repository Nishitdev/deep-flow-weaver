
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
      return 'bg-gradient-to-br from-violet-500/10 to-purple-600/10 border-violet-500/30 shadow-lg shadow-violet-500/10';
    case 'input':
      return 'bg-gradient-to-br from-blue-500/10 to-cyan-600/10 border-blue-500/30 shadow-lg shadow-blue-500/10';
    case 'output':
      return 'bg-gradient-to-br from-green-500/10 to-emerald-600/10 border-green-500/30 shadow-lg shadow-green-500/10';
    case 'numberInput':
      return 'bg-gradient-to-br from-amber-500/10 to-orange-600/10 border-amber-500/30 shadow-lg shadow-amber-500/10';
    case 'imageInput':
      return 'bg-gradient-to-br from-indigo-500/10 to-blue-600/10 border-indigo-500/30 shadow-lg shadow-indigo-500/10';
    case 'toggleInput':
      return 'bg-gradient-to-br from-purple-500/10 to-pink-600/10 border-purple-500/30 shadow-lg shadow-purple-500/10';
    case 'sliderInput':
      return 'bg-gradient-to-br from-cyan-500/10 to-teal-600/10 border-cyan-500/30 shadow-lg shadow-cyan-500/10';
    case 'fluxSchnell':
      return 'bg-gradient-to-br from-rose-500/10 to-pink-600/10 border-rose-500/30 shadow-lg shadow-rose-500/10';
    case 'imageOutput':
      return 'bg-gradient-to-br from-emerald-500/10 to-green-600/10 border-emerald-500/30 shadow-lg shadow-emerald-500/10';
    default:
      return 'bg-gradient-to-br from-gray-500/10 to-slate-600/10 border-gray-500/30 shadow-lg shadow-gray-500/10';
  }
};

const getIconColor = (type: string) => {
  switch (type) {
    case 'trigger': return 'text-violet-500';
    case 'input': return 'text-blue-500';
    case 'output': return 'text-green-500';
    case 'numberInput': return 'text-amber-500';
    case 'imageInput': return 'text-indigo-500';
    case 'toggleInput': return 'text-purple-500';
    case 'sliderInput': return 'text-cyan-500';
    case 'fluxSchnell': return 'text-rose-500';
    case 'imageOutput': return 'text-emerald-500';
    default: return 'text-gray-500';
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

  const renderNodeContent = () => {
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

    if (nodeData.type === 'input') {
      return (
        <div className="w-full space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-border/50">
            <div className={cn("flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center", getNodeStyles(nodeData.type))}>
              <IconComponent className={cn("w-5 h-5", getIconColor(nodeData.type))} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base text-foreground">
                {nodeData.label}
              </h3>
              <p className="text-sm text-muted-foreground">
                {nodeData.description}
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Text Input</label>
            <Textarea
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Enter your text here..."
              className="w-full min-h-[100px] bg-background/80 border-border/70 text-sm resize-none focus:border-primary/50 transition-colors"
              rows={4}
            />
          </div>
        </div>
      );
    }

    if (nodeData.type === 'numberInput') {
      return (
        <div className="w-full space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-border/50">
            <div className={cn("flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center", getNodeStyles(nodeData.type))}>
              <Hash className={cn("w-5 h-5", getIconColor(nodeData.type))} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base text-foreground">
                {nodeData.label}
              </h3>
              <p className="text-sm text-muted-foreground">
                A numeric input field
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Number Input</label>
            <Input
              type="number"
              value={numberValue}
              onChange={(e) => handleNumberChange(Number(e.target.value))}
              className="w-full bg-background/80 border-border/70 text-sm focus:border-primary/50 transition-colors"
              min={nodeData.config?.min || 0}
              max={nodeData.config?.max || 100}
            />
          </div>
        </div>
      );
    }

    if (nodeData.type === 'imageInput') {
      const previewUrl = uploadType === 'url' ? imageUrl : (imageFile ? URL.createObjectURL(imageFile) : '');
      
      return (
        <div className="w-full space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-border/50">
            <div className={cn("flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center", getNodeStyles(nodeData.type))}>
              <Image className={cn("w-5 h-5", getIconColor(nodeData.type))} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base text-foreground">
                {nodeData.label}
              </h3>
              <p className="text-sm text-muted-foreground">
                Upload or provide an image
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
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
            
            {uploadType === 'url' ? (
              <>
                <label className="text-sm font-medium text-foreground">Image URL</label>
                <Input
                  value={imageUrl}
                  onChange={(e) => handleImageUrlChange(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-background/80 border-border/70 text-sm focus:border-primary/50 transition-colors"
                />
              </>
            ) : (
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
                    {imageFile.name}
                  </p>
                )}
              </>
            )}
            
            {previewUrl && (
              <div className="mt-3 p-3 bg-background/50 border border-border/50 rounded-lg">
                <img src={previewUrl} alt="Preview" className="max-h-24 object-contain w-full rounded" />
              </div>
            )}
          </div>
        </div>
      );
    }

    if (nodeData.type === 'toggleInput') {
      return (
        <div className="w-full space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-border/50">
            <div className={cn("flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center", getNodeStyles(nodeData.type))}>
              <ToggleLeft className={cn("w-5 h-5", getIconColor(nodeData.type))} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base text-foreground">
                {nodeData.label}
              </h3>
              <p className="text-sm text-muted-foreground">
                Toggle between true and false
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Toggle Input</label>
            <div className="flex items-center gap-3 p-4 bg-background/50 border border-border/50 rounded-lg">
              <Switch
                checked={toggleValue}
                onCheckedChange={handleToggleChange}
              />
              <span className="text-sm text-foreground">
                {toggleValue ? 'True' : 'False'}
              </span>
            </div>
          </div>
        </div>
      );
    }

    if (nodeData.type === 'sliderInput') {
      return (
        <div className="w-full space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-border/50">
            <div className={cn("flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center", getNodeStyles(nodeData.type))}>
              <Sliders className={cn("w-5 h-5", getIconColor(nodeData.type))} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base text-foreground">
                {nodeData.label}
              </h3>
              <p className="text-sm text-muted-foreground">
                Select a value using a slider
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-foreground">Slider Input</label>
              <span className="text-sm font-medium text-primary">{sliderValue[0]}</span>
            </div>
            <div className="p-4 bg-background/50 border border-border/50 rounded-lg">
              <Slider
                value={sliderValue}
                onValueChange={handleSliderChange}
                max={nodeData.config?.max || 100}
                min={nodeData.config?.min || 0}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>{nodeData.config?.min || 0}</span>
                <span>{nodeData.config?.max || 100}</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (nodeData.type === 'output') {
      return (
        <div className="w-full space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-border/50">
            <div className={cn("flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center", getNodeStyles(nodeData.type))}>
              <CheckCircle2 className={cn("w-5 h-5", getIconColor(nodeData.type))} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base text-foreground">
                {nodeData.label}
              </h3>
              <p className="text-sm text-muted-foreground">
                Output display
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="p-4 bg-background/50 border border-border/50 rounded-lg min-h-[80px] flex items-center">
              <p className="text-sm text-foreground">
                {nodeData.config?.outputText || 'Output will appear here...'}
              </p>
            </div>
          </div>
        </div>
      );
    }

    // Default trigger node
    return (
      <div className="flex items-center gap-4 p-2">
        <div className={cn("flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center", getNodeStyles(nodeData.type))}>
          <IconComponent className={cn("w-6 h-6", getIconColor(nodeData.type))} />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base text-foreground truncate">
            {nodeData.label}
          </h3>
          <p className="text-sm text-muted-foreground truncate">
            {nodeData.description}
          </p>
        </div>
      </div>
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
        return 'min-w-[380px]';
      case 'output':
        return 'min-w-[300px]';
      default:
        return 'min-w-[250px]';
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className={cn(
          'workflow-node p-5 rounded-xl border-2 backdrop-blur-sm bg-card/80 transition-all duration-200',
          getNodeWidth(),
          getNodeStyles(nodeData.type),
          selected && 'ring-2 ring-primary/50 ring-offset-2 ring-offset-background',
          'hover:shadow-xl hover:scale-[1.02]'
        )}>
          {nodeData.type !== 'trigger' && (
            <Handle
              type="target"
              position={Position.Left}
              className="!w-4 !h-4 !border-2 !border-primary/50 !bg-background hover:!border-primary transition-colors"
            />
          )}
          
          {renderNodeContent()}

          <Handle
            type="source"
            position={Position.Right}
            className="!w-4 !h-4 !border-2 !border-primary/50 !bg-background hover:!border-primary transition-colors"
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
