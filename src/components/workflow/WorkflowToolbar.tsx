
import React from 'react';
import { Play, Square, Save, FolderOpen, Logs } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * WorkflowToolbar Component
 * 
 * Contains action buttons for workflow operations like save, load, execute, etc.
 */
interface WorkflowToolbarProps {
  isExecuting: boolean;
  onExecute: () => void;
  onStop: () => void;
  onSave: () => void;
  onLoad: () => void;
  onShowLogs: () => void;
  onShowHistory: () => void;
  onShowMetrics: () => void;
  onShowDebug: () => void;
  nodesCount: number;
}

export const WorkflowToolbar: React.FC<WorkflowToolbarProps> = ({
  isExecuting,
  onExecute,
  onStop,
  onSave,
  onLoad,
  onShowLogs,
  onShowHistory,
  onShowMetrics,
  onShowDebug,
  nodesCount,
}) => {
  return (
    <div className="flex items-center gap-2">
      {/* Save workflow */}
      <Button
        onClick={onSave}
        variant="outline"
        disabled={nodesCount === 0}
        title={nodesCount === 0 ? "Add nodes to save workflow" : "Save workflow"}
      >
        <Save className="w-4 h-4 mr-2" />
        Save
      </Button>

      {/* Load workflow */}
      <Button
        onClick={onLoad}
        variant="outline"
        title="Load existing workflow"
      >
        <FolderOpen className="w-4 h-4 mr-2" />
        Load
      </Button>

      {/* View logs */}
      <Button
        onClick={onShowLogs}
        variant="outline"
        title="View execution logs"
      >
        <Logs className="w-4 h-4 mr-2" />
        Logs
      </Button>

      {/* Additional tools */}
      <Button
        onClick={onShowHistory}
        variant="outline"
        title="View execution history"
      >
        History
      </Button>

      <Button
        onClick={onShowMetrics}
        variant="outline"
        title="View performance metrics"
      >
        Metrics
      </Button>

      <Button
        onClick={onShowDebug}
        variant="outline"
        title="Open debug mode"
      >
        Debug
      </Button>

      {/* Execution controls */}
      <Button
        onClick={onExecute}
        disabled={isExecuting || nodesCount === 0}
        className="bg-green-600 hover:bg-green-700"
        title={nodesCount === 0 ? "Add nodes to execute workflow" : "Run workflow"}
      >
        <Play className="w-4 h-4 mr-2" />
        {isExecuting ? 'Executing...' : 'Run Workflow'}
      </Button>

      {/* Stop execution */}
      {isExecuting && (
        <Button
          onClick={onStop}
          variant="destructive"
          size="sm"
          title="Stop workflow execution"
        >
          <Square className="w-4 h-4 mr-2" />
          Stop
        </Button>
      )}
    </div>
  );
};
