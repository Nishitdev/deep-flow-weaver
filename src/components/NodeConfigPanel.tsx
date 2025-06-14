
import React, { useState } from 'react';
import { Node } from '@xyflow/react';
import { X, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { WorkflowNodeData, NodeConfig } from '@/types/workflow';

interface NodeConfigPanelProps {
  node: Node<WorkflowNodeData>;
  onClose: () => void;
  onUpdate: (node: Node<WorkflowNodeData>) => void;
}

export const NodeConfigPanel: React.FC<NodeConfigPanelProps> = ({
  node,
  onClose,
  onUpdate,
}) => {
  const [config, setConfig] = useState<NodeConfig>(node.data.config || {});
  const [label, setLabel] = useState<string>(node.data.label || '');
  const [description, setDescription] = useState<string>(node.data.description || '');

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
    switch (node.data.type) {
      case 'ai':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter API key"
                value={config.apiKey || ''}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                placeholder="gpt-4o-mini"
                value={config.model || ''}
                onChange={(e) => setConfig({ ...config, model: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="prompt">Prompt Template</Label>
              <Textarea
                id="prompt"
                placeholder="Enter your prompt template..."
                value={config.prompt || ''}
                onChange={(e) => setConfig({ ...config, prompt: e.target.value })}
                rows={4}
              />
            </div>
          </div>
        );
      
      case 'trigger':
        return (
          <div className="space-y-4">
            {node.data.label === 'Webhook' && (
              <div>
                <Label htmlFor="webhookUrl">Webhook URL</Label>
                <Input
                  id="webhookUrl"
                  placeholder="https://..."
                  value={config.webhookUrl || ''}
                  onChange={(e) => setConfig({ ...config, webhookUrl: e.target.value })}
                />
              </div>
            )}
            {node.data.label === 'Schedule' && (
              <div>
                <Label htmlFor="schedule">Cron Expression</Label>
                <Input
                  id="schedule"
                  placeholder="0 9 * * *"
                  value={config.schedule || ''}
                  onChange={(e) => setConfig({ ...config, schedule: e.target.value })}
                />
              </div>
            )}
          </div>
        );
      
      case 'data':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="condition">Filter Condition</Label>
              <Input
                id="condition"
                placeholder="value > 10"
                value={config.condition || ''}
                onChange={(e) => setConfig({ ...config, condition: e.target.value })}
              />
            </div>
          </div>
        );
      
      case 'output':
        return (
          <div className="space-y-4">
            {node.data.label === 'Send Email' && (
              <>
                <div>
                  <Label htmlFor="to">To Email</Label>
                  <Input
                    id="to"
                    type="email"
                    placeholder="user@example.com"
                    value={config.to || ''}
                    onChange={(e) => setConfig({ ...config, to: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="Email subject"
                    value={config.subject || ''}
                    onChange={(e) => setConfig({ ...config, subject: e.target.value })}
                  />
                </div>
              </>
            )}
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
