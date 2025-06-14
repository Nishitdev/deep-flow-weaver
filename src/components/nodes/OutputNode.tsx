
import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { NodeHeader } from './NodeHeader';

/**
 * OutputNode Component
 * 
 * Displays output data from other nodes in the workflow.
 * Can show text, numbers, or other data types.
 */
interface OutputNodeProps {
  data: {
    config: {
      outputText?: string;
    };
    label: string;
    description: string;
  };
}

export const OutputNode: React.FC<OutputNodeProps> = ({ data }) => {
  return (
    <div className="w-full space-y-4">
      <NodeHeader
        icon={CheckCircle2}
        label={data.label}
        description="Output display"
        nodeType="output"
      />
      
      <div className="space-y-3">
        <div className="p-4 bg-background/50 border border-border/50 rounded-lg min-h-[80px] flex items-center">
          <p className="text-sm text-foreground">
            {data.config?.outputText || 'Output will appear here...'}
          </p>
        </div>
      </div>
    </div>
  );
};
