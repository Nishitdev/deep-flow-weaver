
export interface ReplicateGenerationRequest {
  prompt: string;
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

    try {
      const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: 'f2ab8a5569070ad7c749038ebd42d33906b50872c6918941134dcb93bc67c4c5',
          input: {
            prompt: prompt,
            go_fast: true,
            megapixels: '1',
            num_outputs: 1,
            aspect_ratio: '1:1',
            output_format: 'webp',
            output_quality: 80,
            num_inference_steps: 4
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to generate image');
      }

      const prediction = await response.json();
      
      // Poll for completion
      return await this.pollForCompletion(prediction.id);
    } catch (error) {
      console.error('Replicate API error:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }

  private async pollForCompletion(predictionId: string): Promise<ReplicateGenerationResponse> {
    const maxAttempts = 60; // 5 minutes with 5-second intervals
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
          headers: {
            'Authorization': `Token ${this.apiKey}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to check prediction status');
        }

        const prediction = await response.json();

        if (prediction.status === 'succeeded') {
          return { output: prediction.output };
        } else if (prediction.status === 'failed') {
          throw new Error(prediction.error || 'Image generation failed');
        }

        // Wait 5 seconds before next poll
        await new Promise(resolve => setTimeout(resolve, 5000));
        attempts++;
      } catch (error) {
        console.error('Polling error:', error);
        return { error: error instanceof Error ? error.message : 'Unknown error occurred' };
      }
    }

    return { error: 'Image generation timed out' };
  }
}
