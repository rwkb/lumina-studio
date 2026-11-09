# Lumina Studio - BytePlus API Integration Guide

This guide documents how to integrate BytePlus AI services (Seed LLM, Seedream, Seedance) into Lumina Studio to replace mock data with real AI generation.

---

## Table of Contents

1. [Overview](#overview)
2. [Environment Setup](#environment-setup)
3. [API Integration Points](#api-integration-points)
4. [Step-by-Step Integration](#step-by-step-integration)
5. [Error Handling](#error-handling)
6. [Testing](#testing)
7. [Cost Management](#cost-management)

---

## Overview

### Current Architecture

Lumina Studio uses mock data throughout the wizard flow:

| Step | Current Implementation | Real API |
|------|----------------------|----------|
| Step 1 | User input only | No API needed |
| Step 2 | `buildMockScript()` | **Seed LLM** (text generation) |
| Step 3 | `buildMockKeyframes()` | **Seedream** (image generation) |
| Step 4 | `buildMockVideos()` | **Seedance** (video generation) |
| Step 5 | Display results | No API needed |

### BytePlus Services Required

1. **Seed LLM** - Large language model for script generation
2. **Seedream** - Text-to-image generation for keyframes
3. **Seedance** - Image-to-video generation

All services are accessed through **BytePlus ModelArk** platform.

---

## Environment Setup

### 1. Get BytePlus Credentials

1. Sign up at [BytePlus Console](https://console.byteplus.com/)
2. Navigate to **ModelArk** service
3. Create API credentials (Access Key ID + Secret Access Key)
4. Enable the following models:
   - Seed LLM (text generation)
   - Seedream (image generation)
   - Seedance (video generation)

### 2. Create Environment Variables

Create `.env.local` in your project root:

```bash
# BytePlus API Configuration
BYTEPLUS_ACCESS_KEY=your_access_key_here
BYTEPLUS_SECRET_KEY=your_secret_key_here
BYTEPLUS_REGION=ap-singapore-1  # or your preferred region

# Model Endpoints (get these from ModelArk console)
BYTEPLUS_SEED_LLM_ENDPOINT=https://ark.cn-beijing.volces.com/api/v3/chat/completions
BYTEPLUS_SEEDREAM_ENDPOINT=https://ark.cn-beijing.volces.com/api/v3/images/generations
BYTEPLUS_SEEDANCE_ENDPOINT=https://ark.cn-beijing.volces.com/api/v3/videos/generations

# Optional: Model selection
BYTEPLUS_SEED_LLM_MODEL=seed-llm-v1
BYTEPLUS_SEEDREAM_MODEL=seedream-v1
BYTEPLUS_SEEDANCE_MODEL=seedance-v1
```

### 3. Install Required Dependencies

```bash
npm install @volcengine/openapi  # Official BytePlus SDK
```

---

## API Integration Points

### Integration Point 1: Script Generation (Step 2)

**File:** `lib/wizard/api/script-generation.ts` (to be created)

**Current Location:** `components/wizard/steps/step-script-review.tsx:107`

**Current Code:**
```typescript
const generatedScript = buildMockScript(product, regenerateVariant);
setScript(generatedScript);
```

**Replaced With:**
```typescript
const generatedScript = await generateScript(product, regenerateVariant);
setScript(generatedScript);
```

**API Call Details:**
- **Service:** Seed LLM
- **Input:** Product name, description, platform, style, brand notes
- **Output:** Structured script (hook, body, CTA, voiceover, hashtags)
- **Timeout:** 10-15 seconds
- **Retry Logic:** 3 attempts with exponential backoff

---

### Integration Point 2: Keyframe Generation (Step 3)

**File:** `lib/wizard/api/keyframe-generation.ts` (to be created)

**Current Location:** `components/wizard/steps/step-keyframes.tsx:97`

**Current Code:**
```typescript
const generatedKeyframes = buildMockKeyframes(product.imageUrl);
setKeyframes(generatedKeyframes);
```

**Replaced With:**
```typescript
const generatedKeyframes = await generateKeyframes(product, script);
setKeyframes(generatedKeyframes);
```

**API Call Details:**
- **Service:** Seedream
- **Input:** Product image + script context
- **Output:** 4 image URLs (Hero Close-up, Lifestyle, Dynamic Shot, End Frame)
- **Timeout:** 20-30 seconds per image
- **Parallel Processing:** Generate all 4 images simultaneously

---

### Integration Point 3: Video Generation (Step 4)

**File:** `lib/wizard/api/video-generation.ts` (to be created)

**Current Location:** `components/wizard/steps/step-generate.tsx:150`

**Current Code:**
```typescript
const videos = buildMockVideos(selectedKeyframes, product, script!);
setGeneratedVideos(videos);
```

**Replaced With:**
```typescript
const videos = await generateVideos(selectedKeyframes, product, script);
setGeneratedVideos(videos);
```

**API Call Details:**
- **Service:** Seedance
- **Input:** Selected keyframe images + script
- **Output:** Video URL(s)
- **Timeout:** 60-90 seconds
- **Async Processing:** May require polling for completion

---

## Step-by-Step Integration

### Step 1: Create API Client

**File:** `lib/api/byteplus-client.ts`

```typescript
import OpenAI from 'openai';

/**
 * BytePlus ModelArk client configuration
 * Uses OpenAI-compatible API format
 */
export class BytePlusClient {
  private client: OpenAI;
  
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.BYTEPLUS_SECRET_KEY,
      baseURL: process.env.BYTEPLUS_SEED_LLM_ENDPOINT,
      defaultHeaders: {
        'X-Access-Key': process.env.BYTEPLUS_ACCESS_KEY,
      },
    });
  }

  async generateText(prompt: string): Promise<string> {
    // Implementation here
  }

  async generateImage(prompt: string): Promise<string> {
    // Implementation here
  }

  async generateVideo(imageUrl: string): Promise<string> {
    // Implementation here
  }
}
```

### Step 2: Implement Script Generation

**File:** `lib/wizard/api/script-generation.ts`

```typescript
import { BytePlusClient } from '@/lib/api/byteplus-client';
import type { ProductDraft, VideoScript } from '../types';

const SYSTEM_PROMPT = `You are an expert video script writer for fashion and beauty brands. 
Generate engaging, platform-optimized video scripts in a structured format.`;

export async function generateScript(
  product: ProductDraft,
  variant: number = 0
): Promise<VideoScript> {
  const client = new BytePlusClient();

  const prompt = `Generate a ${product.platform} video script for:
  
Product: ${product.name}
Description: ${product.description}
Style: ${product.style}
Brand Notes: ${product.brandNotes || 'None'}

Return JSON with these exact fields:
- hook (string): 0-3 second attention grabber
- body (string): Main product benefits
- cta (string): Call to action
- voiceover (string): Full voiceover script
- seedancePrompt (string): Technical video generation prompt
- caption (string): Social media caption
- hashtags (string): Relevant hashtags

Variant: ${variant} (generate a different creative approach)`;

  try {
    const response = await client.generateText(prompt);
    const parsed = JSON.parse(response);
    
    return {
      hook: parsed.hook,
      body: parsed.body,
      cta: parsed.cta,
      voiceover: parsed.voiceover,
      seedancePrompt: parsed.seedancePrompt,
      caption: parsed.caption,
      hashtags: parsed.hashtags,
    };
  } catch (error) {
    console.error('Script generation failed:', error);
    // Fallback to mock data
    return FALLBACK_SCRIPT;
  }
}
```

### Step 3: Implement Keyframe Generation

**File:** `lib/wizard/api/keyframe-generation.ts`

```typescript
import { BytePlusClient } from '@/lib/api/byteplus-client';
import type { Keyframe, ProductDraft, VideoScript } from '../types';

const KEYFRAME_LABELS = [
  'Hero Close-up',
  'Lifestyle',
  'Dynamic Shot',
  'End Frame',
] as const;

export async function generateKeyframes(
  product: ProductDraft,
  script: VideoScript
): Promise<Keyframe[]> {
  const client = new BytePlusClient();
  
  // Generate all 4 keyframes in parallel
  const prompts = KEYFRAME_LABELS.map((label, index) => {
    return buildKeyframePrompt(product, script, label, index);
  });

  try {
    const imageUrls = await Promise.all(
      prompts.map(prompt => client.generateImage(prompt))
    );

    return imageUrls.map((url, index) => ({
      id: `kf-${Date.now()}-${index}`,
      label: KEYFRAME_LABELS[index],
      imageUrl: url,
    }));
  } catch (error) {
    console.error('Keyframe generation failed:', error);
    // Fallback to mock data
    return FALLBACK_KEYFRAMES;
  }
}

function buildKeyframePrompt(
  product: ProductDraft,
  script: VideoScript,
  label: string,
  index: number
): string {
  const basePrompt = `Professional fashion/beauty product photography, 
${product.style} style, soft luxury aesthetic, high-end cosmetics brand feel.`;

  const labelSpecifics: Record<string, string> = {
    'Hero Close-up': 'Extreme close-up of product texture, dramatic lighting, shallow depth of field',
    'Lifestyle': 'Product in natural setting, lifestyle context, aspirational mood',
    'Dynamic Shot': 'Product in motion or action shot, dynamic angle, energetic composition',
    'End Frame': 'Product with brand identity, clean background, perfect for CTA overlay',
  };

  return `${basePrompt} ${labelSpecifics[label]}.
Product: ${product.name}.
Context: ${script.body.substring(0, 100)}.
Style: Premium, elegant, editorial quality.
Platform: Vertical 9:16 aspect ratio for ${product.platform}.`;
}
```

### Step 4: Implement Video Generation

**File:** `lib/wizard/api/video-generation.ts`

```typescript
import { BytePlusClient } from '@/lib/api/byteplus-client';
import type { Keyframe, ProductDraft, VideoScript, GeneratedVideo } from '../types';

export async function generateVideos(
  keyframes: Keyframe[],
  product: ProductDraft,
  script: VideoScript
): Promise<GeneratedVideo[]> {
  const client = new BytePlusClient();
  
  // Use first selected keyframe as primary
  const primaryKeyframe = keyframes[0];

  try {
    const videoUrl = await client.generateVideo(
      primaryKeyframe.imageUrl,
      {
        prompt: script.seedancePrompt,
        duration: 15, // seconds
        aspectRatio: '9:16',
        style: product.style,
      }
    );

    return [
      {
        id: `video-${Date.now()}`,
        videoUrl,
        posterUrl: primaryKeyframe.imageUrl,
        title: product.name,
        platform: product.platform,
        caption: script.caption,
        hashtags: script.hashtags,
        createdAt: new Date().toISOString(),
      },
    ];
  } catch (error) {
    console.error('Video generation failed:', error);
    // Fallback to placeholder video
    return [
      {
        id: `video-${Date.now()}`,
        videoUrl: FALLBACK_VIDEO_URL,
        posterUrl: keyframes[0]?.imageUrl || '',
        title: product.name,
        platform: product.platform,
        caption: script.caption,
        hashtags: script.hashtags,
        createdAt: new Date().toISOString(),
      },
    ];
  }
}
```

### Step 5: Create API Routes (Server-Side)

**File:** `app/api/generate-script/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { generateScript } from '@/lib/wizard/api/script-generation';

export async function POST(request: NextRequest) {
  try {
    const { product, variant } = await request.json();
    
    const script = await generateScript(product, variant);
    
    return NextResponse.json({ script });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate script' },
      { status: 500 }
    );
  }
}
```

**File:** `app/api/generate-keyframes/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { generateKeyframes } from '@/lib/wizard/api/keyframe-generation';

export async function POST(request: NextRequest) {
  try {
    const { product, script } = await request.json();
    
    const keyframes = await generateKeyframes(product, script);
    
    return NextResponse.json({ keyframes });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate keyframes' },
      { status: 500 }
    );
  }
}
```

**File:** `app/api/generate-video/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { generateVideos } from '@/lib/wizard/api/video-generation';

export async function POST(request: NextRequest) {
  try {
    const { keyframes, product, script } = await request.json();
    
    const videos = await generateVideos(keyframes, product, script);
    
    return NextResponse.json({ videos });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate video' },
      { status: 500 }
    );
  }
}
```

### Step 6: Update Wizard Steps to Call APIs

**Update:** `components/wizard/steps/step-script-review.tsx`

Replace the mock generation with API calls:

```typescript
// Before (line 107)
const generatedScript = buildMockScript(product, regenerateVariant);

// After
const response = await fetch('/api/generate-script', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ product, variant: regenerateVariant }),
});
const { script: generatedScript } = await response.json();
```

**Update:** `components/wizard/steps/step-keyframes.tsx`

```typescript
// Before (line 97)
const generatedKeyframes = buildMockKeyframes(product.imageUrl);

// After
const response = await fetch('/api/generate-keyframes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ product, script }),
});
const { keyframes: generatedKeyframes } = await response.json();
```

**Update:** `components/wizard/steps/step-generate.tsx`

```typescript
// Before (line 150)
const videos = buildMockVideos(selectedKeyframes, product, script!);

// After
const response = await fetch('/api/generate-video', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    keyframes: selectedKeyframes, 
    product, 
    script 
  }),
});
const { videos } = await response.json();
```

---

## Error Handling

### Graceful Degradation Strategy

Always fall back to mock data if APIs fail:

```typescript
export async function generateScript(
  product: ProductDraft,
  variant: number = 0
): Promise<VideoScript> {
  try {
    // Try real API
    const response = await client.generateText(prompt);
    return parseScriptResponse(response);
  } catch (error) {
    console.error('API failed, using fallback:', error);
    
    // Option 1: Use hardcoded fallback
    return FALLBACK_SCRIPT;
    
    // Option 2: Use mock generator
    return buildMockScript(product, variant);
  }
}
```

### Retry Logic

```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      console.warn(`Attempt ${attempt}/${maxAttempts} failed:`, error);
      
      if (attempt < maxAttempts) {
        await sleep(delayMs * Math.pow(2, attempt - 1)); // Exponential backoff
      }
    }
  }
  
  throw lastError;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

### Loading States

Keep users informed during API calls:

```typescript
// In your component
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const handleGenerate = async () => {
  setIsLoading(true);
  setError(null);
  
  try {
    const result = await generateScript(product);
    setScript(result);
  } catch (error) {
    setError('Failed to generate script. Please try again.');
  } finally {
    setIsLoading(false);
  }
};
```

---

## Testing

### 1. Test Without API Keys

The application should continue to work with mock data even without API keys:

```bash
# Test locally without .env.local
npm run dev
```

### 2. Test With API Keys

```bash
# Add .env.local with your credentials
npm run dev

# Test each integration point:
# - Step 2: Generate script (should see real AI-generated text)
# - Step 3: Generate keyframes (should see AI-generated images)
# - Step 4: Generate video (should see AI-generated video)
```

### 3. Test Error Handling

```typescript
// Temporarily break API calls to test fallbacks
const response = await fetch('/api/generate-script', {
  // ... intentionally malformed request
});

// Verify: Should fall back to mock data gracefully
```

### 4. Monitor API Usage

Add logging to track API calls:

```typescript
console.log(`[API Call] ${new Date().toISOString()} - generateScript`, {
  product: product.name,
  platform: product.platform,
  style: product.style,
});
```

---

## Cost Management

### Estimated API Costs

Based on typical BytePlus ModelArk pricing:

| Service | Input | Output | Cost per Generation |
|---------|-------|--------|---------------------|
| Seed LLM | ~500 tokens | ~300 tokens | ~$0.001-0.005 |
| Seedream | 1 prompt | 4 images | ~$0.04-0.08 (4 images) |
| Seedance | 1 image | 1 video (15s) | ~$0.10-0.30 |

**Total per video:** ~$0.14-0.39 USD

### Cost Optimization Tips

1. **Cache Results**: Store generated scripts/images in database
2. **Use Fallbacks**: Show cached or mock data if API fails
3. **Rate Limiting**: Limit regenerations per user session
4. **Model Selection**: Use lighter/cheaper models for drafts

### Add Rate Limiting

```typescript
// Simple in-memory rate limiter
const rateLimiter = new Map<string, number[]>();

function checkRateLimit(
  userId: string,
  maxCalls: number = 10,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const calls = rateLimiter.get(userId) || [];
  
  // Remove old calls
  const recentCalls = calls.filter(time => now - time < windowMs);
  
  if (recentCalls.length >= maxCalls) {
    return false; // Rate limit exceeded
  }
  
  recentCalls.push(now);
  rateLimiter.set(userId, recentCalls);
  return true;
}
```

---

## Production Checklist

Before going live with real APIs:

- [ ] Add `.env.local` with production API keys
- [ ] Test all three integration points
- [ ] Verify fallback mechanisms work
- [ ] Add error logging (Sentry, LogRocket, etc.)
- [ ] Set up rate limiting
- [ ] Configure cost alerts in BytePlus console
- [ ] Add loading states and progress indicators
- [ ] Test on mobile devices
- [ ] Set up monitoring dashboard
- [ ] Document API key rotation process

---

## Additional Resources

- [BytePlus ModelArk Documentation](https://docs.byteplus.com/modelark)
- [BytePlus API Reference](https://docs.byteplus.com/api-reference)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Error Handling Best Practices](https://nextjs.org/docs/app/building-your-application/routing/error-handling)

---

## Support

If you encounter issues:

1. Check BytePlus console for API status
2. Verify API credentials are correct
3. Check API quotas and limits
4. Review application logs
5. Contact BytePlus support for API issues

---

**Last Updated:** November 8, 2026
**Version:** 1.0
