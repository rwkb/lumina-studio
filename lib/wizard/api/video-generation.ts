/**
 * Video Generation API
 * 
 * Generates videos from keyframes using BytePlus Seedance
 */

import { generateVideoFromImage } from '@/lib/api/byteplus-client';
import type { Keyframe, ProductDraft, VideoScript, GeneratedVideo } from '../types';
import { FALLBACK_VIDEO_URL } from '../fallback-data';

/**
 * Generate videos from selected keyframes
 */
export async function generateVideos(
  keyframes: Keyframe[],
  product: ProductDraft,
  script: VideoScript
): Promise<GeneratedVideo[]> {
  try {
    if (keyframes.length === 0) {
      throw new Error('No keyframes provided');
    }

    // Use the first selected keyframe as the primary image
    const primaryKeyframe = keyframes[0];

    console.log('Starting video generation...');
    console.log('Primary keyframe:', primaryKeyframe.imageUrl);

    // Generate video from the keyframe image
    const videoUrl = await generateVideoFromImage(
      primaryKeyframe.imageUrl,
      {
        prompt: script.seedancePrompt || `Create an engaging ${product.platform} video for ${product.name}. ${script.body}`,
        duration: 10, // 10 second video
        resolution: '9:16_720p', // Vertical format for social media
      }
    );

    console.log('Video generation completed:', videoUrl);

    // Return the generated video
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
    console.error('Video generation failed, using fallback:', error);
    
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

/**
 * Regenerate a video with different parameters
 */
export async function regenerateVideo(
  keyframe: Keyframe,
  product: ProductDraft,
  script: VideoScript,
  variant: number = 0
): Promise<GeneratedVideo> {
  try {
    const videoUrl = await generateVideoFromImage(
      keyframe.imageUrl,
      {
        prompt: `${script.seedancePrompt} (variant ${variant + 1})`,
        duration: 10,
        size: '9:16_720p',
      }
    );

    return {
      id: `video-${Date.now()}`,
      videoUrl,
      posterUrl: keyframe.imageUrl,
      title: product.name,
      platform: product.platform,
      caption: script.caption,
      hashtags: script.hashtags,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Video regeneration failed:', error);
    
    // Return fallback
    return {
      id: `video-${Date.now()}`,
      videoUrl: FALLBACK_VIDEO_URL,
      posterUrl: keyframe.imageUrl,
      title: product.name,
      platform: product.platform,
      caption: script.caption,
      hashtags: script.hashtags,
      createdAt: new Date().toISOString(),
    };
  }
}

/**
 * Get estimated video generation time
 */
export function getEstimatedGenerationTime(): number {
  // Seedance typically takes 60-90 seconds
  return 75; // seconds
}
