import React, { useCallback, useState, useEffect } from 'react';
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
import { Play, Square, Save, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { WorkflowNodeData } from '@/types/workflow';
import { Workflow } from '@/hooks/useWorkflows';

const nodeTypes = {
  workflowNode: WorkflowNode,
};

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

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

  // Load initial workflow if provided
  useEffect(() => {
    if (initialWorkflow) {
      setNodes(initialWorkflow.nodes);
      setEdges(initialWorkflow.edges);
      toast({
        title: "Workflow Loaded",
        description: `"${initialWorkflow.name}" has been loaded successfully!`,
      });
    }
  }, [initialWorkflow, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

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
      },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  const loadWorkflow = useCallback((loadedNodes: Node[], loadedEdges: Edge[]) => {
    setNodes(loadedNodes);
    setEdges(loadedEdges);
    toast({
      title: "Workflow Loaded",
      description: "Workflow has been loaded successfully!",
    });
  }, [setNodes, setEdges]);

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
    toast({
      title: "Workflow Execution Started",
      description: "Your workflow is now running...",
    });

    // Simulate workflow execution with proper data flow
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const nodeData = node.data as WorkflowNodeData;
      
      // Add executing class
      setNodes((nds) =>
        nds.map((n) =>
          n.id === node.id
            ? { ...n, className: 'node-executing' }
            : { ...n, className: '' }
        )
      );

      await new Promise(resolve => setTimeout(resolve, 1500));

      // For output nodes, simulate receiving data from input nodes
      if (nodeData.type === 'output') {
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
        }
      } else {
        // Remove executing class
        setNodes((nds) =>
          nds.map((n) =>
            n.id === node.id
              ? { ...n, className: '' }
              : n
          )
        );
      }
    }

    setIsExecuting(false);
    toast({
      title: "Workflow Completed",
      description: "Your workflow has been executed successfully!",
    });
  };

  const stopWorkflow = () => {
    setIsExecuting(false);
    setNodes((nds) => nds.map((node) => ({ ...node, className: '' })));
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
            nodes={nodes}
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
            <Controls className="glassmorphism" />
            <MiniMap 
              className="glassmorphism"
              nodeColor="#6366f1"
              maskColor="rgba(0, 0, 0, 0.8)"
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
    </div>
  );
};
