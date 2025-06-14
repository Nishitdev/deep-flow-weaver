
import React, { useState } from 'react';
import { Hash } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { NodeHeader } from './NodeHeader';

/**
 * NumberInputNode Component
 * 
 * Provides a numeric input interface for workflows.
 * Supports min/max constraints and validation.
 * 
 * @param data - Node configuration data
 */
interface NumberInputNodeProps {
  data: {
    config: {
      inputValue?: number;
      min?: number;
      max?: number;
    };
    label: string;
    description: string;
    onConfigUpdate?: (config: any) => void;
  };
}

export const NumberInputNode: React.FC<NumberInputNodeProps> = ({ data }) => {
  const [numberValue, setNumberValue] = useState(data.config?.inputValue || 0);

  /**
   * Handle number input changes with validation
   */
  const handleNumberChange = (value: number) => {
    const min = data.config?.min || 0;
    const max = data.config?.max || 100;
    const clampedValue = Math.min(Math.max(value, min), max);
    
    setNumberValue(clampedValue);
    if (data.onConfigUpdate) {
      data.onConfigUpdate({ ...data.config, inputValue: clampedValue });
    }
  };

  return (
    <div className="w-full space-y-4">
      <NodeHeader
        icon={Hash}
        label={data.label}
        description="A numeric input field"
        nodeType="numberInput"
      />
      
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Number Input</label>
        <Input
          type="number"
          value={numberValue}
          onChange={(e) => handleNumberChange(Number(e.target.value))}
          className="w-full bg-background/80 border-border/70 text-sm focus:border-primary/50 transition-colors"
          min={data.config?.min || 0}
          max={data.config?.max || 100}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Min: {data.config?.min || 0}</span>
          <span>Max: {data.config?.max || 100}</span>
        </div>
      </div>
    </div>
  );
};
