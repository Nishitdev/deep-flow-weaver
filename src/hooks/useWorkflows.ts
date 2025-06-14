
import { useState } from 'react';
import { Node, Edge } from '@xyflow/react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: Node[];
  edges: Edge[];
  created_at: string;
  updated_at: string;
}

export const useWorkflows = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const saveWorkflow = async (name: string, description: string, nodes: Node[], edges: Edge[]) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('workflows')
        .insert({
          name,
          description,
          nodes,
          edges,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Workflow Saved",
        description: `"${name}" has been saved successfully!`,
      });

      return data;
    } catch (error) {
      console.error('Error saving workflow:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save workflow. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loadWorkflows = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      setWorkflows(data || []);
      return data;
    } catch (error) {
      console.error('Error loading workflows:', error);
      toast({
        title: "Load Failed",
        description: "Failed to load workflows. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteWorkflow = async (id: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('workflows')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setWorkflows(prev => prev.filter(w => w.id !== id));
      
      toast({
        title: "Workflow Deleted",
        description: "Workflow has been deleted successfully!",
      });
    } catch (error) {
      console.error('Error deleting workflow:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete workflow. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    workflows,
    isLoading,
    saveWorkflow,
    loadWorkflows,
    deleteWorkflow,
  };
};
