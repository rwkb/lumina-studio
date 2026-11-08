export const PLATFORMS = [
  'TikTok',
  'Instagram Reels',
  'YouTube Shorts',
  'Instagram Feed',
  'Xiaohongshu',
  'Custom',
] as const;

export type Platform = (typeof PLATFORMS)[number];

export const STYLE_PRESETS = [
  'Clean Luxury',
  'Soft Girl',
  'UGC Authentic',
  'Cinematic Product Hero',
  'Minimal Editorial',
] as const;

export type StylePreset = (typeof STYLE_PRESETS)[number];

export type WizardStep = 1 | 2 | 3 | 4 | 5;

export type ImageSource = 'upload' | 'url';

export interface ProductDraft {
  imageUrl: string | null;
  imageSource: ImageSource | null;
  name: string;
  description: string;
  platform: Platform;
  style: StylePreset;
  brandNotes: string;
}

export interface VideoScript {
  hook: string;
  body: string;
  cta: string;
  voiceover: string;
  seedancePrompt: string;
  caption: string;
  hashtags: string;
}

export const KEYFRAME_LABELS = [
  'Hero Close-up',
  'Lifestyle',
  'Dynamic Shot',
  'End Frame',
] as const;

export type KeyframeLabel = (typeof KEYFRAME_LABELS)[number];

export interface Keyframe {
  id: string;
  label: KeyframeLabel;
  imageUrl: string;
}

export interface GeneratedVideo {
  id: string;
  title: string;
  platform: Platform;
  posterUrl: string;
  videoUrl: string;
  caption: string;
  hashtags: string;
  createdAt: string;
}

export type LibraryStatus = 'Ready' | 'Processing' | 'Draft';

export interface LibraryItem {
  id: string;
  title: string;
  platform: Platform;
  createdAt: string;
  status: LibraryStatus;
  thumbnailUrl: string;
}
