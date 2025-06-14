
import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Image, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { ReplicateService } from '@/services/replicateService';

interface FluxSchnellNodeProps {
  data: {
    config: {
      prompt?: string;
      generatedImageUrl?: string;
    };
    onConfigUpdate: (config: any) => void;
  };
}

export const FluxSchnellNode: React.FC<FluxSchnellNodeProps> = ({ data }) => {
  const [prompt, setPrompt] = useState(data.config?.prompt || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState(data.config?.generatedImageUrl || '');

  // Update local state when data changes (e.g., from workflow execution)
  React.useEffect(() => {
    if (data.config?.generatedImageUrl && data.config.generatedImageUrl !== generatedImageUrl) {
      setGeneratedImageUrl(data.config.generatedImageUrl);
    }
  }, [data.config?.generatedImageUrl]);

  const handlePromptChange = (value: string) => {
    setPrompt(value);
    if (data.onConfigUpdate) {
      data.onConfigUpdate({ ...data.config, prompt: value });
    }
  };

  const handleGenerate = async () => {
    console.log('Generate button clicked');
    console.log('Prompt:', prompt);
    
    if (!prompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please enter a prompt to generate an image.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    toast({
      title: "Generation Started",
      description: "Your image is being generated using Flux Schnell...",
    });
    
    try {
      console.log('Creating Replicate service...');
      // We don't need an API key anymore since the edge function handles it
      const replicateService = new ReplicateService('');
      
      console.log('Calling generateImage...');
      const result = await replicateService.generateImage(prompt);
      
      console.log('Generation result:', result);
      
      if (result.error) {
        console.error('Generation error:', result.error);
        toast({
          title: "Generation Failed",
          description: result.error,
          variant: "destructive",
        });
      } else if (result.output && result.output.length > 0) {
        const imageUrl = result.output[0];
        console.log('Generated image URL:', imageUrl);
        setGeneratedImageUrl(imageUrl);
        
        if (data.onConfigUpdate) {
          data.onConfigUpdate({ 
            ...data.config, 
            prompt, 
            generatedImageUrl: imageUrl 
          });
        }
        
        toast({
          title: "Image Generated",
          description: "Your image has been generated successfully with Flux Schnell!",
        });
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "An error occurred while generating the image.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full space-y-3">
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !border-2"
      />
      
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-purple-500/30 flex items-center justify-center">
          <Image className="w-4 h-4 text-purple-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-foreground">
            Flux Schnell
          </h3>
          <p className="text-xs text-muted-foreground">
            Fast image generation using Flux Schnell
          </p>
        </div>
      </div>
      
      <div className="space-y-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Prompt</label>
          <Textarea
            value={prompt}
            onChange={(e) => handlePromptChange(e.target.value)}
            placeholder="Describe the image you want to generate..."
            className="w-full min-h-[80px] bg-background/50 border-border/50 text-sm resize-none"
            rows={3}
          />
        </div>
        
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full"
          size="sm"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate Image'
          )}
        </Button>
        
        {generatedImageUrl && (
          <div className="mt-3 p-2 bg-background/30 border border-border/30 rounded-lg">
            <img 
              src={generatedImageUrl} 
              alt="Generated" 
              className="w-full h-auto max-h-48 object-contain rounded" 
            />
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !border-2"
      />
    </div>
  );
};
