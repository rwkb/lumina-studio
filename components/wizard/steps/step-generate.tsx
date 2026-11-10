'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, RefreshCw, Play, Copy, Check } from 'lucide-react';
import { useWizardStore } from '@/lib/wizard/store';
import type { GeneratedVideo, WizardStep } from '@/lib/wizard/types';
import type { APIStatus } from '@/components/wizard/api-status-indicator';
import { buildMockVideos } from '@/lib/wizard/mock-data';
import { FALLBACK_VIDEO_URL } from '@/lib/wizard/fallback-data';
import { StepHeading } from '../step-heading';
import { WizardActions } from '../wizard-actions';
import { Button } from '@/components/ui/button';

interface VideoPlayerCardProps {
  video: GeneratedVideo;
  index: number;
}

function VideoPlayerCard({ video, index }: VideoPlayerCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15, duration: 0.4, ease: 'easeOut' }}
      className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm"
    >
      {/* Video Container with fallback for failed loads */}
      <div className="relative aspect-[9/16] bg-ink-900 sm:aspect-[9/14]">
        <video
          src={video.videoUrl}
          poster={video.posterUrl}
          controls
          playsInline
          onError={(e) => {
            // Fallback system: Use default video on load failure
            const currentSrc = e.currentTarget.src;
            if (currentSrc !== FALLBACK_VIDEO_URL) {
              e.currentTarget.src = FALLBACK_VIDEO_URL;
            }
          }}
          onLoadedMetadata={(e) => {
            // Handle poster image fallback if video loads but poster fails
            const videoEl = e.currentTarget;
            if (!videoEl.poster && videoEl.videoWidth === 0) {
              // Video might be broken, apply fallback
              if (videoEl.src !== FALLBACK_VIDEO_URL) {
                videoEl.src = FALLBACK_VIDEO_URL;
              }
            }
          }}
          className="h-full w-full object-cover"
        />
        {/* Fallback play button overlay for browsers without native controls */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm">
            <Play className="h-7 w-7 text-ink-800" fill="currentColor" />
          </div>
        </div>
      </div>

      {/* Video Info */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-ink-800">{video.title}</h3>
        <p className="mt-1 text-xs text-ink-500">{video.platform}</p>
      </div>
    </motion.div>
  );
}

interface CaptionCardProps {
  caption: string;
  hashtags: string;
}

function CaptionCard({ caption, hashtags }: CaptionCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const fullText = `${caption}\n\n${hashtags}`;
    try {
      // TODO: BACKEND - Copy to clipboard functionality
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error('Failed to copy to clipboard');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.35 }}
      className="rounded-2xl border border-border bg-white p-6 shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-ink-800">Generated Caption</h4>
          <p className="mt-2 text-sm leading-relaxed text-ink-600">{caption}</p>
          <p className="mt-3 text-sm text-blush-600">{hashtags}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="shrink-0 text-ink-500 hover:bg-cream-100 hover:text-ink-700"
        >
          {copied ? (
            <Check className="h-4 w-4 text-emerald-600" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
    </motion.div>
  );
}

interface GeneratingStateProps {
  productName: string;
}

function GeneratingState({ productName }: GeneratingStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center py-20"
    >
      {/* Animated Progress Ring */}
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="h-20 w-20 rounded-full border-4 border-cream-200 border-t-blush-400"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="h-12 w-12 rounded-full bg-gradient-to-br from-blush-300 to-blush-400"
          />
        </div>
      </div>

      {/* Loading Text */}
      <motion.h3
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 text-xl font-semibold text-ink-800"
      >
        Generating your video
      </motion.h3>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-2 text-center text-sm text-ink-500"
      >
        Creating beautiful frames for {productName || 'your product'}...
      </motion.p>

      {/* Progress Steps */}
      <div className="mt-8 flex flex-col gap-3">
        {['Analyzing keyframes', 'Building scene transitions', 'Rendering final cut'].map(
          (step, i) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.3, duration: 0.35 }}
              className="flex items-center gap-3"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6 + i * 0.3, type: 'spring', stiffness: 300 }}
                className="h-2 w-2 rounded-full bg-blush-400"
              />
              <span className="text-sm text-ink-600">{step}</span>
            </motion.div>
          )
        )}
      </div>
    </motion.div>
  );
}

interface StepGenerateProps {
  onNavigate: (step: WizardStep) => void;
  onStatusChange?: (status: APIStatus) => void;
}

export function StepGenerate({ onNavigate, onStatusChange }: StepGenerateProps) {
  const product = useWizardStore((state) => state.product);
  const script = useWizardStore((state) => state.script);
  const keyframes = useWizardStore((state) => state.keyframes);
  const selectedKeyframeIds = useWizardStore((state) => state.selectedKeyframeIds);
  const generatedVideos = useWizardStore((state) => state.generatedVideos);
  const setGeneratedVideos = useWizardStore((state) => state.setGeneratedVideos);

  const [isGenerating, setIsGenerating] = useState(generatedVideos.length === 0);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Generate videos on mount if not already generated
  useEffect(() => {
    if (generatedVideos.length === 0 && keyframes.length > 0) {
      const generate = async () => {
        try {
          setIsGenerating(true);
          
          const selectedKeyframes = keyframes.filter((k) =>
            selectedKeyframeIds.includes(k.id)
          );

          const response = await fetch('/api/generate-video', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              keyframes: selectedKeyframes, 
              product, 
              script 
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to generate video');
          }

          const data = await response.json();
          setGeneratedVideos(data.videos);
        } catch (error) {
          console.error('Video generation error:', error);
          // Fallback to mock data on error
          const selectedKeyframes = keyframes.filter((k) =>
            selectedKeyframeIds.includes(k.id)
          );
          const fallbackVideos = buildMockVideos(selectedKeyframes, product, script!);
          setGeneratedVideos(fallbackVideos);
        } finally {
          setIsGenerating(false);
        }
      };

      generate();
      return;
    } else if (generatedVideos.length > 0) {
      setIsGenerating(false);
    }
  }, [
    generatedVideos.length,
    keyframes,
    selectedKeyframeIds,
    product,
    script,
    setGeneratedVideos,
  ]);

  const handleDownload = async (video: GeneratedVideo) => {
    // TODO: BACKEND - Implement actual video download from BytePlus CDN
    // This would trigger a download of the generated video file
    console.log('Download video:', video.id);
    // Mock download - in production this would fetch from CDN
    const link = document.createElement('a');
    link.href = video.videoUrl;
    link.download = `${video.title}.mp4`;
    link.click();
  };

  const handleRegenerate = async () => {
    // TODO: BACKEND - Call Seedance API to regenerate videos with different parameters
    setIsRegenerating(true);
    setIsGenerating(true);
    setGeneratedVideos([]);

    // Simulate regeneration delay
    await new Promise((resolve) => setTimeout(resolve, 4000));

    const selectedKeyframes = keyframes.filter((k) => selectedKeyframeIds.includes(k.id));
    const videos = buildMockVideos(selectedKeyframes, product, script!);
    setGeneratedVideos(videos);

    setIsGenerating(false);
    setIsRegenerating(false);
  };

  const handleBack = () => {
    onNavigate(3);
  };

  const handleContinue = () => {
    onNavigate(5);
  };

  const firstVideo = generatedVideos[0];
  const caption = script?.caption ?? '';
  const hashtags = script?.hashtags ?? '';

  return (
    <div>
      <StepHeading
        step={4}
        title="Generate your video"
        description="We're bringing your keyframes to life with smooth motion and cinematic transitions."
      />

      <AnimatePresence mode="wait">
        {isGenerating ? (
          <GeneratingState key="generating" productName={product.name} />
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Video Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              {generatedVideos.map((video, index) => (
                <VideoPlayerCard key={video.id} video={video} index={index} />
              ))}
            </div>

            {/* Caption Section */}
            {(caption || hashtags) && (
              <div className="mt-6">
                <CaptionCard caption={caption} hashtags={hashtags} />
              </div>
            )}

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}
              className="mt-6 flex flex-wrap gap-3"
            >
              {firstVideo && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleDownload(firstVideo)}
                  className="gap-2 rounded-xl border-border text-ink-700 hover:bg-cream-100"
                >
                  <Download className="h-4 w-4" />
                  Download Video
                </Button>
              )}
              <Button
                variant="outline"
                size="lg"
                onClick={handleRegenerate}
                disabled={isRegenerating}
                className="gap-2 rounded-xl border-border text-ink-700 hover:bg-cream-100"
              >
                <RefreshCw className={`h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} />
                Regenerate
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <WizardActions
        onBack={handleBack}
        backLabel="Back to keyframes"
        primaryLabel="Approve & Continue"
        onPrimary={handleContinue}
        primaryDisabled={isGenerating || generatedVideos.length === 0}
        hint={isGenerating ? 'Generating video...' : undefined}
      />
    </div>
  );
}
