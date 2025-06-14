
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle, Play, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface ExecutionRecord {
  id: string;
  workflowId: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: 'success' | 'failed' | 'running';
  nodeExecutions: {
    nodeId: string;
    nodeName: string;
    startTime: string;
    endTime: string;
    duration: number;
    status: 'success' | 'failed' | 'running';
    error?: string;
  }[];
}

interface ExecutionHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflowId?: string;
}

export const ExecutionHistory: React.FC<ExecutionHistoryProps> = ({
  open,
  onOpenChange,
  workflowId,
}) => {
  const [executions, setExecutions] = useState<ExecutionRecord[]>([]);
  const [selectedExecution, setSelectedExecution] = useState<ExecutionRecord | null>(null);

  // Mock data for demonstration
  useEffect(() => {
    if (open && workflowId) {
      const mockExecutions: ExecutionRecord[] = [
        {
          id: 'exec-1',
          workflowId,
          startTime: new Date(Date.now() - 3600000).toISOString(),
          endTime: new Date(Date.now() - 3540000).toISOString(),
          duration: 60000,
          status: 'success',
          nodeExecutions: [
            {
              nodeId: '1',
              nodeName: 'Text Input',
              startTime: new Date(Date.now() - 3600000).toISOString(),
              endTime: new Date(Date.now() - 3580000).toISOString(),
              duration: 20000,
              status: 'success',
            },
            {
              nodeId: '2',
              nodeName: 'Process Data',
              startTime: new Date(Date.now() - 3580000).toISOString(),
              endTime: new Date(Date.now() - 3540000).toISOString(),
              duration: 40000,
              status: 'success',
            },
          ],
        },
        {
          id: 'exec-2',
          workflowId,
          startTime: new Date(Date.now() - 7200000).toISOString(),
          endTime: new Date(Date.now() - 7140000).toISOString(),
          duration: 60000,
          status: 'failed',
          nodeExecutions: [
            {
              nodeId: '1',
              nodeName: 'Text Input',
              startTime: new Date(Date.now() - 7200000).toISOString(),
              endTime: new Date(Date.now() - 7180000).toISOString(),
              duration: 20000,
              status: 'success',
            },
            {
              nodeId: '2',
              nodeName: 'Process Data',
              startTime: new Date(Date.now() - 7180000).toISOString(),
              endTime: new Date(Date.now() - 7140000).toISOString(),
              duration: 40000,
              status: 'failed',
              error: 'Network timeout error',
            },
          ],
        },
      ];
      setExecutions(mockExecutions);
    }
  }, [open, workflowId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'running':
        return <Play className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[80vh] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Execution History
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex gap-4 h-[600px]">
          {/* Executions List */}
          <div className="w-1/3 border-r border-border pr-4">
            <ScrollArea className="h-full">
              <div className="space-y-2">
                {executions.map((execution) => (
                  <div
                    key={execution.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedExecution?.id === execution.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedExecution(execution)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(execution.status)}
                        <Badge variant={execution.status === 'success' ? 'default' : 'destructive'}>
                          {execution.status}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDuration(execution.duration)}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(execution.startTime), 'MMM dd, HH:mm:ss')}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Execution Details */}
          <div className="flex-1">
            {selectedExecution ? (
              <ScrollArea className="h-full">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Execution Details</h3>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(selectedExecution.status)}
                      <span className="text-sm">
                        Duration: {formatDuration(selectedExecution.duration)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Started:</span>
                      <div>{format(new Date(selectedExecution.startTime), 'MMM dd, yyyy HH:mm:ss')}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Ended:</span>
                      <div>{format(new Date(selectedExecution.endTime), 'MMM dd, yyyy HH:mm:ss')}</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Node Executions</h4>
                    <div className="space-y-2">
                      {selectedExecution.nodeExecutions.map((nodeExecution, index) => (
                        <div key={index} className="p-3 border border-border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(nodeExecution.status)}
                              <span className="font-medium">{nodeExecution.nodeName}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {formatDuration(nodeExecution.duration)}
                            </span>
                          </div>
                          {nodeExecution.error && (
                            <div className="text-sm text-red-400 bg-red-500/10 p-2 rounded">
                              Error: {nodeExecution.error}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Select an execution to view details
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
