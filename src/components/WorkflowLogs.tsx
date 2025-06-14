
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
}

interface WorkflowLogsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflowId?: string;
}

export const WorkflowLogs: React.FC<WorkflowLogsProps> = ({
  open,
  onOpenChange,
  workflowId,
}) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // Mock logs for demonstration - in a real app, these would come from your backend
  useEffect(() => {
    if (open && workflowId) {
      const mockLogs: LogEntry[] = [
        {
          id: '1',
          timestamp: '7:50:25 PM',
          message: 'Prediction status: processing',
          type: 'info'
        },
        {
          id: '2',
          timestamp: '7:50:25 PM',
          message: 'Replicate: Transcribe with large-v3 model.',
          type: 'info'
        },
        {
          id: '3',
          timestamp: '7:50:28 PM',
          message: 'Prediction status: processing',
          type: 'info'
        },
        {
          id: '4',
          timestamp: '7:50:28 PM',
          message: 'Replicate: Transcribe with large-v3 model.',
          type: 'info'
        },
        {
          id: '5',
          timestamp: '7:50:31 PM',
          message: 'Prediction status: processing',
          type: 'info'
        },
        {
          id: '6',
          timestamp: '7:50:31 PM',
          message: 'Replicate: Transcribe with large-v3 model.',
          type: 'info'
        },
        {
          id: '7',
          timestamp: '7:50:34 PM',
          message: 'Prediction status: processing',
          type: 'info'
        },
        {
          id: '8',
          timestamp: '7:50:34 PM',
          message: 'Replicate: Transcribe with large-v3 model.',
          type: 'info'
        },
        {
          id: '9',
          timestamp: '7:50:37 PM',
          message: 'Prediction status: processing',
          type: 'info'
        },
        {
          id: '10',
          timestamp: '7:50:37 PM',
          message: 'Replicate: Transcribe with large-v3 model.',
          type: 'info'
        },
        {
          id: '11',
          timestamp: '7:50:40 PM',
          message: 'Prediction status: processing',
          type: 'info'
        },
        {
          id: '12',
          timestamp: '7:50:40 PM',
          message: 'Replicate: Transcribe with large-v3 model.',
          type: 'info'
        },
        {
          id: '13',
          timestamp: '7:50:43 PM',
          message: 'Prediction status: processing',
          type: 'info'
        },
        {
          id: '14',
          timestamp: '7:50:43 PM',
          message: 'Replicate: Transcribe with large-v3 model.',
          type: 'info'
        },
        {
          id: '15',
          timestamp: '7:50:46 PM',
          message: 'Prediction status: processing',
          type: 'info'
        },
        {
          id: '16',
          timestamp: '7:50:46 PM',
          message: 'Replicate: Transcribe with large-v3 model.',
          type: 'info'
        },
        {
          id: '17',
          timestamp: '7:50:49 PM',
          message: 'Prediction status: processing',
          type: 'info'
        }
      ];
      setLogs(mockLogs);
    }
  }, [open, workflowId]);

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
        
        <ScrollArea className="flex-1 px-6 py-4">
          <div className="space-y-1 font-mono text-sm">
            {logs.map((log) => (
              <div key={log.id} className="flex gap-3">
                <span className="text-gray-500 shrink-0">
                  [{log.timestamp}]
                </span>
                <span className={getLogTypeColor(log.type)}>
                  {log.message}
                </span>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <div className="px-6 py-4 border-t border-gray-700 flex justify-end gap-2">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>240</span>
            <span>LOGS</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
