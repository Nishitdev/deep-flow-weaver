
import React from 'react';
import { Play } from 'lucide-react';
import { NodeHeader } from './NodeHeader';

/**
 * TriggerNode Component
 * 
 * A simple trigger node that starts workflow execution manually.
 * This node type doesn't require any configuration or input.
 * 
 * @param data - Node configuration data
 * @param data.label - Display label for the node
 * @param data.description - Description text for the node
 */
interface TriggerNodeProps {
  data: {
    label: string;
    description: string;
  };
}

export const TriggerNode: React.FC<TriggerNodeProps> = ({ data }) => {
  return (
    <div className="flex items-center gap-4 p-2">
      <NodeHeader
        icon={Play}
        label={data.label}
        description={data.description}
        nodeType="trigger"
      />
    </div>
  );
};
