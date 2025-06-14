
-- Create a table for workflows
CREATE TABLE public.workflows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  nodes JSONB NOT NULL DEFAULT '[]'::jsonb,
  edges JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to make workflows public for now
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;

-- Create policy that allows anyone to view workflows (public access)
CREATE POLICY "Anyone can view workflows" 
  ON public.workflows 
  FOR SELECT 
  USING (true);

-- Create policy that allows anyone to create workflows
CREATE POLICY "Anyone can create workflows" 
  ON public.workflows 
  FOR INSERT 
  WITH CHECK (true);

-- Create policy that allows anyone to update workflows
CREATE POLICY "Anyone can update workflows" 
  ON public.workflows 
  FOR UPDATE 
  USING (true);

-- Create policy that allows anyone to delete workflows
CREATE POLICY "Anyone can delete workflows" 
  ON public.workflows 
  FOR DELETE 
  USING (true);
