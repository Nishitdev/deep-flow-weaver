
import React, { useState } from 'react';
import { Sliders } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { NodeHeader } from './NodeHeader';

/**
 * SliderInputNode Component
 * 
 * Provides a slider interface for selecting numeric values within a range.
 * Supports configurable min/max values and step increments.
 */
interface SliderInputNodeProps {
  data: {
    config: {
      sliderValue?: number;
      min?: number;
      max?: number;
      step?: number;
    };
    label: string;
    description: string;
    onConfigUpdate?: (config: any) => void;
  };
}

export const SliderInputNode: React.FC<SliderInputNodeProps> = ({ data }) => {
  const [sliderValue, setSliderValue] = useState([data.config?.sliderValue || 50]);
  
  const min = data.config?.min || 0;
  const max = data.config?.max || 100;
  const step = data.config?.step || 1;

  /**
   * Handle slider value changes
   */
  const handleSliderChange = (value: number[]) => {
    setSliderValue(value);
    if (data.onConfigUpdate) {
      data.onConfigUpdate({ ...data.config, sliderValue: value[0] });
    }
  };

  return (
    <div className="w-full space-y-4">
      <NodeHeader
        icon={Sliders}
        label={data.label}
        description="Select a value using a slider"
        nodeType="sliderInput"
      />
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-foreground">Slider Input</label>
          <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-1 rounded">
            {sliderValue[0]}
          </span>
        </div>
        
        <div className="p-4 bg-background/50 border border-border/50 rounded-lg">
          <Slider
            value={sliderValue}
            onValueChange={handleSliderChange}
            max={max}
            min={min}
            step={step}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>{min}</span>
            <span>{max}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
