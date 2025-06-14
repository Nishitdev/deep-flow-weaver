
import React, { useEffect } from 'react';
import { Node, Edge } from '@xyflow/react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useWorkflows, Workflow } from '@/hooks/useWorkflows';
import { formatDistanceToNow } from 'date-fns';
import { Trash2, Download } from 'lucide-react';

interface LoadWorkflowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoadWorkflow: (nodes: Node[], edges: Edge[]) => void;
}

export const LoadWorkflowDialog: React.FC<LoadWorkflowDialogProps> = ({
  open,
  onOpenChange,
  onLoadWorkflow,
}) => {
  const { workflows, isLoading, loadWorkflows, deleteWorkflow } = useWorkflows();

  useEffect(() => {
    if (open) {
      loadWorkflows();
    }
  }, [open]);

  const handleLoad = (workflow: Workflow) => {
    onLoadWorkflow(workflow.nodes, workflow.edges);
    onOpenChange(false);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deleteWorkflow(id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[600px]">
        <DialogHeader>
          <DialogTitle>Load Workflow</DialogTitle>
          <DialogDescription>
            Select a saved workflow to load into the editor.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 max-h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">Loading workflows...</div>
            </div>
          ) : workflows.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">No saved workflows found.</div>
            </div>
          ) : (
            <div className="space-y-2">
              {workflows.map((workflow, index) => (
                <div key={workflow.id}>
                  <div 
                    className="p-4 border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors group"
                    onClick={() => handleLoad(workflow)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{workflow.name}</h4>
                        {workflow.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {workflow.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>{workflow.nodes.length} nodes</span>
                          <span>{workflow.edges.length} connections</span>
                          <span>
                            {formatDistanceToNow(new Date(workflow.updated_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLoad(workflow);
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => handleDelete(e, workflow.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  {index < workflows.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
