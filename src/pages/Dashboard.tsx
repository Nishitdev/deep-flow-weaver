import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Play, Edit, Trash2, FolderOpen, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useWorkflows, Workflow } from '@/hooks/useWorkflows';
import { CreateWorkflowDialog } from '@/components/CreateWorkflowDialog';
import { DeleteWorkflowDialog } from '@/components/DeleteWorkflowDialog';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  const navigate = useNavigate();
  const { workflows, isLoading, loadWorkflows, deleteWorkflow, updateWorkflow } = useWorkflows();
  const [loadingWorkflows, setLoadingWorkflows] = useState(true);
  const [editingWorkflow, setEditingWorkflow] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [workflowToDelete, setWorkflowToDelete] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      // Load workflows
      const fetchWorkflows = async () => {
        try {
          await loadWorkflows();
        } catch (error) {
          console.error('Failed to load workflows:', error);
          // If error is related to auth, redirect to login
          if (error instanceof Error && error.message.includes('sign in')) {
            navigate('/auth');
          }
        } finally {
          setLoadingWorkflows(false);
        }
      };

      fetchWorkflows();
    };

    checkAuth();
  }, [navigate]);

  const handleCreateNew = () => {
    setShowCreateDialog(true);
  };

  const handleOpenWorkflow = (workflow: Workflow) => {
    navigate(`/builder/${workflow.id}`);
  };

  const handleDeleteWorkflow = async (workflowId: string, workflowName: string) => {
    setWorkflowToDelete({ id: workflowId, name: workflowName });
    setShowDeleteDialog(true);
  };

  const confirmDeleteWorkflow = async () => {
    if (!workflowToDelete) return;

    try {
      await deleteWorkflow(workflowToDelete.id);
      toast({
        title: "Workflow Deleted",
        description: `"${workflowToDelete.name}" has been deleted successfully!`,
      });
    } catch (error) {
      console.error('Failed to delete workflow:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete workflow. Please try again.",
        variant: "destructive",
      });
    } finally {
      setWorkflowToDelete(null);
    }
  };

  const handleStartEdit = (workflow: Workflow) => {
    setEditingWorkflow(workflow.id);
    setEditName(workflow.name);
  };

  const handleSaveEdit = async (workflowId: string) => {
    if (!editName.trim()) {
      toast({
        title: "Invalid Name",
        description: "Workflow name cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateWorkflow(workflowId, { name: editName.trim() });
      setEditingWorkflow(null);
      setEditName('');
      toast({
        title: "Workflow Renamed",
        description: "Workflow has been renamed successfully!",
      });
    } catch (error) {
      console.error('Failed to rename workflow:', error);
      toast({
        title: "Rename Failed",
        description: "Failed to rename workflow. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingWorkflow(null);
    setEditName('');
  };

  const handleKeyPress = (e: React.KeyboardEvent, workflowId: string) => {
    if (e.key === 'Enter') {
      handleSaveEdit(workflowId);
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const duplicateWorkflow = async (workflow: Workflow) => {
    try {
      const duplicatedName = `${workflow.name} (Copy)`;
      toast({
        title: "Feature Coming Soon",
        description: "Workflow duplication will be available soon.",
      });
    } catch (error) {
      console.error('Failed to duplicate workflow:', error);
    }
  };

  if (loadingWorkflows) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading workflows...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">FLOWS</h1>
            <p className="text-gray-400 text-sm">
              /flōz/ • noun • visual sequences of connected AI operations
            </p>
          </div>
          <Button 
            onClick={handleCreateNew} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
          >
            <Plus className="w-4 h-4 mr-2" />
            CREATE
          </Button>
        </div>

        {/* My Flows Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-300">MY FLOWS</h2>
          
          {workflows.length === 0 ? (
            <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center">
              <div className="w-24 h-24 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium mb-2 text-gray-300">CREATE NEW FLOW</h3>
              <p className="text-gray-500 mb-4 text-sm">Open Composer and start building</p>
              <Button 
                onClick={handleCreateNew}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Create Flow
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {workflows.map((workflow) => (
                <Card key={workflow.id} className="bg-gray-900 border-gray-700 hover:border-gray-600 transition-colors group">
                  <CardHeader className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Play className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-500">{workflow.nodes.length}</span>
                        <span className="text-xs text-gray-600">•</span>
                        <span className="text-xs text-gray-500">{workflow.edges.length} nodes</span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => duplicateWorkflow(workflow)}
                          className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStartEdit(workflow)}
                          className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                          disabled={editingWorkflow === workflow.id}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteWorkflow(workflow.id, workflow.name)}
                          className="h-6 w-6 p-0 text-gray-400 hover:text-red-400"
                          disabled={isLoading}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    {editingWorkflow === workflow.id ? (
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => handleKeyPress(e, workflow.id)}
                        onBlur={() => handleSaveEdit(workflow.id)}
                        autoFocus
                        className="bg-gray-800 border-gray-600 text-white text-sm"
                      />
                    ) : (
                      <CardTitle 
                        className="text-white text-sm font-medium cursor-pointer hover:text-gray-300"
                        onClick={() => handleOpenWorkflow(workflow)}
                      >
                        {workflow.name}
                      </CardTitle>
                    )}
                    
                    {workflow.description && (
                      <CardDescription className="text-xs text-gray-500 line-clamp-2">
                        {workflow.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  
                  <CardContent className="p-4 pt-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-blue-600 text-xs rounded text-white">TEXT</span>
                        <span className="px-2 py-1 bg-purple-600 text-xs rounded text-white">IMAGE</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-400 hover:text-blue-300 text-xs h-6"
                        >
                          <FolderOpen className="w-3 h-3 mr-1" />
                          FORK
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Public Flows Section - Placeholder */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-300">PUBLIC FLOWS</h2>
          <div className="text-center py-8 text-gray-500">
            <p>Public flows will be available soon...</p>
          </div>
        </div>
      </div>

      <CreateWorkflowDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog} 
      />

      <DeleteWorkflowDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        workflowName={workflowToDelete?.name || ''}
        onConfirm={confirmDeleteWorkflow}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Dashboard;
