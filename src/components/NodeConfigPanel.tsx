import React, { useState } from 'react';
import { Node } from '@xyflow/react';
import { X, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
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
      
      case 'numberInput':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="inputValue">Default Number Value</Label>
              <Input
                id="inputValue"
                type="number"
                placeholder="Enter default number..."
                value={config.inputValue || 0}
                onChange={(e) => setConfig({ ...config, inputValue: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="minValue">Minimum Value</Label>
              <Input
                id="minValue"
                type="number"
                placeholder="Minimum value"
                value={config.min || 0}
                onChange={(e) => setConfig({ ...config, min: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="maxValue">Maximum Value</Label>
              <Input
                id="maxValue"
                type="number"
                placeholder="Maximum value"
                value={config.max || 100}
                onChange={(e) => setConfig({ ...config, max: Number(e.target.value) })}
              />
            </div>
          </div>
        );

      case 'imageInput':
        return (
          <div className="space-y-4">
            <div>
              <Label>Upload Type</Label>
              <div className="flex gap-2 mt-2">
                <Button
                  variant={config.uploadType === 'url' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setConfig({ ...config, uploadType: 'url', imageFile: null })}
                >
                  URL
                </Button>
                <Button
                  variant={config.uploadType === 'file' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setConfig({ ...config, uploadType: 'file', imageUrl: '' })}
                >
                  Upload File
                </Button>
              </div>
            </div>
            
            {config.uploadType === 'url' ? (
              <div>
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  placeholder="https://example.com/image.jpg"
                  value={config.imageUrl || ''}
                  onChange={(e) => setConfig({ ...config, imageUrl: e.target.value })}
                />
              </div>
            ) : (
              <div>
                <Label htmlFor="imageFile">Upload Image File</Label>
                <Input
                  id="imageFile"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setConfig({ ...config, imageFile: file });
                  }}
                />
                {config.imageFile && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Selected: {config.imageFile.name}
                  </p>
                )}
              </div>
            )}
            
            <div>
              <Label>Allowed File Types</Label>
              <p className="text-sm text-muted-foreground">
                Images (JPG, PNG, GIF, WebP)
              </p>
            </div>
          </div>
        );

      case 'toggleInput':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="toggleValue">Default Toggle State</Label>
              <Switch
                id="toggleValue"
                checked={config.toggleValue || false}
                onCheckedChange={(checked) => setConfig({ ...config, toggleValue: checked })}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Set the initial state of the toggle (true/false).
            </p>
          </div>
        );

      case 'sliderInput':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="sliderValue">Default Slider Value: {config.sliderValue || 50}</Label>
              <Slider
                value={[config.sliderValue || 50]}
                onValueChange={(value) => setConfig({ ...config, sliderValue: value[0] })}
                max={config.max || 100}
                min={config.min || 0}
                step={1}
                className="w-full mt-2"
              />
            </div>
            <div>
              <Label htmlFor="minSlider">Minimum Value</Label>
              <Input
                id="minSlider"
                type="number"
                placeholder="Minimum value"
                value={config.min || 0}
                onChange={(e) => setConfig({ ...config, min: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="maxSlider">Maximum Value</Label>
              <Input
                id="maxSlider"
                type="number"
                placeholder="Maximum value"
                value={config.max || 100}
                onChange={(e) => setConfig({ ...config, max: Number(e.target.value) })}
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
