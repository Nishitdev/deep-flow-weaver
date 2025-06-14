
import React, { useState, useCallback } from 'react';
import { ToggleLeft } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { NodeHeader } from './NodeHeader';

/**
 * ToggleInputNode Component
 * 
 * Provides a boolean toggle switch for workflows.
 * Features:
 * - Enhanced visual design with better spacing
 * - Smooth animations and transitions
 * - Clear visual feedback for state changes
 * - Improved accessibility
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
  const [isUpdating, setIsUpdating] = useState(false);

  /**
   * Handle toggle state changes with improved error handling
   */
  const handleToggleChange = useCallback(async (value: boolean) => {
    setIsUpdating(true);
    try {
      setToggleValue(value);
      if (data.onConfigUpdate) {
        await data.onConfigUpdate({ ...data.config, toggleValue: value });
      }
    } catch (error) {
      console.error('Failed to update toggle value:', error);
      // Revert on error
      setToggleValue(!value);
    } finally {
      setIsUpdating(false);
    }
  }, [data]);

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
        <div className="flex items-center gap-3 p-4 bg-muted/20 border border-border rounded-lg transition-all duration-200 hover:bg-muted/30">
          <Switch
            checked={toggleValue}
            onCheckedChange={handleToggleChange}
            disabled={isUpdating}
            className="data-[state=checked]:bg-primary"
          />
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium transition-colors duration-200 ${
              toggleValue ? 'text-primary' : 'text-muted-foreground'
            }`}>
              {toggleValue ? 'True' : 'False'}
            </span>
            {isUpdating && (
              <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin opacity-60"></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
