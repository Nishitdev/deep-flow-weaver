
import React, { useState } from 'react';
import { FileInput } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { NodeHeader } from './NodeHeader';

/**
 * TextInputNode Component
 * 
 * Provides a text input interface for workflows.
 * Allows users to enter multi-line text that can be used by other nodes.
 * 
 * @param data - Node configuration data
 * @param data.config - Configuration object containing input settings
 * @param data.label - Display label for the node
 * @param data.description - Description text for the node
 * @param data.onConfigUpdate - Callback to update node configuration
 */
interface TextInputNodeProps {
  data: {
    config: {
      inputText?: string;
    };
    label: string;
    description: string;
    onConfigUpdate?: (config: any) => void;
  };
}

export const TextInputNode: React.FC<TextInputNodeProps> = ({ data }) => {
  const [inputValue, setInputValue] = useState(data.config?.inputText || '');

  /**
   * Handle text input changes and update configuration
   */
  const handleInputChange = (value: string) => {
    setInputValue(value);
    if (data.onConfigUpdate) {
      data.onConfigUpdate({ ...data.config, inputText: value });
    }
  };

  return (
    <div className="w-full space-y-4">
      <NodeHeader
        icon={FileInput}
        label={data.label}
        description={data.description}
        nodeType="input"
      />
      
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Text Input</label>
        <Textarea
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="Enter your text here..."
          className="w-full min-h-[100px] bg-background/80 border-border/70 text-sm resize-none focus:border-primary/50 transition-colors"
          rows={4}
        />
      </div>
    </div>
  );
};
