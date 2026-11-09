'use client';

import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import type {
  GeneratedVideo,
  Keyframe,
  ProductDraft,
  VideoScript,
  WizardStep,
} from './types';

// State version for migration handling
const STATE_VERSION = 1;

export const EMPTY_PRODUCT: ProductDraft = {
  imageUrl: null,
  imageSource: null,
  name: '',
  description: '',
  platform: 'TikTok',
  style: 'Clean Luxury',
  brandNotes: '',
};

export const MIN_SELECTED_KEYFRAMES = 2;

export function isProductComplete(product: ProductDraft): boolean {
  return Boolean(product.imageUrl && product.name.trim() && product.description.trim());
}

interface WizardState {
  version: number;
  currentStep: WizardStep;
  product: ProductDraft;
  script: VideoScript | null;
  keyframes: Keyframe[];
  selectedKeyframeIds: string[];
  generatedVideos: GeneratedVideo[];
  goToStep: (step: WizardStep) => void;
  updateProduct: (patch: Partial<ProductDraft>) => void;
  setScript: (script: VideoScript | null) => void;
  updateScript: (patch: Partial<VideoScript>) => void;
  setKeyframes: (keyframes: Keyframe[]) => void;
  replaceKeyframeImage: (id: string, imageUrl: string) => void;
  toggleKeyframe: (id: string) => void;
  setGeneratedVideos: (videos: GeneratedVideo[]) => void;
  resetWizard: () => void;
}

/**
 * Check if running in browser environment
 */
const isBrowser = typeof window !== 'undefined';

/**
 * Safe storage wrapper with error handling for hydration failures
 * Falls back to in-memory storage if localStorage is unavailable
 */
const safeStorage: StateStorage = {
  getItem: (name: string): string | null => {
    if (!isBrowser) return null;
    try {
      const stored = localStorage.getItem(name);
      if (!stored) return null;
      // Validate JSON structure
      const parsed = JSON.parse(stored);
      // Check version compatibility
      if (parsed?.state?.version !== STATE_VERSION) {
        console.warn('State version mismatch, resetting to defaults');
        return null;
      }
      return stored;
    } catch (error) {
      console.error('Failed to retrieve state from localStorage:', error);
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    if (!isBrowser) return;
    try {
      localStorage.setItem(name, value);
    } catch (error) {
      console.error('Failed to persist state to localStorage:', error);
      // Storage quota exceeded or localStorage unavailable
      // State will remain in memory only
    }
  },
  removeItem: (name: string): void => {
    if (!isBrowser) return;
    try {
      localStorage.removeItem(name);
    } catch (error) {
      console.error('Failed to remove state from localStorage:', error);
    }
  },
};

export const useWizardStore = create<WizardState>()(
  persist(
    (set) => ({
      version: STATE_VERSION,
      currentStep: 1,
      product: EMPTY_PRODUCT,
      script: null,
      keyframes: [],
      selectedKeyframeIds: [],
      generatedVideos: [],
      goToStep: (step) => set({ currentStep: step }),
      updateProduct: (patch) =>
        set((state) => ({ product: { ...state.product, ...patch } })),
      setScript: (script) => set({ script }),
      updateScript: (patch) =>
        set((state) =>
          state.script ? { script: { ...state.script, ...patch } } : state,
        ),
      setKeyframes: (keyframes) =>
        set({ keyframes, selectedKeyframeIds: keyframes.map((frame) => frame.id) }),
      replaceKeyframeImage: (id, imageUrl) =>
        set((state) => ({
          keyframes: state.keyframes.map((frame) =>
            frame.id === id ? { ...frame, imageUrl } : frame,
          ),
        })),
      toggleKeyframe: (id) =>
        set((state) => ({
          selectedKeyframeIds: state.selectedKeyframeIds.includes(id)
            ? state.selectedKeyframeIds.filter((selectedId) => selectedId !== id)
            : [...state.selectedKeyframeIds, id],
        })),
      setGeneratedVideos: (generatedVideos) => set({ generatedVideos }),
      resetWizard: () =>
        set({
          version: STATE_VERSION,
          currentStep: 1,
          product: EMPTY_PRODUCT,
          script: null,
          keyframes: [],
          selectedKeyframeIds: [],
          generatedVideos: [],
        }),
    }),
    {
      name: 'lumina-studio-wizard',
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({
        version: state.version,
        currentStep: state.currentStep,
        product: state.product,
        script: state.script,
        keyframes: state.keyframes,
        selectedKeyframeIds: state.selectedKeyframeIds,
        generatedVideos: state.generatedVideos,
      }),
      onRehydrateStorage: () => (state, error) => {
        // Handle hydration errors gracefully
        if (error) {
          console.error('Failed to rehydrate state from storage:', error);
          // The persist middleware will use the default initial state
        }
        // Validate state version for migration handling
        if (state && state.version !== STATE_VERSION) {
          console.warn('State version mismatch detected, state will be reset');
          // Force reset through the store - this will be handled by the storage wrapper
        }
      },
    },
  ),
);
