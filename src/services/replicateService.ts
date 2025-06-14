
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

    console.log('Starting image generation with prompt:', prompt);

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

      console.log('Replicate API response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Replicate API error:', errorData);
        throw new Error(errorData.detail || `API request failed with status ${response.status}`);
      }

      const prediction = await response.json();
      console.log('Prediction created:', prediction);
      
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

    console.log('Starting to poll for prediction:', predictionId);

    while (attempts < maxAttempts) {
      try {
        const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
          headers: {
            'Authorization': `Token ${this.apiKey}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to check prediction status: ${response.status}`);
        }

        const prediction = await response.json();
        console.log(`Poll attempt ${attempts + 1}, status:`, prediction.status);

        if (prediction.status === 'succeeded') {
          console.log('Image generation completed:', prediction.output);
          return { output: prediction.output };
        } else if (prediction.status === 'failed') {
          console.error('Image generation failed:', prediction.error);
          throw new Error(prediction.error || 'Image generation failed');
        } else if (prediction.status === 'canceled') {
          throw new Error('Image generation was canceled');
        }

        // Wait 5 seconds before next poll
        await new Promise(resolve => setTimeout(resolve, 5000));
        attempts++;
      } catch (error) {
        console.error('Polling error:', error);
        return { error: error instanceof Error ? error.message : 'Unknown error occurred' };
      }
    }

    console.error('Image generation timed out after', attempts, 'attempts');
    return { error: 'Image generation timed out' };
  }
}
