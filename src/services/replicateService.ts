
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
    if (!this.apiKey) {
      throw new Error('Replicate API key is required');
    }

    console.log('Starting image generation with prompt:', prompt);

    try {
      const response = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'wait',
        },
        body: JSON.stringify({
          input: {
            prompt: prompt,
            go_fast: true,
            num_outputs: 1,
            aspect_ratio: '1:1',
            output_format: 'webp',
            output_quality: 80,
            num_inference_steps: 4
          }
        })
      });

      console.log('Replicate API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Replicate API error response:', errorText);
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('Replicate API response:', result);
      
      // With Prefer: wait header, we should get the result directly
      if (result.output && Array.isArray(result.output)) {
        console.log('Image generation completed:', result.output);
        return { output: result.output };
      } else if (result.error) {
        console.error('Image generation failed:', result.error);
        return { error: result.error };
      } else {
        console.error('Unexpected response format:', result);
        return { error: 'Unexpected response format from API' };
      }
    } catch (error) {
      console.error('Replicate API error:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }
}
