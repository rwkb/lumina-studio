/**
 * Script Generation API
 * 
 * Generates video scripts using BytePlus Seed LLM
 */

import { generateText } from '@/lib/api/byteplus-client';
import type { ProductDraft, VideoScript } from '../types';
import { FALLBACK_SCRIPT } from '../fallback-data';

/**
 * Clean and optimize text for specific script sections
 */
function cleanText(text: string, section: 'hook' | 'body' | 'cta' | 'voiceover', duration?: string, language?: string): string {
  // Remove excessive whitespace
  let cleaned = text.trim().replace(/\s+/g, ' ');
  
  // Remove emojis from script text (keep them in captions/hashtags only)
  if (section !== 'voiceover') {
    cleaned = cleaned.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim();
  }
  
  // CRITICAL: Remove Chinese characters if language is English
  if (language === 'English') {
    // Remove Chinese characters (CJK Unified Ideographs)
    // Using simple range that covers most common Chinese characters
    cleaned = cleaned.replace(/[\u4e00-\u9fff]/g, '').trim();
    // Clean up any resulting double spaces
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
  }
  
  // Truncate based on section and duration
  if (section === 'hook') {
    // Hooks should be 1 sentence, max 15 words
    const sentences = cleaned.split(/[.!?]+/).filter(s => s.trim());
    cleaned = sentences[0] || cleaned;
    const words = cleaned.split(' ');
    if (words.length > 15) {
      cleaned = words.slice(0, 15).join(' ');
    }
  } else if (section === 'body') {
    // Body should be 2-3 sentences
    const sentences = cleaned.split(/[.!?]+/).filter(s => s.trim());
    const maxSentences = duration === '15s' ? 1 : duration === '30s' ? 2 : 3;
    cleaned = sentences.slice(0, maxSentences).join('. ').trim();
    if (!cleaned.endsWith('.')) cleaned += '.';
    
    // Limit word count based on duration, but try to keep complete sentences
    const maxWords = duration === '15s' ? 20 : duration === '30s' ? 40 : 60;
    const words = cleaned.split(' ');
    if (words.length > maxWords) {
      // Try to find a good break point (end of sentence)
      const truncated = words.slice(0, maxWords).join(' ');
      // If the truncated text doesn't end with punctuation, find the last complete sentence
      if (!truncated.match(/[.!?]$/)) {
        const lastPunctuation = Math.max(
          truncated.lastIndexOf('.'),
          truncated.lastIndexOf('!'),
          truncated.lastIndexOf('?')
        );
        if (lastPunctuation > 0) {
          cleaned = truncated.substring(0, lastPunctuation + 1);
        } else {
          cleaned = truncated + '.';
        }
      } else {
        cleaned = truncated;
      }
    }
  } else if (section === 'cta') {
    // CTA should be 1 sentence, max 12 words
    const sentences = cleaned.split(/[.!?]+/).filter(s => s.trim());
    cleaned = sentences[0] || cleaned;
    const words = cleaned.split(' ');
    if (words.length > 12) {
      cleaned = words.slice(0, 12).join(' ');
    }
    if (!cleaned.endsWith('.')) cleaned += '.';
  } else if (section === 'voiceover') {
    // Voiceover should match duration timing (roughly 150 words per minute)
    const maxWords = duration === '15s' ? 35 : duration === '30s' ? 75 : 150;
    const words = cleaned.split(' ');
    if (words.length > maxWords) {
      cleaned = words.slice(0, maxWords).join(' ');
      if (!cleaned.endsWith('.')) cleaned += '.';
    }
  }
  
  return cleaned;
}

const SYSTEM_PROMPT = `You are an expert video script writer for fashion and beauty brands.
Generate engaging, platform-optimized video scripts that drive conversions.

IMPORTANT RULES:
1. Keep scripts SHORT and PUNCHY - optimized for short-form video
2. Match the requested duration precisely
3. Write ONLY in the requested language (no mixing languages)
4. Hook should be 1 short sentence (2-3 seconds)
5. Body should be concise (2-3 sentences MAXIMUM)
6. Voiceover should match the duration timing
7. NEVER copy product description verbatim - always rewrite and summarize

Duration Guidelines:
- 15s: Hook (2s) + 1 key benefit (8s) + CTA (5s)
- 30s: Hook (3s) + 2-3 benefits (18s) + CTA (9s)  
- 60s: Hook (3s) + 3-4 benefits (42s) + CTA (15s)

EXAMPLES OF GOOD SCRIPTS:

For 15s video (English):
{
  "hook": "This lip balm just changed the game.",
  "body": "CLIO Crystal Glam Balm delivers crystal shine with PDRN for plump, glossy lips.",
  "cta": "Shop 6 stunning shades at the link in bio.",
  "voiceover": "This lip balm just changed the game. CLIO Crystal Glam Balm delivers crystal shine with PDRN for plump, glossy lips. Shop 6 stunning shades at the link in bio.",
  "seedancePrompt": "Vertical beauty close-up, glossy lip balm texture, soft lighting",
  "caption": "Glow up your lips ✨",
  "hashtags": "#cliomakeup #lipbalm #kbeauty"
}

For 30s video (English):
{
  "hook": "Stop scrolling. Your new lip ritual is here.",
  "body": "CLIO Crystal Glam Balm Bare combines 10,000 PPM PDRN with a lightweight, non-sticky formula. Choose from 6 gorgeous shades for a crystal-shine finish that lasts all day.",
  "cta": "Tap the link to find your perfect shade before they sell out.",
  "voiceover": "Stop scrolling. Your new lip ritual is here. CLIO Crystal Glam Balm Bare combines 10,000 PPM PDRN with a lightweight, non-sticky formula. Choose from 6 gorgeous shades for a crystal-shine finish that lasts all day. Tap the link to find your perfect shade before they sell out.",
  "seedancePrompt": "Vertical beauty video, soft natural lighting, close-up of lip balm application, glossy finish, model with glowing lips",
  "caption": "Crystal shine in one swipe 💎",
  "hashtags": "#cliomakeup #crystalglambalm #kbeauty #lipcare"
}

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
  console.log('[Script Generation] Starting generation for:', product.name);
  console.log('[Script Generation] Variant:', variant);
  
  // Determine language instruction
  const languageInstruction = {
    'English': 'Write the ENTIRE script in English only. DO NOT include any Chinese characters. Translate any Chinese product descriptions to English.',
    '繁體中文': '用繁體中文撰寫完整腳本，不要包含英文。',
    '简体中文': '用简体中文撰写完整脚本，不要包含英文。',
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

CRITICAL: 
- Do NOT copy the product description verbatim
- Extract key benefits and rewrite them in your own words
- Keep it SHORT - 2-3 sentences maximum for the body
- Match the requested language exactly
- If product description contains Chinese but language is English, translate to English

Variant: ${variant} (generate a ${variant === 0 ? 'first' : 'different'} creative approach)

Return only valid JSON with no additional text.`;

  try {
    console.log('[Script Generation] Calling BytePlus API...');
    console.log('[Script Generation] Prompt length:', prompt.length);
    
    const response = await generateText(prompt, SYSTEM_PROMPT);
    console.log('[Script Generation] Response received, length:', response.length);
    console.log('[Script Generation] Response preview:', response.substring(0, 200));
    
    // Parse JSON response
    console.log('[Script Generation] Parsing JSON...');
    const parsed = JSON.parse(response);
    console.log('[Script Generation] JSON parsed successfully');
    
    // Validate required fields
    if (!parsed.hook || !parsed.body || !parsed.cta) {
      console.error('[Script Generation] Missing required fields:', {
        hasHook: !!parsed.hook,
        hasBody: !!parsed.body,
        hasCta: !!parsed.cta
      });
      throw new Error('Missing required script fields');
    }

    // Post-process: Clean up the script
    console.log('[Script Generation] Cleaning up script...');
    const cleanedScript = {
      hook: cleanText(parsed.hook, 'hook', undefined, product.language),
      body: cleanText(parsed.body, 'body', product.duration, product.language),
      cta: cleanText(parsed.cta, 'cta', undefined, product.language),
      voiceover: cleanText(parsed.voiceover, 'voiceover', product.duration, product.language),
      seedancePrompt: parsed.seedancePrompt || '',
      caption: parsed.caption || product.description,
      hashtags: parsed.hashtags || '#beauty #skincare',
    };

    console.log('[Script Generation] Script generation complete');
    return cleanedScript;
  } catch (error) {
    console.error('[Script Generation] API call failed:', error);
    console.error('[Script Generation] Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('[Script Generation] Stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('[Script Generation] Using FALLBACK_SCRIPT instead');
    
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
