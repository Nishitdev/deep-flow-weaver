
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WorkflowBuilder as WorkflowBuilderComponent } from '@/components/WorkflowBuilder';
import { useWorkflows } from '@/hooks/useWorkflows';
import { toast } from '@/hooks/use-toast';

const WorkflowBuilderPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const workflowId = searchParams.get('workflow');
  const { loadWorkflows } = useWorkflows();
  const [loadedWorkflow, setLoadedWorkflow] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (workflowId) {
      loadExistingWorkflow();
    }
  }, [workflowId]);

  const loadExistingWorkflow = async () => {
    setIsLoading(true);
    try {
      const workflows = await loadWorkflows();
      const workflow = workflows.find(w => w.id === workflowId);
      if (workflow) {
        setLoadedWorkflow(workflow);
      } else {
        toast({
          title: "Workflow Not Found",
          description: "The requested workflow could not be found.",
          variant: "destructive",
        });
        navigate('/');
      }
    } catch (error) {
      console.error('Failed to load workflow:', error);
      toast({
        title: "Load Failed",
        description: "Failed to load the workflow. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading workflow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center px-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBackToDashboard}
          className="mr-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold">
            {loadedWorkflow ? `Editing: ${loadedWorkflow.name}` : 'New Workflow'}
          </h1>
        </div>
      </div>
      <div className="flex-1">
        <WorkflowBuilderComponent initialWorkflow={loadedWorkflow} />
      </div>
    </div>
  );
};

export default WorkflowBuilderPage;
