
import { supabase } from '@/integrations/supabase/client';

export interface ReplicateGenerationRequest {
  prompt: string;
  aspect_ratio?: string;
  num_outputs?: number;
  num_inference_steps?: number;
  seed?: number;
  output_format?: string;
  output_quality?: number;
  disable_safety_checker?: boolean;
  go_fast?: boolean;
  megapixels?: string;
}

export interface ReplicateGenerationResponse {
  output?: string[];
  error?: string;
}

export class ReplicateService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateImage(prompt: string): Promise<ReplicateGenerationResponse> {
    console.log('Starting image generation with prompt:', prompt);

    try {
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: {
          prompt: prompt,
          aspect_ratio: '1:1',
          num_outputs: 1
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        return { error: error.message || 'Failed to call image generation function' };
      }

      console.log('Edge function response:', data);
      
      if (data.output && Array.isArray(data.output)) {
        console.log('Image generation completed:', data.output);
        return { output: data.output };
      } else if (data.error) {
        console.error('Image generation failed:', data.error);
        return { error: data.error };
      } else {
        console.error('Unexpected response format:', data);
        return { error: 'Unexpected response format from API' };
      }
    } catch (error) {
      console.error('Service error:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }
}
