
import React from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  BackgroundVariant,
  SelectionMode,
} from '@xyflow/react';
import { WorkflowNode } from '../WorkflowNode';
import { CustomCodeNode } from '../CustomCodeNode';

/**
 * WorkflowCanvas Component
 * 
 * Main canvas area for the workflow builder.
 * Handles node and edge rendering, interactions, and background.
 */

const nodeTypes = {
  workflowNode: WorkflowNode,
  customCode: CustomCodeNode,
};

interface WorkflowCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: any) => void;
  onNodeClick: (event: React.MouseEvent, node: Node) => void;
  onDragOver: (event: React.DragEvent) => void;
  onDrop: (event: React.DragEvent) => void;
  highlightedNodeId?: string | null;
}

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onDragOver,
  onDrop,
  highlightedNodeId,
}) => {
  /**
   * Add highlighting class to nodes when needed
   */
  const nodesWithHighlight = nodes.map(node => ({
    ...node,
    className: node.id === highlightedNodeId ? 'node-highlighted' : undefined,
  }));

  /**
   * Determine node color for minimap based on node type
   */
  const getMinimapNodeColor = (node: Node) => {
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
  };

  return (
    <ReactFlow
      nodes={nodesWithHighlight}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeClick={onNodeClick}
      onDragOver={onDragOver}
      onDrop={onDrop}
      nodeTypes={nodeTypes}
      className="workflow-canvas"
      fitView
      selectionMode={SelectionMode.Partial}
      multiSelectionKeyCode={null}
      selectionKeyCode={null}
      panOnDrag={true}
      selectNodesOnDrag={false}
    >
      {/* Dotted background pattern */}
      <Background 
        variant={BackgroundVariant.Dots} 
        gap={20} 
        size={1}
        color="rgba(139, 92, 246, 0.3)"
      />
      
      {/* Control panel for zoom, fit view, etc. */}
      <Controls 
        className="!bg-gray-800/90 !border-gray-600/50 !backdrop-blur-sm !shadow-lg !rounded-lg [&_button]:!bg-gray-700/80 [&_button]:!border-gray-600/50 [&_button]:!text-gray-200 [&_button:hover]:!bg-gray-600/80"
        showZoom={true}
        showFitView={true}
        showInteractive={true}
        position="bottom-left"
      />
      
      {/* Minimap for navigation */}
      <MiniMap 
        className="!bg-card/90 !border-border !backdrop-blur-sm !shadow-lg !rounded-lg"
        nodeColor={getMinimapNodeColor}
        maskColor="rgba(0, 0, 0, 0.8)"
        pannable
        zoomable
      />
    </ReactFlow>
  );
};
