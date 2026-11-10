/**
 * API Route: Generate Keyframes
 * 
 * Generates keyframe images using BytePlus Seedream
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateKeyframes } from '@/lib/wizard/api/keyframe-generation';
import type { ProductDraft, VideoScript } from '@/lib/wizard/types';

export const maxDuration = 60; // Increase timeout for image generation

export async function POST(request: NextRequest) {
  console.log('[API Route] /api/generate-keyframes called');
  console.log('[API Route] Environment check:', {
    hasApiKey: !!process.env.ARK_API_KEY,
    apiBase: process.env.BYTEPLUS_API_BASE || 'using default',
    seedreamModel: process.env.BYTEPLUS_SEEDREAM_MODEL || 'using default'
  });
  
  try {
    const body = await request.json();
    const { product, script } = body as { 
      product: ProductDraft; 
      script: VideoScript;
    };

    if (!product || !script) {
      console.error('[API Route] Missing product or script in request body');
      return NextResponse.json(
        { error: 'Product and script are required' },
        { status: 400 }
      );
    }

    console.log(`[API Route] Generating keyframes for: ${product.name}`);

    const keyframes = await generateKeyframes(product, script);
    
    console.log('[API Route] Keyframes generated successfully, count:', keyframes.length);

    return NextResponse.json({ 
      success: true,
      keyframes 
    });
  } catch (error) {
    console.error('[API Route] Keyframe generation failed:', error);
    console.error('[API Route] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      { 
        error: 'Failed to generate keyframes',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
