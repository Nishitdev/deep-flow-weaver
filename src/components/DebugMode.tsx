
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, StepForward, Square, Bug, Breakpoint } from 'lucide-react';
import { Node, Edge } from '@xyflow/react';

interface DebugModeProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodes: Node[];
  edges: Edge[];
  onNodeHighlight: (nodeId: string | null) => void;
}

interface BreakpointNode {
  id: string;
  name: string;
  enabled: boolean;
}

export const DebugMode: React.FC<DebugModeProps> = ({
  open,
  onOpenChange,
  nodes,
  edges,
  onNodeHighlight,
}) => {
  const [isDebugging, setIsDebugging] = useState(false);
  const [currentNodeIndex, setCurrentNodeIndex] = useState(0);
  const [breakpoints, setBreakpoints] = useState<BreakpointNode[]>([]);
  const [debugLogs, setDebugLogs] = useState<Array<{
    timestamp: string;
    nodeId: string;
    nodeName: string;
    message: string;
    data?: any;
  }>>([]);

  const startDebug = () => {
    setIsDebugging(true);
    setCurrentNodeIndex(0);
    setDebugLogs([]);
    if (nodes.length > 0) {
      onNodeHighlight(nodes[0].id);
      addDebugLog(nodes[0].id, nodes[0].data?.label || 'Node', 'Debug started');
    }
  };

  const stopDebug = () => {
    setIsDebugging(false);
    setCurrentNodeIndex(0);
    onNodeHighlight(null);
    addDebugLog('', 'System', 'Debug stopped');
  };

  const stepForward = () => {
    if (currentNodeIndex < nodes.length - 1) {
      const nextIndex = currentNodeIndex + 1;
      setCurrentNodeIndex(nextIndex);
      const nextNode = nodes[nextIndex];
      onNodeHighlight(nextNode.id);
      addDebugLog(nextNode.id, nextNode.data?.label || 'Node', `Executing step ${nextIndex + 1}`);
    } else {
      stopDebug();
    }
  };

  const addDebugLog = (nodeId: string, nodeName: string, message: string, data?: any) => {
    setDebugLogs(prev => [...prev, {
      timestamp: new Date().toLocaleTimeString(),
      nodeId,
      nodeName,
      message,
      data,
    }]);
  };

  const toggleBreakpoint = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    setBreakpoints(prev => {
      const existing = prev.find(bp => bp.id === nodeId);
      if (existing) {
        return prev.map(bp =>
          bp.id === nodeId ? { ...bp, enabled: !bp.enabled } : bp
        );
      } else {
        return [...prev, {
          id: nodeId,
          name: node.data?.label || 'Node',
          enabled: true,
        }];
      }
    });
  };

  const removeBreakpoint = (nodeId: string) => {
    setBreakpoints(prev => prev.filter(bp => bp.id !== nodeId));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bug className="w-5 h-5" />
            Debug Mode
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex gap-4 h-[600px]">
          {/* Debug Controls */}
          <div className="w-1/3 space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Debug Controls</h3>
              <div className="flex gap-2">
                <Button
                  onClick={startDebug}
                  disabled={isDebugging}
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Play className="w-4 h-4" />
                  Start
                </Button>
                <Button
                  onClick={stepForward}
                  disabled={!isDebugging}
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
                  <div className="font-medium">{nodes[currentNodeIndex].data?.label}</div>
                  <div className="text-muted-foreground">Step {currentNodeIndex + 1} of {nodes.length}</div>
                </div>
              </div>
            )}

            {/* Breakpoints */}
            <div className="space-y-2">
              <h3 className="font-semibold">Breakpoints</h3>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {nodes.map(node => {
                  const breakpoint = breakpoints.find(bp => bp.id === node.id);
                  return (
                    <div key={node.id} className="flex items-center justify-between p-2 border border-border rounded text-sm">
                      <span>{node.data?.label || 'Node'}</span>
                      <Button
                        size="sm"
                        variant={breakpoint?.enabled ? "default" : "outline"}
                        onClick={() => toggleBreakpoint(node.id)}
                        className="h-6 px-2"
                      >
                        <Breakpoint className="w-3 h-3" />
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
              <h3 className="font-semibold">Debug Logs</h3>
              <ScrollArea className="h-[520px] border border-border rounded-lg p-3">
                <div className="space-y-2 font-mono text-sm">
                  {debugLogs.map((log, index) => (
                    <div key={index} className="flex gap-2">
                      <span className="text-muted-foreground shrink-0">
                        [{log.timestamp}]
                      </span>
                      <Badge variant="outline" className="shrink-0 text-xs">
                        {log.nodeName}
                      </Badge>
                      <span>{log.message}</span>
                      {log.data && (
                        <pre className="text-xs text-muted-foreground">
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
