
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
 * Enhanced main wrapper component for all workflow node types.
 * Features:
 * - Improved visual design with better shadows and borders
 * - Enhanced hover and selection states
 * - Better handle positioning and styling
 * - Improved accessibility with better context menus
 * 
 * @param data - Node data including type, configuration, and callbacks
 * @param selected - Whether the node is currently selected
 * @param id - Unique identifier for the node
 */
export const WorkflowNode: React.FC<NodeProps> = ({ data, selected, id }) => {
  const nodeData = data as any;

  /**
   * Handle node deletion through context menu with improved error handling
   */
  const handleDelete = () => {
    try {
      if (nodeData.onDelete) {
        nodeData.onDelete(id);
      }
    } catch (error) {
      console.error('Failed to delete node:', error);
    }
  };

  /**
   * Handle configuration updates from child components with error handling
   */
  const handleConfigUpdate = (newConfig: any) => {
    try {
      if (nodeData.config) {
        Object.assign(nodeData.config, newConfig);
      }
    } catch (error) {
      console.error('Failed to update node config:', error);
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
   * Enhanced node-specific styling with better visual hierarchy
   */
  const getNodeStyles = (type: string) => {
    const styles = {
      trigger: 'bg-gradient-to-br from-violet-50/80 to-purple-100/80 dark:from-violet-950/50 dark:to-purple-900/50 border-violet-200 dark:border-violet-700 shadow-lg shadow-violet-500/10',
      input: 'bg-gradient-to-br from-blue-50/80 to-cyan-100/80 dark:from-blue-950/50 dark:to-cyan-900/50 border-blue-200 dark:border-blue-700 shadow-lg shadow-blue-500/10',
      output: 'bg-gradient-to-br from-green-50/80 to-emerald-100/80 dark:from-green-950/50 dark:to-emerald-900/50 border-green-200 dark:border-green-700 shadow-lg shadow-green-500/10',
      numberInput: 'bg-gradient-to-br from-amber-50/80 to-orange-100/80 dark:from-amber-950/50 dark:to-orange-900/50 border-amber-200 dark:border-amber-700 shadow-lg shadow-amber-500/10',
      imageInput: 'bg-gradient-to-br from-indigo-50/80 to-blue-100/80 dark:from-indigo-950/50 dark:to-blue-900/50 border-indigo-200 dark:border-indigo-700 shadow-lg shadow-indigo-500/10',
      toggleInput: 'bg-gradient-to-br from-purple-50/80 to-pink-100/80 dark:from-purple-950/50 dark:to-pink-900/50 border-purple-200 dark:border-purple-700 shadow-lg shadow-purple-500/10',
      sliderInput: 'bg-gradient-to-br from-cyan-50/80 to-teal-100/80 dark:from-cyan-950/50 dark:to-teal-900/50 border-cyan-200 dark:border-cyan-700 shadow-lg shadow-cyan-500/10',
      fluxSchnell: 'bg-gradient-to-br from-rose-50/80 to-pink-100/80 dark:from-rose-950/50 dark:to-pink-900/50 border-rose-200 dark:border-rose-700 shadow-lg shadow-rose-500/10',
      imageOutput: 'bg-gradient-to-br from-emerald-50/80 to-green-100/80 dark:from-emerald-950/50 dark:to-green-900/50 border-emerald-200 dark:border-emerald-700 shadow-lg shadow-emerald-500/10',
    };
    
    return styles[type as keyof typeof styles] || 'bg-gradient-to-br from-gray-50/80 to-slate-100/80 dark:from-gray-950/50 dark:to-slate-900/50 border-gray-200 dark:border-gray-700 shadow-lg shadow-gray-500/10';
  };

  /**
   * Get appropriate width based on node type
   */
  const getNodeWidth = () => {
    const widths = {
      input: 'min-w-[400px]',
      numberInput: 'min-w-[400px]',
      imageInput: 'min-w-[400px]',
      toggleInput: 'min-w-[400px]',
      sliderInput: 'min-w-[400px]',
      fluxSchnell: 'min-w-[400px]',
      imageOutput: 'min-w-[400px]',
      output: 'min-w-[320px]',
      trigger: 'min-w-[280px]',
    };
    
    return widths[nodeData.type as keyof typeof widths] || 'min-w-[280px]';
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className={cn(
          'workflow-node p-6 rounded-2xl border-2 backdrop-blur-sm bg-card/90 transition-all duration-300 ease-in-out',
          getNodeWidth(),
          getNodeStyles(nodeData.type),
          selected && 'ring-2 ring-primary/60 ring-offset-2 ring-offset-background scale-105',
          'hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1'
        )}>
          {/* Enhanced target handle for non-trigger nodes */}
          {nodeData.type !== 'trigger' && (
            <Handle
              type="target"
              position={Position.Left}
              className="!w-5 !h-5 !border-2 !border-primary/60 !bg-background hover:!border-primary !shadow-lg transition-all duration-200 hover:!scale-110"
            />
          )}
          
          {renderNodeContent()}

          {/* Enhanced source handle for all nodes */}
          <Handle
            type="source"
            position={Position.Right}
            className="!w-5 !h-5 !border-2 !border-primary/60 !bg-background hover:!border-primary !shadow-lg transition-all duration-200 hover:!scale-110"
          />
        </div>
      </ContextMenuTrigger>
      
      <ContextMenuContent className="w-48">
        <ContextMenuItem 
          onClick={handleDelete} 
          className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
        >
          Delete Node
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
