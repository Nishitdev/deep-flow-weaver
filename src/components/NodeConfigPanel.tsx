
import React, { useState } from 'react';
import { Node } from '@xyflow/react';
import { X, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { NodeConfig } from '@/types/workflow';

interface NodeConfigPanelProps {
  node: Node;
  onClose: () => void;
  onUpdate: (node: Node) => void;
}

export const NodeConfigPanel: React.FC<NodeConfigPanelProps> = ({
  node,
  onClose,
  onUpdate,
}) => {
  const nodeData = node.data as any;
  const [config, setConfig] = useState<NodeConfig>(nodeData.config || {});
  const [label, setLabel] = useState<string>(nodeData.label || '');
  const [description, setDescription] = useState<string>(nodeData.description || '');

  const handleSave = () => {
    const updatedNode = {
      ...node,
      data: {
        ...node.data,
        label,
        description,
        config,
      },
    };
    onUpdate(updatedNode);
  };

  const renderConfigFields = () => {
    switch (nodeData.type) {
      case 'input':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="inputText">Default Input Text</Label>
              <Textarea
                id="inputText"
                placeholder="Enter default text..."
                value={config.inputText || ''}
                onChange={(e) => setConfig({ ...config, inputText: e.target.value })}
                rows={4}
              />
            </div>
          </div>
        );
      
      case 'output':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="outputText">Output Display Text</Label>
              <Textarea
                id="outputText"
                placeholder="Configure what to display..."
                value={config.outputText || ''}
                onChange={(e) => setConfig({ ...config, outputText: e.target.value })}
                rows={4}
              />
            </div>
          </div>
        );
      
      case 'trigger':
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This node starts the workflow manually. No configuration needed.
            </p>
          </div>
        );
      
      default:
        return <p className="text-muted-foreground">No configuration options available.</p>;
    }
  };

  return (
    <div className="fixed right-4 top-20 bottom-4 w-80 bg-card border border-border rounded-xl shadow-xl glassmorphism z-50">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-primary" />
          <h3 className="font-semibold">Node Configuration</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Basic Settings</h4>
            <div>
              <Label htmlFor="nodeLabel">Node Label</Label>
              <Input
                id="nodeLabel"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="nodeDescription">Description</Label>
              <Input
                id="nodeDescription"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Configuration</h4>
            {renderConfigFields()}
          </div>
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border">
        <Button onClick={handleSave} className="w-full">
          Save Configuration
        </Button>
      </div>
    </div>
  );
};
