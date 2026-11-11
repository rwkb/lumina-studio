/**
 * Keyframe Generation API
 * 
 * Generates keyframe images using BytePlus Seedream
 */

import { generateImageFromPrompt } from '@/lib/api/byteplus-client';
import type { Keyframe, ProductDraft, VideoScript } from '../types';
import { FALLBACK_KEYFRAMES } from '../fallback-data';

const KEYFRAME_LABELS = [
  'Hero Close-up',
  'Lifestyle',
  'Dynamic Shot',
  'End Frame',
] as const;

/**
 * Result of keyframe generation with metadata
 */
export interface KeyframeGenerationResult {
  keyframes: Keyframe[];
  successCount: number;
  fallbackCount: number;
  errorDetails: string[];
}

/**
 * Generate 4 keyframe images for the video
 * Note: Generates sequentially to avoid Netlify function timeout
 */
export async function generateKeyframes(
  product: ProductDraft,
  script: VideoScript
): Promise<KeyframeGenerationResult> {
  const keyframes: Keyframe[] = [];
  const timestamp = Date.now();
  const errorDetails: string[] = [];
  let successCount = 0;
  let fallbackCount = 0;

  console.log('[Keyframe Generation] Starting sequential image generation...', {
    product: product.name,
    platform: product.platform,
    style: product.style,
    startTime: new Date().toISOString()
  });
  
  // Generate images sequentially to avoid timeout
  for (let index = 0; index < KEYFRAME_LABELS.length; index++) {
    const label = KEYFRAME_LABELS[index];
    console.log(`[Keyframe Generation] Generating keyframe ${index + 1}/4: "${label}"`);
    
    try {
      const prompt = buildKeyframePrompt(product, script, label, index);
      console.log(`[Keyframe Generation] Prompt built for "${label}"`, {
        promptLength: prompt.length,
        promptPreview: prompt.substring(0, 80) + '...'
      });
      
      // Use 1K for faster generation
      const imageUrl = await generateImageFromPrompt(prompt, { size: '1K' });
      
      // Validate the returned URL
      if (!imageUrl || imageUrl.length < 10) {
        throw new Error(`Invalid image URL returned: ${imageUrl}`);
      }
      
      keyframes.push({
        id: `kf-${timestamp}-${index}`,
        label,
        imageUrl,
      });
      
      successCount++;
      console.log(`[Keyframe Generation] ✓ "${label}" generated successfully`, {
        urlLength: imageUrl.length,
        urlPreview: imageUrl.substring(0, 60) + '...'
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const fallbackUrl = FALLBACK_KEYFRAMES[index]?.imageUrl || '';
      
      console.warn(`[Keyframe Generation] ✗ "${label}" failed, using fallback`, {
        error: errorMessage,
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        fallbackUrlLength: fallbackUrl.length,
        isFallbackTransparent: fallbackUrl.includes('data:image') && fallbackUrl.length < 200
      });
      
      errorDetails.push(`[${label}] ${errorMessage}`);
      fallbackCount++;
      
      // Use fallback for this specific keyframe
      keyframes.push({
        id: `kf-${timestamp}-${index}`,
        label,
        imageUrl: fallbackUrl,
      });
    }
  }

  // Final summary with metadata
  console.log(`[Keyframe Generation] ========== GENERATION SUMMARY ==========`);
  console.log(`[Keyframe Generation] Total: 4 keyframes`);
  console.log(`[Keyframe Generation] Success: ${successCount} from BytePlus API`);
  console.log(`[Keyframe Generation] Fallback: ${fallbackCount} (invisible 1x1 pixels)`);
  console.log(`[Keyframe Generation] Error details:`, errorDetails);
  console.log(`[Keyframe Generation] =========================================`);
  
  return {
    keyframes,
    successCount,
    fallbackCount,
    errorDetails
  };
}

/**
 * Regenerate a single keyframe
 */
export async function regenerateKeyframe(
  product: ProductDraft,
  script: VideoScript,
  label: string,
  index: number
): Promise<string> {
  try {
    const prompt = buildKeyframePrompt(product, script, label, index);
    const imageUrl = await generateImageFromPrompt(prompt, { size: '2K' });
    return imageUrl;
  } catch (error) {
    console.error('Keyframe regeneration failed:', error);
    // Return a different fallback
    const fallbackIndex = (index + 1) % FALLBACK_KEYFRAMES.length;
    return FALLBACK_KEYFRAMES[fallbackIndex]?.imageUrl || '';
  }
}

/**
 * Build a detailed prompt for each keyframe type
 */
function buildKeyframePrompt(
  product: ProductDraft,
  script: VideoScript,
  label: string,
  index: number
): string {
  const basePrompt = `Professional fashion/beauty product photography,
${product.style} style, soft luxury aesthetic, high-end cosmetics brand feel,
premium quality, editorial standard,`;

  const labelSpecifics: Record<string, string> = {
    'Hero Close-up': `
extreme close-up of product texture,
dramatic lighting highlighting key features,
shallow depth of field, beautiful bokeh,
macro shot showing product quality,
professional studio lighting,
centered composition, clean background`,

    'Lifestyle': `
product in natural lifestyle setting,
aspirational and elegant mood,
soft natural lighting from window,
minimalist home aesthetic,
product as focal point,
relatable yet premium feel,
beautiful depth and dimension`,

    'Dynamic Shot': `
product in motion or dynamic angle,
energetic composition with movement,
creative perspective or unusual angle,
visually striking and memorable,
modern and fresh approach,
creates visual interest and excitement`,

    'End Frame': `
product hero shot with brand identity,
clean gradient or solid background,
perfect for text overlay and CTA,
professional product photography,
balanced composition,
product prominently featured,
commercial quality`,
  };

  const platformStyle = getPlatformStyle(product.platform);

  return `${basePrompt}
${labelSpecifics[label]}.

Product: ${product.name}.
Product Description: ${script.body.substring(0, 150)}.
Visual Style: ${product.style} aesthetic.
${platformStyle}

Output: Vertical 9:16 aspect ratio, high resolution, no text overlay, no logos or watermarks.
Quality: Premium, publication-ready, magazine quality.`;
}

/**
 * Get platform-specific styling
 */
function getPlatformStyle(platform: string): string {
  const styles: Record<string, string> = {
    TikTok: 'Platform: TikTok - trendy, bold colors, dynamic composition.',
    'Instagram Reels': 'Platform: Instagram - polished, aesthetic, on-brand colors.',
    'YouTube Shorts': 'Platform: YouTube - clear, impactful, storytelling composition.',
    'Instagram Feed': 'Platform: Instagram Feed - square composition, high production value.',
    Xiaohongshu: 'Platform: Xiaohongshu - authentic, detailed, educational composition.',
    Custom: 'Platform: General - versatile and adaptable composition.',
  };

  return styles[platform] || styles.Custom;
}
