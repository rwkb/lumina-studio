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
 * Generate 4 keyframe images for the video
 */
export async function generateKeyframes(
  product: ProductDraft,
  script: VideoScript
): Promise<Keyframe[]> {
  try {
    // Generate all 4 keyframes in parallel for speed
    const prompts = KEYFRAME_LABELS.map((label, index) =>
      buildKeyframePrompt(product, script, label, index)
    );

    // Use Promise.allSettled to handle partial failures
    const results = await Promise.allSettled(
      prompts.map(prompt => generateImageFromPrompt(prompt, { size: '2K' }))
    );

    // Build keyframes from results
    const keyframes: Keyframe[] = [];
    const timestamp = Date.now();

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        keyframes.push({
          id: `kf-${timestamp}-${index}`,
          label: KEYFRAME_LABELS[index],
          imageUrl: result.value,
        });
      } else {
        console.warn(`Keyframe ${index} generation failed:`, result.reason);
        // Use fallback for this specific keyframe
        keyframes.push({
          id: `kf-${timestamp}-${index}`,
          label: KEYFRAME_LABELS[index],
          imageUrl: FALLBACK_KEYFRAMES[index]?.imageUrl || '',
        });
      }
    });

    return keyframes;
  } catch (error) {
    console.error('Keyframe generation failed, using fallback:', error);
    return FALLBACK_KEYFRAMES;
  }
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
