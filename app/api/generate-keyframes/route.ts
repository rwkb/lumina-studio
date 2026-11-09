/**
 * API Route: Generate Keyframes
 * 
 * Generates keyframe images using BytePlus Seedream
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateKeyframes } from '@/lib/wizard/api/keyframe-generation';
import type { ProductDraft, VideoScript } from '@/lib/wizard/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { product, script } = body as { 
      product: ProductDraft; 
      script: VideoScript;
    };

    if (!product || !script) {
      return NextResponse.json(
        { error: 'Product and script are required' },
        { status: 400 }
      );
    }

    console.log(`[API] Generating keyframes for: ${product.name}`);

    const keyframes = await generateKeyframes(product, script);

    return NextResponse.json({ 
      success: true,
      keyframes 
    });
  } catch (error) {
    console.error('[API Error] Keyframe generation failed:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate keyframes',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
