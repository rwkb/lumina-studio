/**
 * API Route: Generate Video
 * 
 * Generates a video using BytePlus Seedance
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateVideos } from '@/lib/wizard/api/video-generation';
import type { Keyframe, ProductDraft, VideoScript } from '@/lib/wizard/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keyframes, product, script } = body as { 
      keyframes: Keyframe[];
      product: ProductDraft;
      script: VideoScript;
    };

    if (!keyframes || keyframes.length === 0) {
      return NextResponse.json(
        { error: 'At least one keyframe is required' },
        { status: 400 }
      );
    }

    if (!product || !script) {
      return NextResponse.json(
        { error: 'Product and script are required' },
        { status: 400 }
      );
    }

    console.log(`[API] Generating video from ${keyframes.length} keyframes`);

    const videos = await generateVideos(keyframes, product, script);

    return NextResponse.json({ 
      success: true,
      videos 
    });
  } catch (error) {
    console.error('[API Error] Video generation failed:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate video',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
