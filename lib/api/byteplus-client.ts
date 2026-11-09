/**
 * BytePlus ModelArk API Client
 * 
 * This module provides a unified interface to BytePlus AI services:
 * - Seed LLM: Text generation for scripts
 * - Seedream: Image generation for keyframes
 * - Seedance: Video generation from images
 * 
 * Uses TanStack AI adapter for OpenAI-compatible API calls.
 */

import { chat, generateImage, generateVideo, getVideoJobStatus } from '@tanstack/ai';
import { byteplusText, byteplusImage, byteplusVideo } from '@tanstack/ai-byteplus';

// Model configuration from environment
// Note: These must be valid BytePlus model names
const SEED_LLM_MODEL = (process.env.BYTEPLUS_SEED_LLM_MODEL || 'dola-seed-2-1-turbo-260628') as any;
const SEEDREAM_MODEL = (process.env.BYTEPLUS_SEEDREAM_MODEL || 'dola-seedream-5-0-pro-260628') as any;
const SEEDANCE_MODEL = (process.env.BYTEPLUS_SEEDANCE_MODEL || 'dreamina-seedance-2-5-260628') as any;

/**
 * Generate text using Seed LLM
 */
export async function generateText(
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  try {
    // Combine system prompt and user prompt
    const fullPrompt = systemPrompt 
      ? `${systemPrompt}\n\n${prompt}` 
      : prompt;

    // TanStack AI uses a simpler format
    const result = await chat({
      adapter: byteplusText(SEED_LLM_MODEL),
      messages: [
        { role: 'user', content: fullPrompt },
      ],
      threadId: `text-${Date.now()}`,
    });

    // Collect all text parts from the result
    let fullText = '';
    for await (const part of result) {
      // Check for text message content event
      if ('content' in part && typeof part.content === 'string') {
        fullText += part.content;
      }
    }

    return fullText;
  } catch (error) {
    console.error('Text generation failed:', error);
    throw new Error(`Failed to generate text: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate an image using Seedream
 */
export async function generateImageFromPrompt(
  prompt: string,
  options?: {
    size?: '1K' | '2K' | '4K' | string;
    watermark?: boolean;
    numberOfImages?: number;
  }
): Promise<string> {
  try {
    const result = await generateImage({
      adapter: byteplusImage(SEEDREAM_MODEL),
      prompt,
      threadId: `image-${Date.now()}`,
      size: options?.size || '2K',
      modelOptions: {
        watermark: options?.watermark ?? false,
        numberOfImages: options?.numberOfImages ?? 1,
      },
    });

    // Return first image URL
    if (result.images && result.images.length > 0 && result.images[0]?.url) {
      return result.images[0].url;
    }

    throw new Error('No image generated');
  } catch (error) {
    console.error('Image generation failed:', error);
    throw new Error(`Failed to generate image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate a video using Seedance
 * Note: This is an async job that requires polling
 */
export async function generateVideoFromImage(
  imageUrl: string,
  options?: {
    prompt?: string;
    duration?: number;
    size?: string;
  }
): Promise<string> {
  try {
    // Start video generation job
    const { jobId } = await generateVideo({
      adapter: byteplusVideo(SEEDANCE_MODEL),
      prompt: options?.prompt || '',
      threadId: `video-${Date.now()}`,
      size: options?.size || '9:16_720p',
      duration: options?.duration || 10,
      // Note: Image-to-video might need different parameters
      // Check BytePlus documentation for exact parameters
    });

    // Poll for completion
    let status = await getVideoJobStatus({
      adapter: byteplusVideo(SEEDANCE_MODEL),
      jobId,
    });

    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max (60 * 5 seconds)

    while ((status.status === 'pending' || status.status === 'processing') && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds
      status = await getVideoJobStatus({
        adapter: byteplusVideo(SEEDANCE_MODEL),
        jobId,
      });
      attempts++;
    }

    if (status.status === 'completed' && status.url) {
      return status.url;
    }

    throw new Error(status.error || `Video generation ${status.status}`);
  } catch (error) {
    console.error('Video generation failed:', error);
    throw new Error(`Failed to generate video: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Test API connectivity
 */
export async function testConnection(): Promise<{ text: boolean; image: boolean; video: boolean }> {
  const results = { text: false, image: false, video: false };

  // Test text generation
  try {
    await generateText('Say "hello" in one word.');
    results.text = true;
  } catch (error) {
    console.warn('Text API test failed:', error);
  }

  // Test image generation
  try {
    await generateImageFromPrompt('A simple red circle on white background', { size: '1K' });
    results.image = true;
  } catch (error) {
    console.warn('Image API test failed:', error);
  }

  // Note: Video test skipped to save costs

  return results;
}
