
import React, { useState } from 'react';
import { ToggleLeft } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { NodeHeader } from './NodeHeader';

/**
 * ToggleInputNode Component
 * 
 * Provides a boolean toggle switch for workflows.
 * Returns true/false values that can be used by other nodes.
 */
interface ToggleInputNodeProps {
  data: {
    config: {
      toggleValue?: boolean;
    };
    label: string;
    description: string;
    onConfigUpdate?: (config: any) => void;
  };
}

export const ToggleInputNode: React.FC<ToggleInputNodeProps> = ({ data }) => {
  const [toggleValue, setToggleValue] = useState(data.config?.toggleValue || false);

  /**
   * Handle toggle state changes
   */
  const handleToggleChange = (value: boolean) => {
    setToggleValue(value);
    if (data.onConfigUpdate) {
      data.onConfigUpdate({ ...data.config, toggleValue: value });
    }
  };

  return (
    <div className="w-full space-y-4">
      <NodeHeader
        icon={ToggleLeft}
        label={data.label}
        description="Toggle between true and false"
        nodeType="toggleInput"
      />
      
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Toggle Input</label>
        <div className="flex items-center gap-3 p-4 bg-background/50 border border-border/50 rounded-lg">
          <Switch
            checked={toggleValue}
            onCheckedChange={handleToggleChange}
          />
          <span className="text-sm text-foreground font-medium">
            {toggleValue ? 'True' : 'False'}
          </span>
        </div>
      </div>
    </div>
  );
};
