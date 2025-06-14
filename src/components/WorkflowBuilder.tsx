import React, { useCallback, useState, useEffect, useRef } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { WorkflowNode } from './WorkflowNode';
import { Sidebar } from './WorkflowSidebar';
import { WorkflowHeader } from './WorkflowHeader';
import { NodeConfigPanel } from './NodeConfigPanel';
import { SaveWorkflowDialog } from './SaveWorkflowDialog';
import { LoadWorkflowDialog } from './LoadWorkflowDialog';
import { WorkflowLogs } from './WorkflowLogs';
import { Play, Square, Save, FolderOpen, Logs } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { WorkflowNodeData } from '@/types/workflow';
import { Workflow, useWorkflows } from '@/hooks/useWorkflows';
import { ExecutionHistory } from './ExecutionHistory';
import { PerformanceMetrics } from './PerformanceMetrics';
import { DebugMode } from './DebugMode';
import { CustomCodeNode } from './CustomCodeNode';

const nodeTypes = {
  workflowNode: WorkflowNode,
  customCode: CustomCodeNode,
};

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'error' | 'warning' | 'success';
  nodeId?: string;
  nodeName?: string;
}

interface WorkflowBuilderProps {
  initialWorkflow?: Workflow | null;
}

export const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({ initialWorkflow }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [showLogsDialog, setShowLogsDialog] = useState(false);
  const [showExecutionHistory, setShowExecutionHistory] = useState(false);
  const [showPerformanceMetrics, setShowPerformanceMetrics] = useState(false);
  const [showDebugMode, setShowDebugMode] = useState(false);
  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null);
  const [currentWorkflowId, setCurrentWorkflowId] = useState<string | null>(null);
  const [executionLogs, setExecutionLogs] = useState<LogEntry[]>([]);
  const { updateWorkflow } = useWorkflows();
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load initial workflow if provided
  useEffect(() => {
    if (initialWorkflow) {
      setNodes(initialWorkflow.nodes);
      setEdges(initialWorkflow.edges);
      setCurrentWorkflowId(initialWorkflow.id);
      toast({
        title: "Workflow Loaded",
        description: `"${initialWorkflow.name}" has been loaded successfully!`,
      });
    }
  }, [initialWorkflow, setNodes, setEdges]);

  // Auto-save workflow changes
  const autoSaveWorkflow = useCallback(async (nodesToSave: Node[], edgesToSave: Edge[]) => {
    if (!currentWorkflowId) return;

    try {
      await updateWorkflow(currentWorkflowId, {
        nodes: nodesToSave,
        edges: edgesToSave,
      });
      console.log('Workflow auto-saved successfully');
    } catch (error) {
      console.error('Failed to auto-save workflow:', error);
    }
  }, [currentWorkflowId, updateWorkflow]);

  // Debounced auto-save when nodes change
  useEffect(() => {
    if (!currentWorkflowId || nodes.length === 0) return;

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSaveWorkflow(nodes, edges);
    }, 1000); // Auto-save after 1 second of inactivity

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [nodes, currentWorkflowId, autoSaveWorkflow, edges]);

  // Debounced auto-save when edges change
  useEffect(() => {
    if (!currentWorkflowId || edges.length === 0) return;

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSaveWorkflow(nodes, edges);
    }, 1000); // Auto-save after 1 second of inactivity

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [edges, currentWorkflowId, autoSaveWorkflow, nodes]);

  const addExecutionLog = (message: string, type: LogEntry['type'] = 'info', nodeId?: string, nodeName?: string) => {
    const newLog: LogEntry = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date().toLocaleTimeString(),
      message,
      type,
      nodeId,
      nodeName,
    };
    setExecutionLogs(prev => [...prev, newLog]);
  };

  const clearExecutionLogs = () => {
    setExecutionLogs([]);
  };

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const deleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
    
    toast({
      title: "Node Deleted",
      description: "Node and its connections have been removed successfully.",
    });
  }, [setNodes, setEdges, selectedNode]);

  const addNode = useCallback((nodeData: Partial<WorkflowNodeData>) => {
    const newNode: Node = {
      id: `${Date.now()}`,
      type: 'workflowNode',
      position: { x: Math.random() * 400 + 300, y: Math.random() * 300 + 200 },
      data: {
        type: nodeData.type || 'default',
        label: nodeData.label || 'New Node',
        icon: nodeData.icon || 'play',
        description: nodeData.description || 'Description',
        config: nodeData.config || {},
        onDelete: deleteNode,
      },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes, deleteNode]);

  // Update existing nodes to include the delete function
  useEffect(() => {
    setNodes((nds) => 
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          onDelete: deleteNode,
        },
      }))
    );
  }, [deleteNode, setNodes]);

  const loadWorkflow = useCallback((loadedNodes: Node[], loadedEdges: Edge[]) => {
    setNodes(loadedNodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        onDelete: deleteNode,
      },
    })));
    setEdges(loadedEdges);
    clearExecutionLogs();
    toast({
      title: "Workflow Loaded",
      description: "Workflow has been loaded successfully!",
    });
  }, [setNodes, setEdges, deleteNode]);

  const executeWorkflow = async () => {
    if (nodes.length === 0) {
      toast({
        title: "No Nodes Found",
        description: "Please add some nodes to execute the workflow.",
        variant: "destructive",
      });
      return;
    }

    setIsExecuting(true);
    clearExecutionLogs();
    
    addExecutionLog("Workflow execution started", "info");
    addExecutionLog(`Found ${nodes.length} nodes to execute`, "info");
    
    toast({
      title: "Workflow Execution Started",
      description: "Your workflow is now running...",
    });

    const startTime = Date.now();

    try {
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const nodeData = node.data as WorkflowNodeData;
        const nodeName = nodeData.label || `Node ${i + 1}`;
        
        addExecutionLog(`Starting execution of node: ${nodeName}`, "info", node.id, nodeName);
        
        setNodes((nds) =>
          nds.map((n) =>
            n.id === node.id
              ? { ...n, className: 'node-executing' }
              : { ...n, className: '' }
          )
        );

        const executionTime = 1000 + Math.random() * 1000;
        addExecutionLog(`Processing ${nodeData.type} node...`, "info", node.id, nodeName);
        
        await new Promise(resolve => setTimeout(resolve, executionTime));

        if (nodeData.type === 'input') {
          const inputText = nodeData.config?.inputText || 'Default input';
          addExecutionLog(`Input received: "${inputText}"`, "success", node.id, nodeName);
        } else if (nodeData.type === 'output') {
          const inputNodes = nodes.filter(n => {
            const data = n.data as WorkflowNodeData;
            return data.type === 'input';
          });
          
          if (inputNodes.length > 0) {
            const inputNodeData = inputNodes[0].data as WorkflowNodeData;
            const inputText = inputNodeData.config?.inputText || 'Hello World';
            
            setNodes((nds) =>
              nds.map((n) =>
                n.id === node.id
                  ? { 
                      ...n, 
                      data: { 
                        ...nodeData, 
                        config: { 
                          ...nodeData.config, 
                          outputText: inputText 
                        } 
                      },
                      className: ''
                    }
                  : n.className === 'node-executing' ? { ...n, className: '' } : n
              )
            );
            
            addExecutionLog(`Output generated: "${inputText}"`, "success", node.id, nodeName);
          } else {
            addExecutionLog("No input data available for output node", "warning", node.id, nodeName);
          }
        } else if (nodeData.type === 'trigger') {
          addExecutionLog("Trigger activated successfully", "success", node.id, nodeName);
        } else if (nodeData.type === 'customCode') {
          const code = nodeData.config?.code || '';
          const language = nodeData.config?.language || 'javascript';
          addExecutionLog(`Executing ${language} code...`, "info", node.id, nodeName);
          
          if (code.includes('console.log')) {
            addExecutionLog("Code executed with console output", "success", node.id, nodeName);
          } else {
            addExecutionLog("Code executed successfully", "success", node.id, nodeName);
          }
        }

        addExecutionLog(`Node "${nodeName}" completed successfully`, "success", node.id, nodeName);
        
        setNodes((nds) =>
          nds.map((n) =>
            n.id === node.id
              ? { ...n, className: '' }
              : n
          )
        );
      }

      const totalTime = Date.now() - startTime;
      addExecutionLog(`Workflow completed in ${(totalTime / 1000).toFixed(2)} seconds`, "success");
      
      toast({
        title: "Workflow Completed",
        description: "Your workflow has been executed successfully!",
      });
      
    } catch (error) {
      addExecutionLog(`Workflow execution failed: ${error}`, "error");
      toast({
        title: "Execution Failed",
        description: "An error occurred during workflow execution.",
        variant: "destructive",
      });
    } finally {
      setIsExecuting(false);
      setNodes((nds) => nds.map((node) => ({ ...node, className: '' })));
    }
  };

  const stopWorkflow = () => {
    setIsExecuting(false);
    setNodes((nds) => nds.map((node) => ({ ...node, className: '' })));
    addExecutionLog("Workflow execution stopped by user", "warning");
    toast({
      title: "Workflow Stopped",
      description: "Workflow execution has been terminated.",
    });
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onAddNode={addNode} 
      />
      
      <div className="flex-1 flex flex-col">
        <WorkflowHeader>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowSaveDialog(true)}
              variant="outline"
              disabled={nodes.length === 0}
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button
              onClick={() => setShowLoadDialog(true)}
              variant="outline"
            >
              <FolderOpen className="w-4 h-4 mr-2" />
              Load
            </Button>
            <Button
              onClick={() => setShowLogsDialog(true)}
              variant="outline"
            >
              <Logs className="w-4 h-4 mr-2" />
              Logs
            </Button>
            <Button
              onClick={() => setShowExecutionHistory(true)}
              variant="outline"
            >
              History
            </Button>
            <Button
              onClick={() => setShowPerformanceMetrics(true)}
              variant="outline"
            >
              Metrics
            </Button>
            <Button
              onClick={() => setShowDebugMode(true)}
              variant="outline"
            >
              Debug
            </Button>
            <Button
              onClick={executeWorkflow}
              disabled={isExecuting}
              className="bg-green-600 hover:bg-green-700"
            >
              <Play className="w-4 h-4 mr-2" />
              {isExecuting ? 'Executing...' : 'Run Workflow'}
            </Button>
            {isExecuting && (
              <Button
                onClick={stopWorkflow}
                variant="destructive"
                size="sm"
              >
                <Square className="w-4 h-4 mr-2" />
                Stop
              </Button>
            )}
          </div>
        </WorkflowHeader>

        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes.map(node => ({
              ...node,
              className: node.id === highlightedNodeId ? 'node-highlighted' : undefined,
            }))}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            className="workflow-canvas"
            fitView
          >
            <Background 
              variant={BackgroundVariant.Dots} 
              gap={20} 
              size={1}
              color="rgba(139, 92, 246, 0.3)"
            />
            <Controls 
              className="!bg-gray-800/90 !border-gray-600/50 !backdrop-blur-sm !shadow-lg !rounded-lg [&_button]:!bg-gray-700/80 [&_button]:!border-gray-600/50 [&_button]:!text-gray-200 [&_button:hover]:!bg-gray-600/80"
              showZoom={true}
              showFitView={true}
              showInteractive={true}
              position="bottom-left"
            />
            <MiniMap 
              className="!bg-card/90 !border-border !backdrop-blur-sm !shadow-lg !rounded-lg"
              nodeColor={(node) => {
                switch (node.type) {
                  case 'customCode':
                    return '#8b5cf6';
                  case 'workflowNode':
                    const nodeData = node.data as any;
                    switch (nodeData?.type) {
                      case 'input':
                        return '#ef4444';
                      case 'output':
                        return '#10b981';
                      case 'trigger':
                        return '#06b6d4';
                      default:
                        return '#6366f1';
                    }
                  default:
                    return '#6366f1';
                }
              }}
              maskColor="rgba(0, 0, 0, 0.8)"
              pannable
              zoomable
            />
          </ReactFlow>

          {selectedNode && (
            <NodeConfigPanel
              node={selectedNode}
              onClose={() => setSelectedNode(null)}
              onUpdate={(updatedNode) => {
                setNodes((nds) =>
                  nds.map((node) =>
                    node.id === updatedNode.id ? updatedNode : node
                  )
                );
                setSelectedNode(updatedNode);
              }}
            />
          )}
        </div>
      </div>

      <SaveWorkflowDialog
        open={showSaveDialog}
        onOpenChange={setShowSaveDialog}
        nodes={nodes}
        edges={edges}
      />

      <LoadWorkflowDialog
        open={showLoadDialog}
        onOpenChange={setShowLoadDialog}
        onLoadWorkflow={loadWorkflow}
      />

      <WorkflowLogs
        open={showLogsDialog}
        onOpenChange={setShowLogsDialog}
        workflowId={initialWorkflow?.id}
        logs={executionLogs}
      />

      <ExecutionHistory
        open={showExecutionHistory}
        onOpenChange={setShowExecutionHistory}
        workflowId={initialWorkflow?.id}
      />

      <PerformanceMetrics
        open={showPerformanceMetrics}
        onOpenChange={setShowPerformanceMetrics}
        workflowId={initialWorkflow?.id}
        executionLogs={executionLogs}
        nodes={nodes}
      />

      <DebugMode
        open={showDebugMode}
        onOpenChange={setShowDebugMode}
        nodes={nodes}
        edges={edges}
        onNodeHighlight={setHighlightedNodeId}
        executionLogs={executionLogs}
      />
    </div>
  );
};
