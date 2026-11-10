/**
 * BytePlus ModelArk API Client
 * 
 * Direct API client for BytePlus AI services:
 * - Seed LLM: Text generation for scripts
 * - Seedream: Image generation for keyframes
 * - Seedance: Video generation from images
 */

// Configuration from environment
const API_BASE = process.env.BYTEPLUS_API_BASE || 'https://ark.ap-southeast.bytepluses.com/api/v3';
const API_KEY = process.env.ARK_API_KEY;

const SEED_LLM_MODEL = process.env.BYTEPLUS_SEED_LLM_MODEL || 'dola-seed-2-1-turbo-260628';
const SEEDREAM_MODEL = process.env.BYTEPLUS_SEEDREAM_MODEL || 'seedream-5-0-260128';
const SEEDANCE_MODEL = process.env.BYTEPLUS_SEEDANCE_MODEL || 'seedance-1-0-pro-fast-251015';

/**
 * Generate text using Seed LLM or DeepSeek
 */
export async function generateText(
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  try {
    const response = await fetch(`${API_BASE}/responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: SEED_LLM_MODEL,
        stream: false,
        input: [
          {
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API error ${response.status}: ${error}`);
    }

    const data = await response.json();
    
    // Extract text from response
    // Response format: { output: [{ content: [{ text: "..." }] }] }
    if (data.output && data.output[0]?.content?.[0]?.text) {
      return data.output[0].content[0].text;
    }

    throw new Error('Unexpected response format');
  } catch (error) {
    console.error('Text generation failed:', error);
    throw error;
  }
}

/**
 * Generate an image using Seedream
 */
export async function generateImageFromPrompt(
  prompt: string,
  options?: {
    size?: '1K' | '2K' | '4K';
    watermark?: boolean;
  }
): Promise<string> {
  try {
    const response = await fetch(`${API_BASE}/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: SEEDREAM_MODEL,
        prompt,
        response_format: 'url',
        size: options?.size || '2k',
        stream: false,
        watermark: options?.watermark ?? false,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API error ${response.status}: ${error}`);
    }

    const data = await response.json();
    
    // Extract image URL from response
    // Response format: { data: [{ url: "..." }] }
    if (data.data && data.data[0]?.url) {
      return data.data[0].url;
    }

    throw new Error('No image generated');
  } catch (error) {
    console.error('Image generation failed:', error);
    throw error;
  }
}

/**
 * Generate a video from an image using Seedance
 * Note: This is an async task that requires polling
 */
export async function generateVideoFromImage(
  imageUrl: string,
  options?: {
    prompt?: string;
    duration?: number;
    resolution?: string;
  }
): Promise<string> {
  try {
    // Create video generation task
    const createResponse = await fetch(`${API_BASE}/contents/generations/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: SEEDANCE_MODEL,
        content: [
          {
            type: 'text',
            text: options?.prompt || 'Create a beautiful video',
          },
          {
            type: 'image_url',
            image_url: {
              url: imageUrl,
            },
          },
        ],
      }),
    });

    if (!createResponse.ok) {
      const error = await createResponse.text();
      throw new Error(`API error ${createResponse.status}: ${error}`);
    }

    const taskData = await createResponse.json();
    const taskId = taskData.id;

    if (!taskId) {
      throw new Error('No task ID returned');
    }

    // Poll for completion
    const videoUrl = await pollVideoTask(taskId);
    return videoUrl;
  } catch (error) {
    console.error('Video generation failed:', error);
    throw error;
  }
}

/**
 * Poll video generation task for completion
 */
async function pollVideoTask(taskId: string): Promise<string> {
  const maxAttempts = 120; // 10 minutes max (120 * 5 seconds)
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      const response = await fetch(`${API_BASE}/contents/generations/tasks/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to check task status: ${response.status}`);
      }

      const data = await response.json();
      
      // Check task status
      if (data.status === 'completed' && data.output?.url) {
        return data.output.url;
      } else if (data.status === 'failed') {
        throw new Error(data.error || 'Video generation failed');
      }

      // Wait 5 seconds before next check
      await new Promise((resolve) => setTimeout(resolve, 5000));
      attempts++;
    } catch (error) {
      console.error('Error polling video task:', error);
      throw error;
    }
  }

  throw new Error('Video generation timeout');
}

/**
 * Test API connectivity
 */
export async function testConnection(): Promise<{ text: boolean; image: boolean; video: boolean }> {
  const results = { text: false, image: false, video: false };

  // Test text generation
  try {
    await generateText('Say "hello" in one word.');
    results.text = true;
  } catch (error) {
    console.warn('Text API test failed:', error);
  }

  // Test image generation
  try {
    await generateImageFromPrompt('A simple red circle on white background', { size: '1K' });
    results.image = true;
  } catch (error) {
    console.warn('Image API test failed:', error);
  }

  // Note: Video test skipped to save costs

  return results;
}
