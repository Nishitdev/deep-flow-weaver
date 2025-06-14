
import React, { useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { 
  Play, 
  FileInput,
  FileOutput,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';

const iconMap = {
  play: Play,
  fileInput: FileInput,
  fileOutput: FileOutput,
  checkCircle: CheckCircle2,
};

const getNodeStyles = (type: string) => {
  switch (type) {
    case 'trigger':
      return 'node-trigger';
    case 'input':
      return 'node-input bg-gradient-to-br from-red-500/20 to-orange-600/20 border-red-500/30';
    case 'output':
      return 'node-output bg-gradient-to-br from-green-500/20 to-emerald-600/20 border-green-500/30';
    default:
      return '';
  }
};

interface WorkflowNodeProps extends NodeProps {
  onDelete?: (nodeId: string) => void;
}

export const WorkflowNode: React.FC<WorkflowNodeProps> = ({ data, selected, id, onDelete }) => {
  const nodeData = data as any;
  const [inputValue, setInputValue] = useState(nodeData.config?.inputText || '');
  const IconComponent = iconMap[nodeData.icon as keyof typeof iconMap] || Play;
  
  const handleInputChange = (value: string) => {
    setInputValue(value);
    // Update the node's config
    if (nodeData.config) {
      nodeData.config.inputText = value;
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(id);
    }
  };

  const renderNodeContent = () => {
    if (nodeData.type === 'input') {
      return (
        <div className="w-full space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-500/30 flex items-center justify-center">
              <IconComponent className="w-4 h-4 text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-foreground">
                {nodeData.label}
              </h3>
              <p className="text-xs text-muted-foreground">
                {nodeData.description}
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Text Input</label>
            <Textarea
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Enter your text here..."
              className="w-full min-h-[80px] bg-background/50 border-border/50 text-sm resize-none"
              rows={3}
            />
          </div>
        </div>
      );
    }

    if (nodeData.type === 'output') {
      return (
        <div className="w-full space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-green-500/30 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-foreground">
                {nodeData.label}
              </h3>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="p-3 bg-background/30 border border-border/30 rounded-lg min-h-[60px]">
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
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
          <IconComponent className="w-5 h-5 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-foreground truncate">
            {nodeData.label}
          </h3>
          <p className="text-xs text-muted-foreground truncate">
            {nodeData.description}
          </p>
        </div>
      </div>
    );
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className={cn(
          'workflow-node p-4',
          nodeData.type === 'input' ? 'min-w-[300px]' : nodeData.type === 'output' ? 'min-w-[250px]' : 'min-w-[200px]',
          getNodeStyles(nodeData.type),
          selected && 'selected'
        )}>
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
