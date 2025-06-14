
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WorkflowBuilder as WorkflowBuilderComponent } from '@/components/WorkflowBuilder';
import { useWorkflows } from '@/hooks/useWorkflows';
import { toast } from '@/hooks/use-toast';

const WorkflowBuilderPage = () => {
  const navigate = useNavigate();
  const { workflowId } = useParams<{ workflowId: string }>();
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading workflow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-black text-white">
      <div className="h-16 border-b border-gray-700 bg-gray-900 flex items-center px-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBackToDashboard}
          className="mr-4 text-gray-300 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-white">
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
