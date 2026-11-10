/**
 * API Route: Generate Script
 * 
 * Generates a video script using BytePlus Seed LLM
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateScript } from '@/lib/wizard/api/script-generation';
import type { ProductDraft } from '@/lib/wizard/types';

export const maxDuration = 60; // Increase timeout for serverless function

export async function POST(request: NextRequest) {
  console.log('[API Route] /api/generate-script called');
  console.log('[API Route] Environment check:', {
    hasApiKey: !!process.env.ARK_API_KEY,
    apiBase: process.env.BYTEPLUS_API_BASE || 'using default',
    nodeEnv: process.env.NODE_ENV
  });
  
  try {
    const body = await request.json();
    const { product, variant = 0 } = body as { product: ProductDraft; variant?: number };

    if (!product) {
      console.error('[API Route] Missing product in request body');
      return NextResponse.json(
        { error: 'Product information is required' },
        { status: 400 }
      );
    }

    if (!product.name || !product.description) {
      console.error('[API Route] Missing required product fields');
      return NextResponse.json(
        { error: 'Product name and description are required' },
        { status: 400 }
      );
    }

    console.log(`[API Route] Generating script for: ${product.name} (variant ${variant})`);

    const script = await generateScript(product, variant);
    
    console.log('[API Route] Script generated successfully');

    return NextResponse.json({ 
      success: true,
      script 
    });
  } catch (error) {
    console.error('[API Route] Script generation failed:', error);
    console.error('[API Route] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      { 
        error: 'Failed to generate script',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
