
import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { cn } from '@/lib/utils';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';

// Import individual node components
import { TriggerNode } from './nodes/TriggerNode';
import { TextInputNode } from './nodes/TextInputNode';
import { NumberInputNode } from './nodes/NumberInputNode';
import { ImageInputNode } from './nodes/ImageInputNode';
import { ToggleInputNode } from './nodes/ToggleInputNode';
import { SliderInputNode } from './nodes/SliderInputNode';
import { OutputNode } from './nodes/OutputNode';
import { FluxSchnellNode } from './nodes/FluxSchnellNode';
import { ImageOutputNode } from './nodes/ImageOutputNode';

/**
 * WorkflowNode Component
 * 
 * Main wrapper component for all workflow node types.
 * Handles node rendering, handles, and context menu functionality.
 * 
 * @param data - Node data including type, configuration, and callbacks
 * @param selected - Whether the node is currently selected
 * @param id - Unique identifier for the node
 */
export const WorkflowNode: React.FC<NodeProps> = ({ data, selected, id }) => {
  const nodeData = data as any;

  /**
   * Handle node deletion through context menu
   */
  const handleDelete = () => {
    if (nodeData.onDelete) {
      nodeData.onDelete(id);
    }
  };

  /**
   * Handle configuration updates from child components
   */
  const handleConfigUpdate = (newConfig: any) => {
    if (nodeData.config) {
      Object.assign(nodeData.config, newConfig);
    }
  };

  /**
   * Render the appropriate node component based on type
   */
  const renderNodeContent = () => {
    const commonProps = {
      data: {
        ...nodeData,
        onConfigUpdate: handleConfigUpdate,
      }
    };

    switch (nodeData.type) {
      case 'trigger':
        return <TriggerNode {...commonProps} />;
      
      case 'input':
        return <TextInputNode {...commonProps} />;
      
      case 'numberInput':
        return <NumberInputNode {...commonProps} />;
      
      case 'imageInput':
        return <ImageInputNode {...commonProps} />;
      
      case 'toggleInput':
        return <ToggleInputNode {...commonProps} />;
      
      case 'sliderInput':
        return <SliderInputNode {...commonProps} />;
      
      case 'output':
        return <OutputNode {...commonProps} />;
      
      case 'fluxSchnell':
        return <FluxSchnellNode {...commonProps} />;
      
      case 'imageOutput':
        return <ImageOutputNode {...commonProps} />;
      
      default:
        return <TriggerNode {...commonProps} />;
    }
  };

  /**
   * Get node-specific styling
   */
  const getNodeStyles = (type: string) => {
    const styles = {
      trigger: 'bg-gradient-to-br from-violet-500/10 to-purple-600/10 border-violet-500/30 shadow-lg shadow-violet-500/10',
      input: 'bg-gradient-to-br from-blue-500/10 to-cyan-600/10 border-blue-500/30 shadow-lg shadow-blue-500/10',
      output: 'bg-gradient-to-br from-green-500/10 to-emerald-600/10 border-green-500/30 shadow-lg shadow-green-500/10',
      numberInput: 'bg-gradient-to-br from-amber-500/10 to-orange-600/10 border-amber-500/30 shadow-lg shadow-amber-500/10',
      imageInput: 'bg-gradient-to-br from-indigo-500/10 to-blue-600/10 border-indigo-500/30 shadow-lg shadow-indigo-500/10',
      toggleInput: 'bg-gradient-to-br from-purple-500/10 to-pink-600/10 border-purple-500/30 shadow-lg shadow-purple-500/10',
      sliderInput: 'bg-gradient-to-br from-cyan-500/10 to-teal-600/10 border-cyan-500/30 shadow-lg shadow-cyan-500/10',
      fluxSchnell: 'bg-gradient-to-br from-rose-500/10 to-pink-600/10 border-rose-500/30 shadow-lg shadow-rose-500/10',
      imageOutput: 'bg-gradient-to-br from-emerald-500/10 to-green-600/10 border-emerald-500/30 shadow-lg shadow-emerald-500/10',
    };
    
    return styles[type as keyof typeof styles] || 'bg-gradient-to-br from-gray-500/10 to-slate-600/10 border-gray-500/30 shadow-lg shadow-gray-500/10';
  };

  /**
   * Get appropriate width based on node type
   */
  const getNodeWidth = () => {
    const widths = {
      input: 'min-w-[380px]',
      numberInput: 'min-w-[380px]',
      imageInput: 'min-w-[380px]',
      toggleInput: 'min-w-[380px]',
      sliderInput: 'min-w-[380px]',
      fluxSchnell: 'min-w-[380px]',
      imageOutput: 'min-w-[380px]',
      output: 'min-w-[300px]',
      trigger: 'min-w-[250px]',
    };
    
    return widths[nodeData.type as keyof typeof widths] || 'min-w-[250px]';
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
          {/* Target handle for non-trigger nodes */}
          {nodeData.type !== 'trigger' && (
            <Handle
              type="target"
              position={Position.Left}
              className="!w-4 !h-4 !border-2 !border-primary/50 !bg-background hover:!border-primary transition-colors"
            />
          )}
          
          {renderNodeContent()}

          {/* Source handle for all nodes */}
          <Handle
            type="source"
            position={Position.Right}
            className="!w-4 !h-4 !border-2 !border-primary/50 !bg-background hover:!border-primary transition-colors"
          />
        </div>
      </ContextMenuTrigger>
      
      <ContextMenuContent className="w-48">
        <ContextMenuItem 
          onClick={handleDelete} 
          className="text-red-600 focus:text-red-600"
        >
          Delete Node
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
