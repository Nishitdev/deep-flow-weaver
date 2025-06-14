
import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { NodeHeader } from './NodeHeader';

/**
 * OutputNode Component
 * 
 * Displays output data from other nodes in the workflow.
 * Features:
 * - Enhanced visual design with better contrast
 * - Proper content area with min-height
 * - Improved typography and spacing
 * - Loading state support
 */
interface OutputNodeProps {
  data: {
    config: {
      outputText?: string;
      isLoading?: boolean;
    };
    label: string;
    description: string;
  };
}

export const OutputNode: React.FC<OutputNodeProps> = ({ data }) => {
  const { outputText, isLoading } = data.config || {};

  return (
    <div className="w-full space-y-4">
      <NodeHeader
        icon={CheckCircle2}
        label={data.label}
        description="Output display"
        nodeType="output"
      />
      
      <div className="space-y-3">
        <div className="p-4 bg-muted/30 border border-border rounded-lg min-h-[100px] flex items-center transition-all duration-200 hover:bg-muted/40">
          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">Processing...</span>
            </div>
          ) : (
            <p className="text-sm text-foreground leading-relaxed">
              {outputText || 'Output will appear here...'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
