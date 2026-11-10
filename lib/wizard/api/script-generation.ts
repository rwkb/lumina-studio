/**
 * Script Generation API
 * 
 * Generates video scripts using BytePlus Seed LLM
 */

import { generateText } from '@/lib/api/byteplus-client';
import type { ProductDraft, VideoScript } from '../types';
import { FALLBACK_SCRIPT } from '../fallback-data';

const SYSTEM_PROMPT = `You are an expert video script writer for fashion and beauty brands.
Generate engaging, platform-optimized video scripts that drive conversions.

IMPORTANT RULES:
1. Keep scripts SHORT and PUNCHY - optimized for short-form video
2. Match the requested duration precisely
3. Write in the requested language
4. Hook should be 1 short sentence (2-3 seconds)
5. Body should be concise (2-3 key benefits maximum)
6. Voiceover should match the duration timing
7. Avoid repeating product description verbatim

Duration Guidelines:
- 15s: Hook (2s) + 1 key benefit (8s) + CTA (5s)
- 30s: Hook (3s) + 2-3 benefits (18s) + CTA (9s)  
- 60s: Hook (3s) + 3-4 benefits (42s) + CTA (15s)

Always respond with valid JSON in this exact format:
{
  "hook": "Attention-grabbing opening (1 short sentence)",
  "body": "Concise product benefits (2-3 sentences max)",
  "cta": "Clear call to action (1 sentence)",
  "voiceover": "Complete voiceover matching duration",
  "seedancePrompt": "Technical video generation prompt",
  "caption": "Social media caption with personality",
  "hashtags": "Relevant hashtags"
}`;

/**
 * Generate a video script based on product information
 */
export async function generateScript(
  product: ProductDraft,
  variant: number = 0
): Promise<VideoScript> {
  // Determine language instruction
  const languageInstruction = {
    'English': 'Write the script in English',
    '繁體中文': '用繁體中文撰寫腳本',
    '简体中文': '用简体中文撰写脚本',
  }[product.language];

  const prompt = `Generate a ${product.platform} video script for:

Product Name: ${product.name}
Description: ${product.description}
Style: ${product.style}
Brand Tone: ${product.brandNotes || 'Professional and engaging'}

Platform Requirements:
${getPlatformRequirements(product.platform)}

Style Guidelines:
${getStyleGuidelines(product.style)}

Duration: ${product.duration} - Match this timing precisely
Language: ${languageInstruction}

Variant: ${variant} (generate a ${variant === 0 ? 'first' : 'different'} creative approach)

Return only valid JSON with no additional text.`;

  try {
    const response = await generateText(prompt, SYSTEM_PROMPT);
    
    // Parse JSON response
    const parsed = JSON.parse(response);
    
    // Validate required fields
    if (!parsed.hook || !parsed.body || !parsed.cta) {
      throw new Error('Missing required script fields');
    }

    return {
      hook: parsed.hook,
      body: parsed.body,
      cta: parsed.cta,
      voiceover: parsed.voiceover || '',
      seedancePrompt: parsed.seedancePrompt || '',
      caption: parsed.caption || product.description,
      hashtags: parsed.hashtags || '#beauty #skincare',
    };
  } catch (error) {
    console.error('Script generation failed, using fallback:', error);
    
    // Fallback to mock data on error
    return FALLBACK_SCRIPT;
  }
}

/**
 * Regenerate script with a different creative approach
 */
export async function regenerateScript(
  product: ProductDraft,
  previousVariant: number
): Promise<VideoScript> {
  return generateScript(product, previousVariant + 1);
}

/**
 * Get platform-specific requirements
 */
function getPlatformRequirements(platform: string): string {
  const requirements: Record<string, string> = {
    TikTok: '- Duration: 15-60 seconds\n- Style: Trendy, fast-paced, uses popular sounds\n- Hook: Must grab attention in first 1-2 seconds',
    'Instagram Reels': '- Duration: 15-90 seconds\n- Style: Polished, aesthetic, on-brand\n- Hook: Visual appeal in first 3 seconds',
    'YouTube Shorts': '- Duration: 15-60 seconds\n- Style: Informative yet entertaining\n- Hook: Clear value proposition upfront',
    'Instagram Feed': '- Duration: 30-60 seconds\n- Style: High production value, polished\n- Hook: Immediate visual impact',
    Xiaohongshu: '- Duration: 30-90 seconds\n- Style: Authentic, detailed, educational\n- Hook: Problem-solution format works well',
    Custom: '- Duration: 30-60 seconds\n- Style: Versatile and adaptable\n- Hook: Clear and engaging opening',
  };

  return requirements[platform] || requirements.Custom;
}

/**
 * Get style-specific guidelines
 */
function getStyleGuidelines(style: string): string {
  const guidelines: Record<string, string> = {
    'Clean Luxury': '- Minimal, sophisticated, premium feel\n- Soft lighting, clean backgrounds\n- Focus on product elegance',
    'Soft Girl': '- Dreamy, feminine, romantic aesthetic\n- Soft colors, gentle transitions\n- Emotional connection with product',
    'UGC Authentic': '- Natural, relatable, real-life feel\n- Less polished, more genuine\n- User perspective and testimonials',
    'Cinematic Product Hero': '- Dramatic, epic, high production value\n- Hero shots, slow motion\n- Creates aspiration and desire',
    'Minimal Editorial': '- Clean lines, modern composition\n- Magazine-quality aesthetics\n- Focus on key product features',
  };

  return guidelines[style] || guidelines['Clean Luxury'];
}
