import type { StylePreset, WizardStep } from './types';

export const STEP_LABELS: Record<WizardStep, string> = {
  1: 'Product Input',
  2: 'Script Review',
  3: 'Keyframes',
  4: 'Generate Video',
  5: 'Result & Library',
};

export const WIZARD_STEPS: WizardStep[] = [1, 2, 3, 4, 5];

export const STYLE_OPTIONS: {
  id: StylePreset;
  description: string;
  swatchClass: string;
}[] = [
  {
    id: 'Clean Luxury',
    description: 'Warm neutrals, soft daylight, refined pacing',
    swatchClass: 'from-gold-100 via-gold-200 to-blush-300',
  },
  {
    id: 'Soft Girl',
    description: 'Dreamy blush tones, gentle motion, playful beats',
    swatchClass: 'from-blush-100 via-blush-300 to-rose-300',
  },
  {
    id: 'UGC Authentic',
    description: 'Handheld, candid, feels like a real customer',
    swatchClass: 'from-ink-100 via-gold-100 to-blush-200',
  },
  {
    id: 'Cinematic Product Hero',
    description: 'Slow dolly moves, dramatic light, product first',
    swatchClass: 'from-ink-300 via-rose-400 to-gold-300',
  },
  {
    id: 'Minimal Editorial',
    description: 'Magazine-grade framing with generous negative space',
    swatchClass: 'from-background via-ink-200 to-ink-300',
  },
];
