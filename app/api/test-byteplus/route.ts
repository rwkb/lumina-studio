/**
 * Test BytePlus API directly
 */

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const API_BASE = process.env.BYTEPLUS_API_BASE || 'https://ark.ap-southeast.bytepluses.com/api/v3';
  const API_KEY = process.env.ARK_API_KEY;
  const SEED_LLM_MODEL = process.env.BYTEPLUS_SEED_LLM_MODEL || 'dola-seed-2-1-turbo-260628';

  console.log('[Test] Starting direct BytePlus API test');
  console.log('[Test] API Base:', API_BASE);
  console.log('[Test] Has API Key:', !!API_KEY);
  console.log('[Test] Model:', SEED_LLM_MODEL);

  if (!API_KEY) {
    return NextResponse.json({ error: 'API_KEY not configured' }, { status: 500 });
  }

  try {
    const testPrompt = 'Say "hello" in one word.';
    
    console.log('[Test] Sending request to BytePlus...');
    
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
                text: testPrompt,
              },
            ],
          },
        ],
      }),
    });

    console.log('[Test] Response status:', response.status);
    console.log('[Test] Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Test] API error response:', errorText);
      return NextResponse.json({
        error: 'BytePlus API error',
        status: response.status,
        details: errorText
      }, { status: 500 });
    }

    const data = await response.json();
    console.log('[Test] Full response:', JSON.stringify(data, null, 2));

    // Extract text from response
    const messageOutput = data.output?.find((item: any) => item.type === 'message');
    const text = messageOutput?.content?.[0]?.text;

    return NextResponse.json({
      success: true,
      responseStatus: response.status,
      hasOutput: !!data.output,
      outputLength: data.output?.length,
      extractedText: text,
      fullResponse: data
    });

  } catch (error) {
    console.error('[Test] Exception:', error);
    return NextResponse.json({
      error: 'Exception occurred',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Send a POST request to test BytePlus API',
    instructions: 'This endpoint will call BytePlus API directly with a test prompt'
  });
}
