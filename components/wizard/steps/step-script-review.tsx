'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, RefreshCw, Sparkles } from 'lucide-react';
import type { APIStatus } from '@/components/wizard/api-status-indicator';
import { useWizardStore } from '@/lib/wizard/store';
import type { VideoScript, WizardStep } from '@/lib/wizard/types';
import { buildMockScript } from '@/lib/wizard/mock-data';
import { StepHeading } from '../step-heading';
import { WizardActions } from '../wizard-actions';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface ScriptCardProps {
  title: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  hint?: string;
}

function ScriptCard({
  title,
  value,
  onChange,
  placeholder,
  collapsible = false,
  defaultCollapsed = false,
  hint,
}: ScriptCardProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="rounded-2xl border border-border bg-white p-5 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-ink-800">{title}</h3>
          {hint && (
            <span className="rounded-full bg-blush-100 px-2 py-0.5 text-xs font-medium text-blush-700">
              {hint}
            </span>
          )}
        </div>
        {collapsible && (
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex h-7 w-7 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-cream-200 hover:text-ink-700"
          >
            {isCollapsed ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      <AnimatePresence initial={false}>
        {(!collapsible || !isCollapsed) && (
          <motion.div
            initial={collapsible ? { height: 0, opacity: 0 } : false}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <Textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="mt-3 min-h-[100px] rounded-xl border-input bg-background text-ink-900 placeholder:text-ink-300 focus-visible:ring-blush-400"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface LoadingSkeletonProps {
  count?: number;
}

function LoadingSkeleton({ count = 5 }: LoadingSkeletonProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.3 }}
          className="rounded-2xl border border-border bg-white p-5 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="h-4 w-24 animate-pulse rounded bg-cream-200" />
            <div className="h-4 w-4 animate-pulse rounded bg-cream-200" />
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-cream-200" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-cream-200" />
            <div className="h-4 w-4/6 animate-pulse rounded bg-cream-200" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

interface StepScriptReviewProps {
  onNavigate: (step: WizardStep) => void;
  onStatusChange?: (status: APIStatus) => void;
}

export function StepScriptReview({ onNavigate, onStatusChange }: StepScriptReviewProps) {
  const product = useWizardStore((state) => state.product);
  const script = useWizardStore((state) => state.script);
  const setScript = useWizardStore((state) => state.setScript);
  const updateScript = useWizardStore((state) => state.updateScript);

  const [isLoading, setIsLoading] = useState(!script);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenerateVariant, setRegenerateVariant] = useState(0);

  useEffect(() => {
    if (!script) {
      // Call API to generate script
      const generate = async () => {
        try {
          setIsLoading(true);
          onStatusChange?.('checking');
          
          const response = await fetch('/api/generate-script', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product, variant: regenerateVariant }),
          });

          if (!response.ok) {
            throw new Error('Failed to generate script');
          }

          const data = await response.json();
          setScript(data.script);
          onStatusChange?.('working');
        } catch (error) {
          console.error('Script generation error:', error);
          // Fallback to mock data on error
          const fallbackScript = buildMockScript(product, regenerateVariant);
          setScript(fallbackScript);
          onStatusChange?.('fallback');
        } finally {
          setIsLoading(false);
        }
      };

      generate();
      return;
    }
  }, [script, product, setScript, regenerateVariant]);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    const nextVariant = regenerateVariant + 1;
    setRegenerateVariant(nextVariant);

    try {
      onStatusChange?.('checking');
      
      const response = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product, variant: nextVariant }),
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate script');
      }

      const data = await response.json();
      setScript(data.script);
      onStatusChange?.('working');
    } catch (error) {
      console.error('Script regeneration error:', error);
      // Fallback to mock data on error
      const fallbackScript = buildMockScript(product, nextVariant);
      setScript(fallbackScript);
      onStatusChange?.('fallback');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleApprove = () => {
    // Script is already persisted in Zustand store via updateScript calls
    onNavigate(3);
  };

  const handleBack = () => {
    onNavigate(1);
  };

  const handleFieldChange = <K extends keyof VideoScript>(
    field: K,
    value: VideoScript[K]
  ) => {
    updateScript({ [field]: value });
  };

  return (
    <div>
      <StepHeading
        step={2}
        title="Review your script"
        description="Our AI crafted a video script tailored to your product. Edit any section, then approve to generate keyframes."
      />

      {isLoading ? (
        <LoadingSkeleton count={5} />
      ) : script ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {/* Hook Section */}
          <ScriptCard
            title="Hook"
            hint="0–3s"
            value={script.hook}
            onChange={(value) => handleFieldChange('hook', value)}
            placeholder="The opening line that grabs attention..."
          />

          {/* Body / Benefits Section */}
          <ScriptCard
            title="Body / Benefits"
            value={script.body}
            onChange={(value) => handleFieldChange('body', value)}
            placeholder="Key product benefits and story beats..."
          />

          {/* Voiceover Script Section */}
          <ScriptCard
            title="Voiceover Script"
            value={script.voiceover}
            onChange={(value) => handleFieldChange('voiceover', value)}
            placeholder="Full voiceover text for the video..."
          />

          {/* CTA Section */}
          <ScriptCard
            title="Call to Action"
            value={script.cta}
            onChange={(value) => handleFieldChange('cta', value)}
            placeholder="The closing line that drives action..."
          />

          {/* Seedance Prompt Section (Collapsible) */}
          <ScriptCard
            title="Full Seedance Prompt"
            value={script.seedancePrompt}
            onChange={(value) => handleFieldChange('seedancePrompt', value)}
            placeholder="Technical prompt for video generation..."
            collapsible
            defaultCollapsed
          />

          {/* Caption + Hashtags Section */}
          <div className="grid gap-4 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="rounded-2xl border border-border bg-white p-5 shadow-sm"
            >
              <Label className="text-sm font-semibold text-ink-800">Suggested Caption</Label>
              <Textarea
                value={script.caption}
                onChange={(e) => handleFieldChange('caption', e.target.value)}
                placeholder="Caption for social media post..."
                className="mt-3 min-h-[100px] rounded-xl border-input bg-background text-ink-900 placeholder:text-ink-300 focus-visible:ring-blush-400"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.3 }}
              className="rounded-2xl border border-border bg-white p-5 shadow-sm"
            >
              <Label className="text-sm font-semibold text-ink-800">Hashtags</Label>
              <Textarea
                value={script.hashtags}
                onChange={(e) => handleFieldChange('hashtags', e.target.value)}
                placeholder="#beauty #skincare #glow..."
                className="mt-3 min-h-[100px] rounded-xl border-input bg-background text-ink-900 placeholder:text-ink-300 focus-visible:ring-blush-400"
              />
            </motion.div>
          </div>
        </motion.div>
      ) : null}

      <WizardActions
        onBack={handleBack}
        backLabel="Back to product"
        primaryLabel="Approve & Continue"
        onPrimary={handleApprove}
        primaryIcon={<Sparkles className="ml-2 h-4 w-4" />}
        primaryDisabled={isLoading || !script}
        extra={
          <Button
            variant="outline"
            size="lg"
            onClick={handleRegenerate}
            disabled={isLoading || isRegenerating}
            className="min-w-[160px]"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`}
            />
            {isRegenerating ? 'Regenerating...' : 'Regenerate'}
          </Button>
        }
      />
    </div>
  );
}
