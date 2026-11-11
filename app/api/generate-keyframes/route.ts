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
    const { product, script, regenerateIndex } = body as { 
      product: ProductDraft; 
      script: VideoScript;
      regenerateIndex?: number;
    };

    if (!product || !script) {
      console.error('[API Route] Missing product or script in request body');
      return NextResponse.json(
        { error: 'Product and script are required' },
        { status: 400 }
      );
    }

    console.log(`[API Route] Generating keyframes for: ${product.name}`, {
      productName: product.name,
      productPlatform: product.platform,
      productStyle: product.style,
      hasScript: !!script,
      scriptLength: script?.body?.length || 0,
      regenerateIndex: regenerateIndex
    });

    const result = await generateKeyframes(product, script);
    
    console.log('[API Route] Keyframes generation complete:', {
      totalKeyframes: result.keyframes.length,
      successCount: result.successCount,
      fallbackCount: result.fallbackCount,
      errorCount: result.errorDetails.length,
      errors: result.errorDetails
    });

    // Determine actual success based on whether real images were generated
    const hasRealImages = result.successCount > 0;
    const allFallbacks = result.fallbackCount === result.keyframes.length;
    
    // Response includes metadata about what actually happened
    const response = {
      success: hasRealImages && !allFallbacks, // false if ALL images are fallbacks
      keyframes: result.keyframes,
      usedFallback: result.fallbackCount > 0,
      fallbackCount: result.fallbackCount,
      successCount: result.successCount,
      errorDetails: result.errorDetails,
      metadata: {
        totalRequested: result.keyframes.length,
        realImages: result.successCount,
        fallbackImages: result.fallbackCount,
        allFallbacks: allFallbacks
      }
    };

    console.log('[API Route] Sending response:', {
      success: response.success,
      usedFallback: response.usedFallback,
      fallbackCount: response.fallbackCount,
      successCount: response.successCount
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('[API Route] Keyframe generation failed:', error);
    console.error('[API Route] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to generate keyframes',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
