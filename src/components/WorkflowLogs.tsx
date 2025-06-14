
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Logs } from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'error' | 'warning' | 'success';
  nodeId?: string;
  nodeName?: string;
}

interface WorkflowLogsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflowId?: string;
  logs?: LogEntry[];
}

export const WorkflowLogs: React.FC<WorkflowLogsProps> = ({
  open,
  onOpenChange,
  workflowId,
  logs = [],
}) => {
  const [internalLogs, setInternalLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    if (logs.length > 0) {
      setInternalLogs(logs);
    } else if (open && workflowId) {
      // Fallback to mock logs only if no real logs are provided
      const mockLogs: LogEntry[] = [
        {
          id: '1',
          timestamp: new Date().toLocaleTimeString(),
          message: 'Workflow execution started',
          type: 'info'
        },
        {
          id: '2',
          timestamp: new Date().toLocaleTimeString(),
          message: 'No execution logs available - run a workflow to see real logs',
          type: 'warning'
        }
      ];
      setInternalLogs(mockLogs);
    }
  }, [open, workflowId, logs]);

  const getLogTypeColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'text-red-400';
      case 'warning':
        return 'text-yellow-400';
      case 'success':
        return 'text-green-400';
      default:
        return 'text-gray-300';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] bg-gray-900 border-gray-700 p-0">
        <DialogHeader className="px-6 py-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Logs className="w-5 h-5 text-gray-400" />
              <DialogTitle className="text-white text-lg font-medium">
                WORKFLOW LOGS
              </DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <ScrollArea className="flex-1 px-6 py-4 h-96">
          <div className="space-y-1 font-mono text-sm">
            {internalLogs.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                No logs available. Run a workflow to see execution logs.
              </div>
            ) : (
              internalLogs.map((log) => (
                <div key={log.id} className="flex gap-3">
                  <span className="text-gray-500 shrink-0">
                    [{log.timestamp}]
                  </span>
                  {log.nodeName && (
                    <span className="text-blue-400 shrink-0">
                      [{log.nodeName}]
                    </span>
                  )}
                  <span className={getLogTypeColor(log.type)}>
                    {log.message}
                  </span>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        
        <div className="px-6 py-4 border-t border-gray-700 flex justify-end gap-2">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>{internalLogs.length}</span>
            <span>LOGS</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
