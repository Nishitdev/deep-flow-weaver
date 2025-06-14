
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Play, Edit, Trash2, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useWorkflows, Workflow } from '@/hooks/useWorkflows';
import { toast } from '@/hooks/use-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const { workflows, isLoading, loadWorkflows, deleteWorkflow } = useWorkflows();
  const [loadingWorkflows, setLoadingWorkflows] = useState(true);

  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        await loadWorkflows();
      } catch (error) {
        console.error('Failed to load workflows:', error);
      } finally {
        setLoadingWorkflows(false);
      }
    };

    fetchWorkflows();
  }, []);

  const handleCreateNew = () => {
    navigate('/builder');
  };

  const handleOpenWorkflow = (workflow: Workflow) => {
    navigate(`/builder?workflow=${workflow.id}`);
  };

  const handleDeleteWorkflow = async (workflowId: string, workflowName: string) => {
    if (window.confirm(`Are you sure you want to delete "${workflowName}"?`)) {
      try {
        await deleteWorkflow(workflowId);
      } catch (error) {
        console.error('Failed to delete workflow:', error);
      }
    }
  };

  if (loadingWorkflows) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading workflows...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Workflow Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Create and manage your AI workflows
            </p>
          </div>
          <Button onClick={handleCreateNew} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Create New Workflow
          </Button>
        </div>

        {/* Workflows Grid */}
        {workflows.length === 0 ? (
          <div className="text-center py-16">
            <FolderOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No workflows yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first workflow to get started with AI automation
            </p>
            <Button onClick={handleCreateNew} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Workflow
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflows.map((workflow) => (
              <Card key={workflow.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="truncate">{workflow.name}</span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenWorkflow(workflow)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteWorkflow(workflow.id, workflow.name)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        disabled={isLoading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardTitle>
                  {workflow.description && (
                    <CardDescription className="line-clamp-2">
                      {workflow.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <span>{workflow.nodes.length} nodes</span>
                    <span>{workflow.edges.length} connections</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Updated {new Date(workflow.updated_at).toLocaleDateString()}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenWorkflow(workflow)}
                      className="h-8"
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Open
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
