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

/**
 * Enhanced useWorkflows hook with improved error handling and persistence
 */
export const useWorkflows = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Save workflow with enhanced error handling and validation
   */
  const saveWorkflow = async (name: string, description: string, nodes: Node[], edges: Edge[]) => {
    if (!name.trim()) {
      throw new Error('Workflow name is required');
    }

    setIsLoading(true);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('Authentication error:', authError);
        throw new Error('Please sign in to save workflows. Redirecting to login...');
      }

      console.log('Saving workflow for user:', user.id, { name, nodesCount: nodes.length, edgesCount: edges.length });
      
      const { data, error } = await supabase
        .from('workflows')
        .insert({
          name: name.trim(),
          description: description.trim() || null,
          nodes: nodes as any,
          edges: edges as any,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Workflow saved successfully:', data);
      
      toast({
        title: "Workflow Saved",
        description: `"${name}" has been saved successfully!`,
      });

      return data;
    } catch (error) {
      console.error('Error saving workflow:', error);
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save workflow. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update workflow with improved error handling and optimistic updates
   */
  const updateWorkflow = async (id: string, updates: Partial<Workflow>) => {
    if (!id) {
      throw new Error('Workflow ID is required');
    }

    setIsLoading(true);
    try {
      console.log('Updating workflow:', { id, updates });
      
      // Prepare the update object with proper type casting
      const updateData: any = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      // Cast nodes and edges to Json if they exist
      if (updates.nodes) {
        updateData.nodes = updates.nodes as any;
      }
      if (updates.edges) {
        updateData.edges = updates.edges as any;
      }

      const { data, error } = await supabase
        .from('workflows')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Workflow updated successfully:', data);

      // Update local state optimistically
      setWorkflows(prev => prev.map(w => w.id === id ? { ...w, ...updates, updated_at: data.updated_at } : w));

      return data;
    } catch (error) {
      console.error('Error updating workflow:', error);
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update workflow. Please try again.",
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

      // Transform the data to match our Workflow interface
      const transformedData: Workflow[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        nodes: (item.nodes as unknown) as Node[],
        edges: (item.edges as unknown) as Edge[],
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));

      setWorkflows(transformedData);
      return transformedData;
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

  const createWorkflow = async (name: string, description: string = '') => {
    setIsLoading(true);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('Authentication error:', authError);
        throw new Error('Please sign in to create workflows. Redirecting to login...');
      }

      console.log('Creating workflow for user:', user.id);

      const { data, error } = await supabase
        .from('workflows')
        .insert({
          name,
          description,
          nodes: [],
          edges: [],
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        if (error.code === '42501') {
          throw new Error('Authentication required. Please sign in again.');
        }
        throw error;
      }

      // Add to local state
      const newWorkflow: Workflow = {
        id: data.id,
        name: data.name,
        description: data.description,
        nodes: [],
        edges: [],
        created_at: data.created_at,
        updated_at: data.updated_at,
      };

      setWorkflows(prev => [newWorkflow, ...prev]);

      toast({
        title: "Workflow Created",
        description: `"${name}" has been created successfully!`,
      });

      return newWorkflow;
    } catch (error) {
      console.error('Error creating workflow:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create workflow. Please try again.",
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
    updateWorkflow,
    loadWorkflows,
    deleteWorkflow,
    createWorkflow,
  };
};
