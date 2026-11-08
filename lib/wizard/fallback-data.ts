import { VideoScript, Keyframe } from './types';

// Hardcoded fallback script (no external dependencies)
export const FALLBACK_SCRIPT: VideoScript = {
  hook: "Stop scrolling. This is the moment your routine has been waiting for.",
  body: "Show the texture in a beautiful close-up. Highlight the lightweight finish and visible glow. Your skin deserves this moment.",
  cta: "Tap the link in bio to shop before it sells out.",
  voiceover: "Your skin deserves this moment. Treat yourself today.",
  seedancePrompt: "Vertical 9:16 beauty video, soft natural light, elegant pacing, premium cosmetics aesthetic.",
  caption: "Your new favorite glow ritual is here ✨",
  hashtags: "#skincare #beauty #glowup #beautytok",
};

// Local fallback keyframes (will be stored in public/)
export const FALLBACK_KEYFRAMES: Keyframe[] = [
  { id: 'kf-hero-fallback', label: 'Hero Close-up', imageUrl: '/fallbacks/keyframes/hero.jpg' },
  { id: 'kf-lifestyle-fallback', label: 'Lifestyle', imageUrl: '/fallbacks/keyframes/lifestyle.jpg' },
  { id: 'kf-dynamic-fallback', label: 'Dynamic Shot', imageUrl: '/fallbacks/keyframes/dynamic.jpg' },
  { id: 'kf-end-fallback', label: 'End Frame', imageUrl: '/fallbacks/keyframes/end.jpg' },
];

export const FALLBACK_VIDEO_URL = '/fallbacks/sample-video.mp4';
export const FALLBACK_LIBRARY_THUMBNAIL = '/fallbacks/library-placeholder.jpg';
