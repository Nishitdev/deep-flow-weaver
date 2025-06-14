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
import { Play, Pause, StepForward, Square, Bug, Circle } from 'lucide-react';
import { Node, Edge } from '@xyflow/react';

interface DebugModeProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodes: Node[];
  edges: Edge[];
  onNodeHighlight: (nodeId: string | null) => void;
  executionLogs?: Array<{
    id: string;
    timestamp: string;
    message: string;
    type: 'info' | 'error' | 'warning' | 'success';
    nodeId?: string;
    nodeName?: string;
  }>;
}

interface BreakpointNode {
  id: string;
  name: string;
  enabled: boolean;
}

interface DebugLog {
  timestamp: string;
  nodeId: string;
  nodeName: string;
  message: string;
  data?: any;
  type: 'info' | 'error' | 'warning' | 'success';
}

export const DebugMode: React.FC<DebugModeProps> = ({
  open,
  onOpenChange,
  nodes,
  edges,
  onNodeHighlight,
  executionLogs = [],
}) => {
  const [isDebugging, setIsDebugging] = useState(false);
  const [currentNodeIndex, setCurrentNodeIndex] = useState(0);
  const [breakpoints, setBreakpoints] = useState<BreakpointNode[]>([]);
  const [debugLogs, setDebugLogs] = useState<DebugLog[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [executionSpeed, setExecutionSpeed] = useState(1000);

  // Initialize debug logs from execution logs when modal opens
  useEffect(() => {
    if (open && executionLogs.length > 0) {
      const formattedLogs: DebugLog[] = executionLogs.map(log => ({
        timestamp: log.timestamp,
        nodeId: log.nodeId || '',
        nodeName: log.nodeName || 'System',
        message: log.message,
        type: log.type,
      }));
      setDebugLogs(formattedLogs);
    }
  }, [open, executionLogs]);

  const startDebug = () => {
    setIsDebugging(true);
    setCurrentNodeIndex(0);
    setIsPaused(false);
    
    if (nodes.length === 0) {
      addDebugLog('', 'System', 'No nodes found in workflow', 'error');
      return;
    }

    // Clear previous debug session logs, keep execution logs
    setDebugLogs(prev => prev.filter(log => log.nodeName !== 'Debug'));
    
    if (nodes.length > 0) {
      onNodeHighlight(nodes[0].id);
      addDebugLog(nodes[0].id, (nodes[0].data?.label as string) || 'Node', 'Debug session started', 'info');
    }
  };

  const stopDebug = () => {
    setIsDebugging(false);
    setCurrentNodeIndex(0);
    setIsPaused(false);
    onNodeHighlight(null);
    addDebugLog('', 'Debug', 'Debug session stopped', 'info');
  };

  const pauseDebug = () => {
    setIsPaused(!isPaused);
    const status = isPaused ? 'resumed' : 'paused';
    addDebugLog('', 'Debug', `Debug session ${status}`, 'warning');
  };

  const stepForward = () => {
    if (currentNodeIndex < nodes.length - 1) {
      const nextIndex = currentNodeIndex + 1;
      setCurrentNodeIndex(nextIndex);
      const nextNode = nodes[nextIndex];
      onNodeHighlight(nextNode.id);
      
      // Check if there's a breakpoint on this node
      const hasBreakpoint = breakpoints.find(bp => bp.id === nextNode.id && bp.enabled);
      if (hasBreakpoint) {
        setIsPaused(true);
        addDebugLog(nextNode.id, (nextNode.data?.label as string) || 'Node', 'Breakpoint hit - execution paused', 'warning');
      } else {
        addDebugLog(nextNode.id, (nextNode.data?.label as string) || 'Node', `Executing step ${nextIndex + 1}`, 'info');
      }
    } else {
      stopDebug();
      addDebugLog('', 'Debug', 'Reached end of workflow', 'success');
    }
  };

  const addDebugLog = (nodeId: string, nodeName: string, message: string, type: DebugLog['type'] = 'info') => {
    const newLog: DebugLog = {
      timestamp: new Date().toLocaleTimeString(),
      nodeId,
      nodeName,
      message,
      type,
    };
    setDebugLogs(prev => [...prev, newLog]);
  };

  const toggleBreakpoint = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    setBreakpoints(prev => {
      const existing = prev.find(bp => bp.id === nodeId);
      if (existing) {
        const updated = prev.map(bp =>
          bp.id === nodeId ? { ...bp, enabled: !bp.enabled } : bp
        );
        addDebugLog(nodeId, (node.data?.label as string) || 'Node', 
          `Breakpoint ${existing.enabled ? 'disabled' : 'enabled'}`, 'info');
        return updated;
      } else {
        addDebugLog(nodeId, (node.data?.label as string) || 'Node', 'Breakpoint added', 'info');
        return [...prev, {
          id: nodeId,
          name: (node.data?.label as string) || 'Node',
          enabled: true,
        }];
      }
    });
  };

  const removeBreakpoint = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    setBreakpoints(prev => prev.filter(bp => bp.id !== nodeId));
    addDebugLog(nodeId, (node?.data?.label as string) || 'Node', 'Breakpoint removed', 'info');
  };

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
      <DialogContent className="max-w-6xl max-h-[90vh] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bug className="w-5 h-5" />
            Debug Mode
            {nodes.length === 0 && (
              <Badge variant="outline" className="ml-2">No Nodes</Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        
        {nodes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bug className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No Workflow to Debug</h3>
            <p>Add some nodes to your workflow to start debugging.</p>
          </div>
        ) : (
          <div className="flex gap-4 h-[600px]">
            {/* Debug Controls */}
            <div className="w-1/3 space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Debug Controls</h3>
                <div className="flex gap-2">
                  <Button
                    onClick={startDebug}
                    disabled={isDebugging && !isPaused}
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Play className="w-4 h-4" />
                    Start
                  </Button>
                  <Button
                    onClick={pauseDebug}
                    disabled={!isDebugging}
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-1"
                  >
                    <Pause className="w-4 h-4" />
                    {isPaused ? 'Resume' : 'Pause'}
                  </Button>
                  <Button
                    onClick={stepForward}
                    disabled={!isDebugging || (!isPaused && isDebugging)}
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-1"
                  >
                    <StepForward className="w-4 h-4" />
                    Step
                  </Button>
                  <Button
                    onClick={stopDebug}
                    disabled={!isDebugging}
                    size="sm"
                    variant="destructive"
                    className="flex items-center gap-1"
                  >
                    <Square className="w-4 h-4" />
                    Stop
                  </Button>
                </div>
              </div>

              {/* Current Node Info */}
              {isDebugging && nodes[currentNodeIndex] && (
                <div className="p-3 border border-border rounded-lg bg-primary/10">
                  <h4 className="font-medium text-sm mb-2">Current Node</h4>
                  <div className="text-sm">
                    <div className="font-medium">{(nodes[currentNodeIndex].data?.label as string) || 'Node'}</div>
                    <div className="text-muted-foreground">Step {currentNodeIndex + 1} of {nodes.length}</div>
                    {isPaused && <Badge variant="outline" className="mt-1">Paused</Badge>}
                  </div>
                </div>
              )}

              {/* Breakpoints */}
              <div className="space-y-2">
                <h3 className="font-semibold">Breakpoints ({breakpoints.filter(bp => bp.enabled).length})</h3>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {nodes.map(node => {
                    const breakpoint = breakpoints.find(bp => bp.id === node.id);
                    return (
                      <div key={node.id} className="flex items-center justify-between p-2 border border-border rounded text-sm">
                        <span>{(node.data?.label as string) || 'Node'}</span>
                        <Button
                          size="sm"
                          variant={breakpoint?.enabled ? "default" : "outline"}
                          onClick={() => toggleBreakpoint(node.id)}
                          className="h-6 px-2"
                        >
                          <Circle className={`w-3 h-3 ${breakpoint?.enabled ? 'fill-current' : ''}`} />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Debug Logs */}
            <div className="flex-1">
              <div className="space-y-2">
                <h3 className="font-semibold">Debug Logs ({debugLogs.length})</h3>
                <ScrollArea className="h-[520px] border border-border rounded-lg p-3">
                  <div className="space-y-2 font-mono text-sm">
                    {debugLogs.length === 0 ? (
                      <div className="text-muted-foreground text-center py-4">
                        No debug logs yet. Start debugging to see logs.
                      </div>
                    ) : (
                      debugLogs.map((log, index) => (
                        <div key={index} className="flex gap-2">
                          <span className="text-muted-foreground shrink-0">
                            [{log.timestamp}]
                          </span>
                          <Badge variant="outline" className="shrink-0 text-xs">
                            {log.nodeName}
                          </Badge>
                          <span className={getLogTypeColor(log.type)}>
                            {log.message}
                          </span>
                          {log.data && (
                            <pre className="text-xs text-muted-foreground">
                              {JSON.stringify(log.data, null, 2)}
                            </pre>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
