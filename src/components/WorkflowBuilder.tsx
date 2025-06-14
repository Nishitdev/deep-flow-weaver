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
 * Enhanced main content component for the workflow builder.
 * Features:
 * - Improved auto-save mechanism with better error handling
 * - Enhanced node persistence
 * - Better state management and cleanup
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

  // Enhanced hooks and refs for better persistence
  const { updateWorkflow } = useWorkflows();
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveRef = useRef<{ nodes: Node[], edges: Edge[] } | null>(null);

  // Load initial workflow if provided
  useEffect(() => {
    if (initialWorkflow) {
      console.log('Loading initial workflow:', initialWorkflow);
      setNodes(initialWorkflow.nodes);
      setEdges(initialWorkflow.edges);
      setCurrentWorkflowId(initialWorkflow.id);
      lastSaveRef.current = { nodes: initialWorkflow.nodes, edges: initialWorkflow.edges };
      toast({
        title: "Workflow Loaded",
        description: `"${initialWorkflow.name}" has been loaded successfully!`,
      });
    }
  }, [initialWorkflow, setNodes, setEdges]);

  // Enhanced keyboard shortcut handling
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Delete selected nodes
      if (event.key === 'Delete' || event.key === 'Backspace') {
        const selectedNodes = nodes.filter(node => node.selected);
        if (selectedNodes.length > 0) {
          event.preventDefault();
          deleteSelectedNodes();
        }
      }
      
      // Ctrl+S to save (prevent browser save)
      if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        if (currentWorkflowId) {
          triggerAutoSave();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [nodes, currentWorkflowId]);

  /**
   * Enhanced auto-save workflow changes with better error handling and deduplication
   */
  const autoSaveWorkflow = useCallback(async (nodesToSave: Node[], edgesToSave: Edge[]) => {
    if (!currentWorkflowId) {
      console.log('No workflow ID available for auto-save');
      return;
    }

    // Check if there are actual changes to save
    const lastSave = lastSaveRef.current;
    if (lastSave && 
        JSON.stringify(lastSave.nodes) === JSON.stringify(nodesToSave) &&
        JSON.stringify(lastSave.edges) === JSON.stringify(edgesToSave)) {
      console.log('No changes detected, skipping auto-save');
      return;
    }

    try {
      console.log('Auto-saving workflow changes...');
      await updateWorkflow(currentWorkflowId, {
        nodes: nodesToSave,
        edges: edgesToSave,
      });
      
      // Update the last save reference
      lastSaveRef.current = { nodes: nodesToSave, edges: edgesToSave };
      console.log('Workflow auto-saved successfully');
    } catch (error) {
      console.error('Failed to auto-save workflow:', error);
      toast({
        title: "Auto-save Failed",
        description: "Failed to save changes automatically. Please save manually.",
        variant: "destructive",
      });
    }
  }, [currentWorkflowId, updateWorkflow]);

  /**
   * Trigger immediate auto-save
   */
  const triggerAutoSave = useCallback(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    autoSaveWorkflow(nodes, edges);
  }, [autoSaveWorkflow, nodes, edges]);

  // Enhanced debounced auto-save when nodes or edges change
  useEffect(() => {
    if (!currentWorkflowId) return;

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Debounce auto-save by 2 seconds to avoid excessive saves
    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSaveWorkflow(nodes, edges);
    }, 2000);

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
    console.log('Deleting node:', nodeId);
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
    console.log('Deleting selected nodes:', selectedNodeIds);
    
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
    console.log('Adding new node:', newNode);
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
    console.log('Loading workflow:', { nodesCount: loadedNodes.length, edgesCount: loadedEdges.length });
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

  /**
   * Get input data for a node from its connected inputs
   */
  const getNodeInputData = (nodeId: string, nodeResults: Map<string, any>): any => {
    const incomingEdges = edges.filter(edge => edge.target === nodeId);
    
    if (incomingEdges.length === 0) {
      return null;
    }

    // For nodes with single input, return the direct result
    if (incomingEdges.length === 1) {
      const sourceResult = nodeResults.get(incomingEdges[0].source);
      return sourceResult;
    }

    // For nodes with multiple inputs, return an object with all inputs
    const inputs: Record<string, any> = {};
    incomingEdges.forEach((edge, index) => {
      const sourceResult = nodeResults.get(edge.source);
      inputs[`input_${index}`] = sourceResult;
    });

    return inputs;
  };

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
      
      // Find trigger nodes (nodes with no incoming edges)
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

      // Get input data from connected nodes
      const inputData = getNodeInputData(node.id, nodeResults);

      if (nodeData.type === 'fluxSchnell') {
        // For Flux Schnell, use input from connected nodes or fallback to configured prompt
        let prompt = nodeData.config?.prompt || 'A beautiful landscape';
        
        if (inputData && inputData.text) {
          prompt = inputData.text;
          addExecutionLog(`Using input from connected node: "${prompt}"`, "info", node.id, nodeName);
        } else if (inputData && typeof inputData === 'string') {
          prompt = inputData;
          addExecutionLog(`Using input from connected node: "${prompt}"`, "info", node.id, nodeName);
        } else {
          addExecutionLog(`Using configured prompt: "${prompt}"`, "info", node.id, nodeName);
        }
        
        addExecutionLog(`Generating image with prompt: "${prompt}"`, "info", node.id, nodeName);
        
        const replicateService = new ReplicateService('');
        const generationResult = await replicateService.generateImage(prompt);
        
        if (generationResult.error) {
          throw new Error(generationResult.error);
        }
        
        if (generationResult.output && generationResult.output.length > 0) {
          const imageUrl = generationResult.output[0];
          result = { imageUrl, type: 'image', prompt };
          
          setNodes((nds) =>
            nds.map((n) =>
              n.id === node.id
                ? {
                    ...n,
                    data: {
                      ...nodeData,
                      config: {
                        ...nodeData.config,
                        generatedImageUrl: imageUrl,
                        prompt: prompt // Update the prompt that was actually used
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
        addExecutionLog(`Input provided: "${inputText}"`, "success", node.id, nodeName);
      } else if (nodeData.type === 'imageOutput') {
        if (inputData && inputData.type === 'image') {
          setNodes((nds) =>
            nds.map((n) =>
              n.id === node.id
                ? {
                    ...n,
                    data: {
                      ...nodeData,
                      config: {
                        ...nodeData.config,
                        displayImageUrl: inputData.imageUrl,
                        imageUrl: inputData.imageUrl,
                        uploadType: 'url'
                      }
                    },
                    className: ''
                  }
                : n
            )
          );
          
          addExecutionLog(`Image displayed in output node: ${inputData.imageUrl}`, "success", node.id, nodeName);
          result = inputData;
        } else {
          addExecutionLog("No image data received for output node", "warning", node.id, nodeName);
        }
      } else {
        // Default node processing
        await new Promise(resolve => setTimeout(resolve, 1000));
        result = inputData || { type: 'default', data: 'processed' };
        addExecutionLog(`Node "${nodeName}" executed`, "success", node.id, nodeName);
      }

      nodeResults.set(node.id, result);

      // Execute dependent nodes
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
