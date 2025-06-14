
import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
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
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { WorkflowNodeData } from '@/types/workflow';

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
  zap: Zap,
};

const getNodeStyles = (type: string) => {
  switch (type) {
    case 'trigger':
      return 'node-trigger';
    case 'ai':
      return 'node-ai';
    case 'data':
      return 'node-data';
    case 'output':
      return 'node-output';
    default:
      return '';
  }
};

export const WorkflowNode: React.FC<NodeProps<WorkflowNodeData>> = ({ data, selected }) => {
  const IconComponent = iconMap[data.icon as keyof typeof iconMap] || Play;
  
  return (
    <div className={cn(
      'workflow-node min-w-[200px] p-4',
      getNodeStyles(data.type),
      selected && 'selected'
    )}>
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !border-2"
      />
      
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
          <IconComponent className="w-5 h-5 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-foreground truncate">
            {data.label}
          </h3>
          <p className="text-xs text-muted-foreground truncate">
            {data.description}
          </p>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !border-2"
      />
    </div>
  );
};
