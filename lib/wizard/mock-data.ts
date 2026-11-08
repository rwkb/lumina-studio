import type {
  GeneratedVideo,
  Keyframe,
  LibraryItem,
  Platform,
  ProductDraft,
  VideoScript,
} from './types';
import { KEYFRAME_LABELS } from './types';

const img = (id: string) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&h=650&w=940`;

export const HERO_IMAGE = img('4041231');
export const HERO_POSTER = img('2949157');

// Placeholder clip used for every mock render until Seedance is connected.
export const SAMPLE_VIDEO_URL =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

export const KEYFRAME_POOL: string[] = [
  HERO_POSTER,
  img('13232449'),
  img('27357173'),
  img('8100774'),
  img('9775170'),
  img('3762405'),
  img('38169306'),
  img('6682948'),
];

const HOOKS = [
  (name: string) =>
    `Stop scrolling. ${name} is the step your routine has been missing.`,
  (name: string) =>
    `Your skin deserves more than another bottle. Meet ${name}.`,
  (name: string) =>
    `I didn't expect ${name} to change my mornings this much.`,
];

const BODIES = [
  (name: string, description: string) =>
    `Show the texture in the first close-up, then cut to ${name} melting into skin. ${description} Highlight three benefits: lightweight finish, visible glow in minutes, and a scent that lingers softly.`,
  (name: string, description: string) =>
    `Open on a hand-held application shot. ${description} Intercut with a slow-motion product reveal, then a split-screen before and after with natural light. Keep every benefit to one beat.`,
];

const CTAS = [
  'Tap the link in bio to shop the glow edit before it sells out.',
  'Save this for your next routine, and shop ${name} from the link below.',
  'Treat yourself today. Link in bio, limited release.',
];

export function buildMockScript(
  product: Pick<ProductDraft, 'name' | 'description' | 'style'>,
  variant = 0,
): VideoScript {
  const name = product.name.trim() || 'this product';
  const description =
    product.description.trim() || 'A beautifully crafted formula made for everyday glow.';
  const hookIndex = variant % HOOKS.length;
  const bodyIndex = variant % BODIES.length;
  const ctaIndex = variant % CTAS.length;

  return {
    // TODO: BACKEND - Replace with Seed LLM (BytePlus ModelArk) script generation.
    hook: HOOKS[hookIndex](name),
    body: BODIES[bodyIndex](name, description),
    cta: CTAS[ctaIndex].replace('${name}', name),
    voiceover: `"${HOOKS[hookIndex](name)} ${description} It feels like skin-care you actually look forward to. Tap the link and see the difference for yourself."`,
    seedancePrompt: `Vertical 9:16 beauty video, ${product.style.toLowerCase()} style. Soft natural light on a warm neutral set. Macro close-up of ${name} with glossy texture, slow push-in, subtle rack focus to a model's glowing skin, gentle hand-held movement, shallow depth of field, elegant pacing with a clean final product hero frame. No text overlays, no on-screen logos.`,
    caption: `Your new favorite glow ritual is here. ${name} brings a soft, luminous finish to every routine.`,
    hashtags: '#skincare #beautytok #glowup #newarrival #selfcare #luxurybeauty',
  };
}

export function buildMockKeyframes(
  productImageUrl: string | null,
  offset = 0,
): Keyframe[] {
  // TODO: BACKEND - Replace with Seedream (BytePlus) keyframe image generation.
  return KEYFRAME_LABELS.map((label, index) => {
    const poolUrl = KEYFRAME_POOL[(offset + index) % KEYFRAME_POOL.length];
    const imageUrl = index === 0 && productImageUrl ? productImageUrl : poolUrl;
    return { id: `kf-${label.replace(/\s+/g, '-').toLowerCase()}`, label, imageUrl };
  });
}

export function pickAlternateKeyframeImage(currentUrls: string[]): string {
  const available = KEYFRAME_POOL.filter((url) => !currentUrls.includes(url));
  const source = available.length > 0 ? available : KEYFRAME_POOL;
  return source[Math.floor(Math.random() * source.length)];
}

export function buildMockVideos(
  selected: Keyframe[],
  product: Pick<ProductDraft, 'name' | 'platform' | 'style'>,
  script: VideoScript,
): GeneratedVideo[] {
  // TODO: BACKEND - Replace with Seedance (BytePlus) image-to-video generation jobs.
  const now = new Date().toISOString();
  const poster = (index: number) =>
    selected[index % selected.length]?.imageUrl ?? HERO_IMAGE;

  return [
    {
      id: `video-${Date.now()}-a`,
      title: `${product.name.trim() || 'Untitled'} | Hook Cut`,
      platform: product.platform,
      posterUrl: poster(0),
      videoUrl: SAMPLE_VIDEO_URL,
      caption: script.caption,
      hashtags: script.hashtags,
      createdAt: now,
    },
    {
      id: `video-${Date.now()}-b`,
      title: `${product.name.trim() || 'Untitled'} | Lifestyle Cut`,
      platform: product.platform,
      posterUrl: poster(1),
      videoUrl: SAMPLE_VIDEO_URL,
      caption: script.caption,
      hashtags: script.hashtags,
      createdAt: now,
    },
  ];
}

export const RECENT_PROJECTS: LibraryItem[] = [
  {
    id: 'recent-1',
    title: 'Velvet Lip Tint Launch',
    platform: 'TikTok',
    createdAt: '2026-11-05',
    status: 'Ready',
    thumbnailUrl: img('4889718'),
  },
  {
    id: 'recent-2',
    title: 'Noir Eau de Parfum Reveal',
    platform: 'Instagram Reels',
    createdAt: '2026-11-03',
    status: 'Ready',
    thumbnailUrl: img('7364096'),
  },
  {
    id: 'recent-3',
    title: 'Dew Barrier Night Cream',
    platform: 'YouTube Shorts',
    createdAt: '2026-10-29',
    status: 'Processing',
    thumbnailUrl: img('7038196'),
  },
];

export const LIBRARY_ITEMS: LibraryItem[] = [
  {
    id: 'lib-1',
    title: 'Ruby Satin Lipstick',
    platform: 'TikTok',
    createdAt: '2026-11-02',
    status: 'Ready',
    thumbnailUrl: img('850801'),
  },
  {
    id: 'lib-2',
    title: 'Petal Glow Serum Ritual',
    platform: 'Instagram Reels',
    createdAt: '2026-10-30',
    status: 'Ready',
    thumbnailUrl: img('3762405'),
  },
  {
    id: 'lib-3',
    title: 'Morning Dew Cream Set',
    platform: 'YouTube Shorts',
    createdAt: '2026-10-27',
    status: 'Draft',
    thumbnailUrl: img('7321509'),
  },
  {
    id: 'lib-4',
    title: 'Blush Trio Editorial',
    platform: 'TikTok',
    createdAt: '2026-10-24',
    status: 'Ready',
    thumbnailUrl: img('7256096'),
  },
  {
    id: 'lib-5',
    title: 'Cashmere Makeup Routine',
    platform: 'Instagram Reels',
    createdAt: '2026-10-19',
    status: 'Processing',
    thumbnailUrl: img('10448594'),
  },
  {
    id: 'lib-6',
    title: 'Azure Bottle Minimal Cut',
    platform: 'YouTube Shorts',
    createdAt: '2026-10-15',
    status: 'Ready',
    thumbnailUrl: img('20419734'),
  },
];

export const LIBRARY_FILTERS: { id: string; label: string; platform: Platform | null }[] = [
  { id: 'all', label: 'All', platform: null },
  { id: 'tiktok', label: 'TikTok', platform: 'TikTok' },
  { id: 'reels', label: 'Reels', platform: 'Instagram Reels' },
  { id: 'shorts', label: 'Shorts', platform: 'YouTube Shorts' },
];
