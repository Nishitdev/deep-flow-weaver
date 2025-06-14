
import React from 'react';
import { Separator } from '@/components/ui/separator';

interface WorkflowHeaderProps {
  children?: React.ReactNode;
}

export const WorkflowHeader: React.FC<WorkflowHeaderProps> = ({ children }) => {
  return (
    <div className="h-16 border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold">AI Workflow Builder</h1>
              <p className="text-xs text-muted-foreground">Design intelligent automation workflows</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {children}
        </div>
      </div>
    </div>
  );
};
