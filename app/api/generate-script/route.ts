/**
 * API Route: Generate Script
 * 
 * Generates a video script using BytePlus Seed LLM
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateScript } from '@/lib/wizard/api/script-generation';
import type { ProductDraft } from '@/lib/wizard/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { product, variant = 0 } = body as { product: ProductDraft; variant?: number };

    if (!product) {
      return NextResponse.json(
        { error: 'Product information is required' },
        { status: 400 }
      );
    }

    if (!product.name || !product.description) {
      return NextResponse.json(
        { error: 'Product name and description are required' },
        { status: 400 }
      );
    }

    console.log(`[API] Generating script for: ${product.name} (variant ${variant})`);

    const script = await generateScript(product, variant);

    return NextResponse.json({ 
      success: true,
      script 
    });
  } catch (error) {
    console.error('[API Error] Script generation failed:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate script',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
