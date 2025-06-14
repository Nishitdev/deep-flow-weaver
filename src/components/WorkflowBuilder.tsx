import React, { useCallback, useState, useEffect, useRef } from 'react';
import {
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  Node,
  Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Import refactored components
import { Sidebar } from './WorkflowSidebar';
import { WorkflowHeader } from './WorkflowHeader';
import { WorkflowCanvas } from './workflow/WorkflowCanvas';
import { WorkflowToolbar } from './workflow/WorkflowToolbar';

// Import dialog components
import { NodeConfigPanel } from './NodeConfigPanel';
import { SaveWorkflowDialog } from './SaveWorkflowDialog';
import { LoadWorkflowDialog } from './LoadWorkflowDialog';
import { WorkflowLogs } from './WorkflowLogs';
import { ExecutionHistory } from './ExecutionHistory';
import { PerformanceMetrics } from './PerformanceMetrics';
import { DebugMode } from './DebugMode';
import { SettingsDialog } from './SettingsDialog';

// Import utilities and types
import { toast } from '@/hooks/use-toast';
import { WorkflowNodeData } from '@/types/workflow';
import { Workflow, useWorkflows } from '@/hooks/useWorkflows';
import { ReplicateService } from '@/services/replicateService';

/**
 * Execution log entry interface
 */
interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'error' | 'warning' | 'success';
  nodeId?: string;
  nodeName?: string;
}

/**
 * WorkflowBuilder Props
 */
interface WorkflowBuilderProps {
  initialWorkflow?: Workflow | null;
}

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

/**
 * WorkflowBuilderContent Component
 * 
 * Main content component for the workflow builder.
 * Handles all workflow operations, state management, and node execution.
 */
const WorkflowBuilderContent: React.FC<WorkflowBuilderProps> = ({ initialWorkflow }) => {
  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { screenToFlowPosition } = useReactFlow();

  // UI state
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null);

  // Dialog states
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [showLogsDialog, setShowLogsDialog] = useState(false);
  const [showExecutionHistory, setShowExecutionHistory] = useState(false);
  const [showPerformanceMetrics, setShowPerformanceMetrics] = useState(false);
  const [showDebugMode, setShowDebugMode] = useState(false);

  // Execution state
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionLogs, setExecutionLogs] = useState<LogEntry[]>([]);
  const [currentWorkflowId, setCurrentWorkflowId] = useState<string | null>(null);

  // Hooks and refs
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

  // Keyboard shortcut for deleting selected nodes
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        const selectedNodes = nodes.filter(node => node.selected);
        if (selectedNodes.length > 0) {
          event.preventDefault();
          deleteSelectedNodes();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [nodes]);

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

  // Debounced auto-save when nodes or edges change
  useEffect(() => {
    if (!currentWorkflowId) return;

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSaveWorkflow(nodes, edges);
    }, 1000);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [nodes, edges, currentWorkflowId, autoSaveWorkflow]);

  /**
   * Add execution log entry
   */
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

  const deleteSelectedNodes = useCallback(() => {
    const selectedNodes = nodes.filter(node => node.selected);
    if (selectedNodes.length === 0) return;

    const selectedNodeIds = selectedNodes.map(node => node.id);
    
    setNodes((nds) => nds.filter((node) => !selectedNodeIds.includes(node.id)));
    setEdges((eds) => eds.filter((edge) => 
      !selectedNodeIds.includes(edge.source) && !selectedNodeIds.includes(edge.target)
    ));
    
    if (selectedNode && selectedNodeIds.includes(selectedNode.id)) {
      setSelectedNode(null);
    }
    
    toast({
      title: "Nodes Deleted",
      description: `${selectedNodes.length} node(s) and their connections have been removed successfully.`,
    });
  }, [nodes, setNodes, setEdges, selectedNode]);

  const addNode = useCallback((nodeData: Partial<WorkflowNodeData>, position?: { x: number; y: number }) => {
    const newNode: Node = {
      id: `${Date.now()}`,
      type: 'workflowNode',
      position: position || { x: Math.random() * 400 + 300, y: Math.random() * 300 + 200 },
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

  // Handle drag and drop
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();

    const nodeData = event.dataTransfer.getData('application/reactflow');
    
    if (!nodeData) {
      return;
    }

    const parsedNodeData = JSON.parse(nodeData) as Partial<WorkflowNodeData>;
    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    addNode(parsedNodeData, position);
  }, [screenToFlowPosition, addNode]);

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
      const nodeResults = new Map<string, any>();
      
      const triggerNodes = nodes.filter(node => 
        !edges.some(edge => edge.target === node.id)
      );

      if (triggerNodes.length === 0) {
        addExecutionLog("No trigger nodes found. Executing all nodes in order.", "warning");
        await executeNodesInOrder(nodes, nodeResults);
      } else {
        for (const triggerNode of triggerNodes) {
          await executeNodeAndDependents(triggerNode, nodeResults);
        }
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

  const executeNodeAndDependents = async (node: Node, nodeResults: Map<string, any>): Promise<any> => {
    const nodeData = node.data as WorkflowNodeData;
    const nodeName = nodeData.label || `Node ${node.id}`;
    
    if (nodeResults.has(node.id)) {
      return nodeResults.get(node.id);
    }

    addExecutionLog(`Starting execution of node: ${nodeName}`, "info", node.id, nodeName);
    
    setNodes((nds) =>
      nds.map((n) =>
        n.id === node.id
          ? { ...n, className: 'node-executing' }
          : n
      )
    );

    try {
      let result = null;

      if (nodeData.type === 'fluxSchnell') {
        const prompt = nodeData.config?.prompt || 'A beautiful landscape';
        addExecutionLog(`Generating image with prompt: "${prompt}"`, "info", node.id, nodeName);
        
        const replicateService = new ReplicateService('');
        const generationResult = await replicateService.generateImage(prompt);
        
        if (generationResult.error) {
          throw new Error(generationResult.error);
        }
        
        if (generationResult.output && generationResult.output.length > 0) {
          const imageUrl = generationResult.output[0];
          result = { imageUrl, type: 'image' };
          
          setNodes((nds) =>
            nds.map((n) =>
              n.id === node.id
                ? {
                    ...n,
                    data: {
                      ...nodeData,
                      config: {
                        ...nodeData.config,
                        generatedImageUrl: imageUrl
                      }
                    },
                    className: ''
                  }
                : n
            )
          );
          
          addExecutionLog(`Image generated successfully: ${imageUrl}`, "success", node.id, nodeName);
        }
      } else if (nodeData.type === 'input') {
        const inputText = nodeData.config?.inputText || 'Default input';
        result = { text: inputText, type: 'text' };
        addExecutionLog(`Input received: "${inputText}"`, "success", node.id, nodeName);
      } else if (nodeData.type === 'imageOutput') {
        const connectedEdges = edges.filter(edge => edge.target === node.id);
        
        if (connectedEdges.length > 0) {
          for (const edge of connectedEdges) {
            const sourceResult = nodeResults.get(edge.source);
            if (sourceResult && sourceResult.type === 'image') {
              setNodes((nds) =>
                nds.map((n) =>
                  n.id === node.id
                    ? {
                        ...n,
                        data: {
                          ...nodeData,
                          config: {
                            ...nodeData.config,
                            displayImageUrl: sourceResult.imageUrl,
                            imageUrl: sourceResult.imageUrl,
                            uploadType: 'url'
                          }
                        },
                        className: ''
                      }
                    : n
                )
              );
              
              addExecutionLog(`Image displayed in output node: ${sourceResult.imageUrl}`, "success", node.id, nodeName);
              result = sourceResult;
              break;
            }
          }
        } else {
          addExecutionLog("No image data received for output node", "warning", node.id, nodeName);
        }
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000));
        addExecutionLog(`Node "${nodeName}" executed`, "success", node.id, nodeName);
      }

      nodeResults.set(node.id, result);

      const dependentEdges = edges.filter(edge => edge.source === node.id);
      for (const edge of dependentEdges) {
        const dependentNode = nodes.find(n => n.id === edge.target);
        if (dependentNode) {
          await executeNodeAndDependents(dependentNode, nodeResults);
        }
      }

      return result;
    } catch (error) {
      addExecutionLog(`Node execution failed: ${error}`, "error", node.id, nodeName);
      throw error;
    } finally {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === node.id
            ? { ...n, className: '' }
            : n
        )
      );
    }
  };

  const executeNodesInOrder = async (nodesToExecute: Node[], nodeResults: Map<string, any>) => {
    for (let i = 0; i < nodesToExecute.length; i++) {
      const node = nodesToExecute[i];
      await executeNodeAndDependents(node, nodeResults);
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

  /**
   * Transform nodes for metrics display
   */
  const transformedNodes = nodes.map(node => ({
    id: node.id,
    data: {
      label: (node.data as WorkflowNodeData).label || 'Unknown Node',
      type: (node.data as WorkflowNodeData).type || 'default',
    },
  }));

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar with node palette */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onAddNode={addNode} 
      />
      
      <div className="flex-1 flex flex-col">
        {/* Header with toolbar */}
        <WorkflowHeader>
          <SettingsDialog />
          <WorkflowToolbar
            isExecuting={isExecuting}
            onExecute={executeWorkflow}
            onStop={stopWorkflow}
            onSave={() => setShowSaveDialog(true)}
            onLoad={() => setShowLoadDialog(true)}
            onShowLogs={() => setShowLogsDialog(true)}
            onShowHistory={() => setShowExecutionHistory(true)}
            onShowMetrics={() => setShowPerformanceMetrics(true)}
            onShowDebug={() => setShowDebugMode(true)}
            nodesCount={nodes.length}
          />
        </WorkflowHeader>

        {/* Main canvas area */}
        <div className="flex-1 relative">
          <WorkflowCanvas
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onDragOver={onDragOver}
            onDrop={onDrop}
            highlightedNodeId={highlightedNodeId}
          />

          {/* Node configuration panel */}
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

      {/* Dialog components */}
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
        nodes={transformedNodes}
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

/**
 * WorkflowBuilder Component
 * 
 * Main wrapper component that provides ReactFlow context.
 */
export const WorkflowBuilder: React.FC<WorkflowBuilderProps> = (props) => {
  return (
    <ReactFlowProvider>
      <WorkflowBuilderContent {...props} />
    </ReactFlowProvider>
  );
};
