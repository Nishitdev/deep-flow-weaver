
import React, { useCallback, useState } from 'react';
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
import { Play, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { WorkflowNodeData } from '@/types/workflow';

const nodeTypes = {
  workflowNode: WorkflowNode,
};

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'workflowNode',
    position: { x: 100, y: 100 },
    data: {
      type: 'trigger',
      label: 'Manual Trigger',
      icon: 'play',
      description: 'Start workflow manually',
      config: {},
    },
  },
];

const initialEdges: Edge[] = [];

export const WorkflowBuilder: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const addNode = useCallback((nodeData: Partial<WorkflowNodeData>) => {
    const newNode: Node = {
      id: `${nodes.length + 1}`,
      type: 'workflowNode',
      position: { x: Math.random() * 400 + 200, y: Math.random() * 400 + 200 },
      data: {
        type: nodeData.type || 'default',
        label: nodeData.label || 'New Node',
        icon: nodeData.icon || 'play',
        description: nodeData.description || 'Description',
        config: nodeData.config || {},
      },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [nodes.length, setNodes]);

  const executeWorkflow = async () => {
    setIsExecuting(true);
    toast({
      title: "Workflow Execution Started",
      description: "Your workflow is now running...",
    });

    // Simulate workflow execution
    for (let i = 0; i < nodes.length; i++) {
      const nodeId = nodes[i].id;
      
      // Add executing class
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? { ...node, className: 'node-executing' }
            : { ...node, className: '' }
        )
      );

      await new Promise(resolve => setTimeout(resolve, 1500));

      // Remove executing class
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? { ...node, className: '' }
            : node
        )
      );
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
    </div>
  );
};
