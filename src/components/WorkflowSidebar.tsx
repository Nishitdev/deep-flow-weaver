
import React from 'react';
import { 
  Play, 
  Brain, 
  Database, 
  Filter, 
  Mail, 
  Webhook,
  Calendar,
  Image,
  FileText,
  ChevronLeft,
  ChevronRight,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { WorkflowNodeData } from '@/types/workflow';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onAddNode: (nodeData: Partial<WorkflowNodeData>) => void;
}

const nodeCategories = [
  {
    title: 'Triggers',
    nodes: [
      {
        type: 'trigger',
        label: 'Manual Trigger',
        icon: 'play',
        description: 'Start workflow manually',
        config: {},
      },
      {
        type: 'trigger',
        label: 'Webhook',
        icon: 'webhook',
        description: 'Trigger via HTTP request',
        config: {},
      },
      {
        type: 'trigger',
        label: 'Schedule',
        icon: 'calendar',
        description: 'Run on schedule',
        config: {},
      },
    ],
  },
  {
    title: 'AI Nodes',
    nodes: [
      {
        type: 'ai',
        label: 'OpenAI GPT',
        icon: 'brain',
        description: 'Generate text with GPT',
        config: {},
      },
      {
        type: 'ai',
        label: 'Claude AI',
        icon: 'brain',
        description: 'Process with Claude',
        config: {},
      },
      {
        type: 'ai',
        label: 'Image Analysis',
        icon: 'image',
        description: 'Analyze images with AI',
        config: {},
      },
    ],
  },
  {
    title: 'Data Processing',
    nodes: [
      {
        type: 'data',
        label: 'Filter',
        icon: 'filter',
        description: 'Filter data by conditions',
        config: {},
      },
      {
        type: 'data',
        label: 'Transform',
        icon: 'database',
        description: 'Transform data structure',
        config: {},
      },
      {
        type: 'data',
        label: 'Extract Text',
        icon: 'fileText',
        description: 'Extract text from files',
        config: {},
      },
    ],
  },
  {
    title: 'Outputs',
    nodes: [
      {
        type: 'output',
        label: 'Send Email',
        icon: 'mail',
        description: 'Send email notification',
        config: {},
      },
      {
        type: 'output',
        label: 'Save to Database',
        icon: 'database',
        description: 'Store data in database',
        config: {},
      },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, onAddNode }) => {
  if (!isOpen) {
    return (
      <div className="w-12 bg-card border-r border-border flex flex-col items-center py-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="w-8 h-8 p-0"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-80 bg-card border-r border-border">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Workflow Nodes</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="w-8 h-8 p-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {nodeCategories.map((category) => (
            <div key={category.title}>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                {category.title}
              </h3>
              <div className="space-y-2">
                {category.nodes.map((node, index) => (
                  <NodeCard
                    key={`${category.title}-${index}`}
                    node={node}
                    onAdd={() => onAddNode(node)}
                  />
                ))}
              </div>
              {category !== nodeCategories[nodeCategories.length - 1] && (
                <Separator className="mt-4" />
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

interface NodeCardProps {
  node: Partial<WorkflowNodeData>;
  onAdd: () => void;
}

const iconMap = {
  play: Play,
  brain: Brain,
  database: Database,
  filter: Filter,
  mail: Mail,
  webhook: Webhook,
  calendar: Calendar,
  image: Image,
  fileText: FileText,
};

const NodeCard: React.FC<NodeCardProps> = ({ node, onAdd }) => {
  const IconComponent = iconMap[node.icon as keyof typeof iconMap] || Play;

  return (
    <div className="group p-3 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-accent/50 transition-all cursor-pointer">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-8 h-8 rounded-md bg-primary/20 flex items-center justify-center">
            <IconComponent className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium truncate">{node.label}</h4>
            <p className="text-xs text-muted-foreground truncate">
              {node.description}
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={onAdd}
          className="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 p-0"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
