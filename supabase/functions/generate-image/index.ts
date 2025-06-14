
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, aspect_ratio = '1:1', num_outputs = 1 } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const replicateApiKey = Deno.env.get('REPLICATE_API_KEY');
    if (!replicateApiKey) {
      return new Response(
        JSON.stringify({ error: 'Replicate API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Starting image generation with prompt:', prompt);

    const response = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${replicateApiKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'wait',
      },
      body: JSON.stringify({
        input: {
          prompt: prompt,
          go_fast: true,
          num_outputs: num_outputs,
          aspect_ratio: aspect_ratio,
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
      return new Response(
        JSON.stringify({ error: `API request failed: ${errorText}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await response.json();
    console.log('Replicate API response:', result);
    
    if (result.output && Array.isArray(result.output)) {
      console.log('Image generation completed:', result.output);
      return new Response(
        JSON.stringify({ output: result.output }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (result.error) {
      console.error('Image generation failed:', result.error);
      return new Response(
        JSON.stringify({ error: result.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      console.error('Unexpected response format:', result);
      return new Response(
        JSON.stringify({ error: 'Unexpected response format from API' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
