'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, RefreshCw } from 'lucide-react';
import { useWizardStore, MIN_SELECTED_KEYFRAMES } from '@/lib/wizard/store';
import type { Keyframe, WizardStep } from '@/lib/wizard/types';
import type { APIStatus } from '@/components/wizard/api-status-indicator';
import { buildMockKeyframes, pickAlternateKeyframeImage } from '@/lib/wizard/mock-data';
import { FALLBACK_KEYFRAMES } from '@/lib/wizard/fallback-data';
import { StepHeading } from '../step-heading';
import { WizardActions } from '../wizard-actions';
import { Button } from '@/components/ui/button';

interface KeyframeCardProps {
  keyframe: Keyframe;
  isSelected: boolean;
  onToggle: () => void;
  onRegenerate: () => void;
  isRegenerating: boolean;
}

function KeyframeCard({
  keyframe,
  isSelected,
  onToggle,
  onRegenerate,
  isRegenerating,
}: KeyframeCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="group relative overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden">
        {/* Image with fallback for failed loads */}
        <img
          src={keyframe.imageUrl}
          alt={keyframe.label}
          onError={(e) => {
            // Fallback system: Use predefined fallback keyframe image on load failure
            const fallback = FALLBACK_KEYFRAMES.find(f => f.label === keyframe.label);
            if (fallback && e.currentTarget.src !== fallback.imageUrl) {
              e.currentTarget.src = fallback.imageUrl;
            }
          }}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />

        {/* Selection Overlay */}
        <button
          type="button"
          onClick={onToggle}
          className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${
            isSelected
              ? 'bg-blush-500/20'
              : 'bg-black/0 hover:bg-black/5'
          }`}
        >
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 ${
              isSelected
                ? 'bg-blush-500 text-white shadow-lg'
                : 'border-2 border-white/80 bg-white/90 text-transparent shadow-md'
            }`}
          >
            <Check className={`h-5 w-5 ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
          </div>
        </button>
      </div>

      {/* Label & Actions */}
      <div className="flex items-center justify-between gap-3 p-4">
        <h3 className="text-sm font-semibold text-ink-800">{keyframe.label}</h3>

        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onRegenerate();
          }}
          disabled={isRegenerating}
          className="h-8 px-3 text-xs text-ink-500 hover:bg-cream-100 hover:text-ink-700"
        >
          <RefreshCw
            className={`mr-1.5 h-3.5 w-3.5 ${isRegenerating ? 'animate-spin' : ''}`}
          />
          {isRegenerating ? 'Regen...' : 'Regenerate'}
        </Button>
      </div>
    </motion.div>
  );
}

interface LoadingSkeletonProps {
  count?: number;
}

function LoadingSkeleton({ count = 4 }: LoadingSkeletonProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.35 }}
          className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm"
        >
          <div className="aspect-[4/5] animate-pulse bg-cream-200" />
          <div className="flex items-center justify-between p-4">
            <div className="h-4 w-24 animate-pulse rounded bg-cream-200" />
            <div className="h-8 w-20 animate-pulse rounded bg-cream-200" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

interface StepKeyframesProps {
  onNavigate: (step: WizardStep) => void;
  onStatusChange?: (status: APIStatus) => void;
}

export function StepKeyframes({ onNavigate, onStatusChange }: StepKeyframesProps) {
  const product = useWizardStore((state) => state.product);
  const keyframes = useWizardStore((state) => state.keyframes);
  const selectedKeyframeIds = useWizardStore((state) => state.selectedKeyframeIds);
  const setKeyframes = useWizardStore((state) => state.setKeyframes);
  const replaceKeyframeImage = useWizardStore((state) => state.replaceKeyframeImage);
  const toggleKeyframe = useWizardStore((state) => state.toggleKeyframe);

  const [isLoading, setIsLoading] = useState(keyframes.length === 0);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);

  useEffect(() => {
    if (keyframes.length === 0 && product.name && product.description) {
      // Call API to generate keyframes
      const generate = async () => {
        try {
          setIsLoading(true);
          console.log('[Keyframes] Starting generation for:', product.name);
          
          // We need the script from the store for context
          const script = useWizardStore.getState().script;
          
          console.log('[Keyframes] Calling /api/generate-keyframes...');
          
          // Add timeout to fetch (60 seconds)
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 60000);
          
          const response = await fetch('/api/generate-keyframes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product, script }),
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          console.log('[Keyframes] Response status:', response.status);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('[Keyframes] API error:', response.status, errorText);
            throw new Error('Failed to generate keyframes');
          }

          const data = await response.json();
          console.log('[Keyframes] Received data:', data);
          setKeyframes(data.keyframes);
          
          // Notify parent of successful API status
          if (onStatusChange) {
            onStatusChange('connected');
          }
        } catch (error) {
          console.error('[Keyframes] Generation error:', error);
          
          // Notify parent of fallback status
          if (onStatusChange) {
            onStatusChange('fallback');
          }
          
          // Fallback to mock data on error
          const fallbackKeyframes = buildMockKeyframes(product.imageUrl);
          setKeyframes(fallbackKeyframes);
        } finally {
          setIsLoading(false);
        }
      };

      generate();
      return;
    }
  }, [keyframes.length, product.imageUrl, product.name, product.description, setKeyframes]);

  const handleRegenerate = async (id: string) => {
    setRegeneratingId(id);

    try {
      const keyframe = keyframes.find(k => k.id === id);
      const index = keyframes.findIndex(k => k.id === id);
      
      if (!keyframe) return;

      const script = useWizardStore.getState().script;
      
      const response = await fetch('/api/generate-keyframes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          product, 
          script,
          regenerateIndex: index 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate keyframe');
      }

      const data = await response.json();
      
      // Replace just this keyframe's image
      if (data.keyframes && data.keyframes[index]) {
        replaceKeyframeImage(id, data.keyframes[index].imageUrl);
      }
    } catch (error) {
      console.error('Keyframe regeneration error:', error);
      // Fallback to alternate mock image
      const currentUrls = keyframes.map((k) => k.imageUrl);
      const newImageUrl = pickAlternateKeyframeImage(currentUrls);
      replaceKeyframeImage(id, newImageUrl);
    } finally {
      setRegeneratingId(null);
    }
  };

  const handleApprove = () => {
    // Selected keyframe IDs are already persisted in Zustand store
    onNavigate(4);
  };

  const handleBack = () => {
    onNavigate(2);
  };

  const selectedCount = selectedKeyframeIds.length;
  const isValid = selectedCount >= MIN_SELECTED_KEYFRAMES;

  return (
    <div>
      <StepHeading
        step={3}
        title="Select your keyframes"
        description="Choose at least 2 frames that will define your video's visual story. We'll generate smooth transitions between them."
      />

      {isLoading ? (
        <LoadingSkeleton count={4} />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {keyframes.map((keyframe) => (
            <KeyframeCard
              key={keyframe.id}
              keyframe={keyframe}
              isSelected={selectedKeyframeIds.includes(keyframe.id)}
              onToggle={() => toggleKeyframe(keyframe.id)}
              onRegenerate={() => handleRegenerate(keyframe.id)}
              isRegenerating={regeneratingId === keyframe.id}
            />
          ))}
        </motion.div>
      )}

      <WizardActions
        onBack={handleBack}
        backLabel="Back to script"
        primaryLabel="Approve Selected & Continue"
        onPrimary={handleApprove}
        primaryDisabled={isLoading || !isValid}
        hint={`Select at least ${MIN_SELECTED_KEYFRAMES} keyframes to continue (${selectedCount}/${MIN_SELECTED_KEYFRAMES} selected)`}
      />
    </div>
  );
}
