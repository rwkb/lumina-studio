/**
 * BytePlus ModelArk API Client
 * 
 * Direct API client for BytePlus AI services:
 * - Seed LLM: Text generation for scripts
 * - Seedream: Image generation for keyframes
 * - Seedance: Video generation from images
 */

// Configuration from environment
// NOTE: Access env vars at runtime (not at module load time) for Netlify functions
function getConfig() {
  const API_BASE = process.env.BYTEPLUS_API_BASE || 'https://ark.ap-southeast.bytepluses.com/api/v3';
  const API_KEY = process.env.ARK_API_KEY;
  const SEED_LLM_MODEL = process.env.BYTEPLUS_SEED_LLM_MODEL || 'dola-seed-2-1-turbo-260628';
  const SEEDREAM_MODEL = process.env.BYTEPLUS_SEEDREAM_MODEL || 'seedream-5-0-260128';
  const SEEDANCE_MODEL = process.env.BYTEPLUS_SEEDANCE_MODEL || 'seedance-1-0-pro-fast-251015';
  
  return { API_BASE, API_KEY, SEED_LLM_MODEL, SEEDREAM_MODEL, SEEDANCE_MODEL };
}

/**
 * Generate text using Seed LLM or DeepSeek
 */
export async function generateText(
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  const { API_BASE, API_KEY, SEED_LLM_MODEL } = getConfig();
  
  // Debug logging
  console.log('[BytePlus Client] Config check:', {
    hasApiKey: !!API_KEY,
    apiKeyPrefix: API_KEY ? API_KEY.substring(0, 10) + '...' : 'undefined',
    apiBase: API_BASE,
    model: SEED_LLM_MODEL
  });
  
  if (!API_KEY) {
    throw new Error('ARK_API_KEY environment variable is not set');
  }
  
  try {
    console.log('[BytePlus Client] Sending request to:', `${API_BASE}/responses`);
    
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
      console.error('[BytePlus Client] API error:', response.status, error);
      throw new Error(`API error ${response.status}: ${error}`);
    }

    const data = await response.json();
    console.log('[BytePlus Client] Response received, output length:', data.output?.length);
    
    // Extract text from response
    // Response format: { output: [reasoning_block, { type: "message", content: [{ type: "output_text", text: "..." }] }] }
    // Find the message in the output array (not the reasoning block)
    const messageOutput = data.output?.find((item: any) => item.type === 'message');
    if (messageOutput?.content?.[0]?.text) {
      console.log('[BytePlus Client] Successfully extracted text from response');
      return messageOutput.content[0].text;
    }

    console.error('[BytePlus Client] Unexpected response format:', JSON.stringify(data, null, 2));
    throw new Error('Unexpected response format');
  } catch (error) {
    console.error('[BytePlus Client] Text generation failed:', error);
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
  const { API_BASE, API_KEY, SEEDREAM_MODEL } = getConfig();
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  
  // Log API call start with request parameters
  console.log(`[BytePlus Seedream] ${timestamp} - Starting image generation`, {
    model: SEEDREAM_MODEL,
    size: options?.size || '2k',
    promptPreview: prompt.substring(0, 100) + (prompt.length > 100 ? '...' : ''),
    hasApiKey: !!API_KEY,
    apiKeyPrefix: API_KEY ? API_KEY.substring(0, 8) + '...' : 'missing'
  });
  
  if (!API_KEY) {
    const errorMsg = 'ARK_API_KEY environment variable is not set';
    console.error(`[BytePlus Seedream] ${timestamp} - Authentication error: ${errorMsg}`);
    throw new Error(errorMsg);
  }
  
  try {
    const requestUrl = `${API_BASE}/images/generations`;
    console.log(`[BytePlus Seedream] ${timestamp} - Sending request to: ${requestUrl}`);
    
    const response = await fetch(requestUrl, {
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

    const responseTime = Date.now() - startTime;
    console.log(`[BytePlus Seedream] ${timestamp} - Response received`, {
      status: response.status,
      statusText: response.statusText,
      responseTimeMs: responseTime,
      responseTimeSec: (responseTime / 1000).toFixed(2)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[BytePlus Seedream] ${timestamp} - API error response`, {
        status: response.status,
        statusText: response.statusText,
        errorBody: errorText,
        responseTimeMs: responseTime
      });
      throw new Error(`API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log(`[BytePlus Seedream] ${timestamp} - Response parsed`, {
      hasData: !!data.data,
      dataLength: data.data?.length,
      firstItemHasUrl: !!(data.data && data.data[0]?.url)
    });
    
    // Extract image URL from response
    // Response format: { data: [{ url: "..." }] }
    if (data.data && data.data[0]?.url) {
      const imageUrl = data.data[0].url;
      console.log(`[BytePlus Seedream] ${timestamp} - Image generated successfully`, {
        urlLength: imageUrl.length,
        urlPreview: imageUrl.substring(0, 50) + '...',
        totalTimeMs: Date.now() - startTime
      });
      return imageUrl;
    }

    console.error(`[BytePlus Seedream] ${timestamp} - No image URL in response`, {
      responseKeys: Object.keys(data),
      dataKeys: data.data ? Object.keys(data.data) : 'no data array'
    });
    throw new Error('No image generated');
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`[BytePlus Seedream] ${timestamp} - Image generation failed`, {
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack?.split('\n').slice(0, 3).join('\n') : 'No stack',
      totalTimeMs: totalTime
    });
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
  const { API_BASE, API_KEY, SEEDANCE_MODEL } = getConfig();
  
  if (!API_KEY) {
    throw new Error('ARK_API_KEY environment variable is not set');
  }
  
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
  const { API_BASE, API_KEY } = getConfig();
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
