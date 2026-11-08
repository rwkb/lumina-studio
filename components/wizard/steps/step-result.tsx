'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Download, RefreshCw, Sparkles } from 'lucide-react';
import { useWizardStore } from '@/lib/wizard/store';
import type { Platform, WizardStep, LibraryItem } from '@/lib/wizard/types';
import { LIBRARY_ITEMS, LIBRARY_FILTERS, SAMPLE_VIDEO_URL } from '@/lib/wizard/mock-data';
import { FALLBACK_VIDEO_URL } from '@/lib/wizard/fallback-data';
import { StepHeading } from '../step-heading';
import { WizardActions } from '../wizard-actions';
import { LibraryCard } from '@/components/shared/library-card';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface StepResultProps {
  onNavigate: (step: WizardStep) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function StepResult({ onNavigate }: StepResultProps) {
  const product = useWizardStore((state) => state.product);
  const generatedVideos = useWizardStore((state) => state.generatedVideos);
  const script = useWizardStore((state) => state.script);
  const resetWizard = useWizardStore((state) => state.resetWizard);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  // Use the first generated video for the success display
  const latestVideo = generatedVideos[0];
  const hasVideo = Boolean(latestVideo);

  // Filter library items based on selected platform
  const filteredLibrary = LIBRARY_ITEMS.filter((item) => {
    if (activeFilter === 'all') return true;
    const filter = LIBRARY_FILTERS.find((f) => f.id === activeFilter);
    return filter?.platform === item.platform;
  });

  const handleDownload = () => {
    // TODO: BACKEND - Replace with actual video download from BytePlus CDN
    if (latestVideo?.videoUrl) {
      window.open(latestVideo.videoUrl, '_blank');
    }
  };

  const handleStartNew = () => {
    resetWizard();
    onNavigate(1);
  };

  return (
    <div>
      <StepHeading
        step={5}
        title="Your video is ready"
        description="Download your creation or start a new project. Below is your video library with all your previous content."
      />

      {/* Success State - Latest Video */}
      {hasVideo && (
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-12"
        >
          <motion.div
            variants={itemVariants}
            className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft"
          >
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              {/* Video Preview with fallback for failed loads */}
              <div className="relative aspect-[9/16] overflow-hidden bg-muted sm:aspect-[9/14] lg:aspect-[9/12]">
                <video
                  src={latestVideo.videoUrl || SAMPLE_VIDEO_URL}
                  poster={latestVideo.posterUrl}
                  controls
                  playsInline
                  onError={(e) => {
                    // Fallback system: Use default video on load failure
                    const currentSrc = e.currentTarget.src;
                    if (currentSrc !== FALLBACK_VIDEO_URL) {
                      e.currentTarget.src = FALLBACK_VIDEO_URL;
                    }
                  }}
                  className="h-full w-full object-cover"
                />
                <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 shadow-soft backdrop-blur">
                  <CheckCircle className="h-4 w-4 text-sage-600" />
                  <span className="text-sm font-medium text-ink-900">Ready</span>
                </div>
              </div>

              {/* Video Details */}
              <div className="flex flex-col justify-center p-6 lg:p-8">
                <div className="mb-4 inline-flex items-center gap-2 self-start rounded-full bg-blush-100 px-3 py-1.5">
                  <span className="text-sm font-medium text-blush-700">
                    {latestVideo.platform}
                  </span>
                </div>

                <h3 className="mb-4 text-xl font-semibold text-ink-900 lg:text-2xl">
                  {product.name || 'Your Video'}
                </h3>

                {script?.caption && (
                  <p className="mb-6 text-sm leading-relaxed text-ink-600">
                    {script.caption}
                  </p>
                )}

                {script?.hashtags && (
                  <p className="mb-6 text-sm text-ink-500">{script.hashtags}</p>
                )}

                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="cta"
                    size="lg"
                    onClick={handleDownload}
                    className="min-w-[160px]"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                  <Button variant="outline" size="lg" onClick={handleStartNew}>
                    <RefreshCw className="h-4 w-4" />
                    Create Another
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.section>
      )}

      {/* Video Library Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mt-12"
      >
        <motion.header variants={itemVariants} className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-ink-900 lg:text-xl">
              Video Library
            </h3>
            <p className="mt-1 text-sm text-ink-500">
              All your created videos in one place
            </p>
          </div>

          {/* Shoppable Button - Coming Soon */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="lg"
                  disabled
                  className="relative overflow-hidden border-blush-300 text-blush-400 opacity-70"
                >
                  <Sparkles className="h-4 w-4" />
                  Make Shoppable
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-xs">
                <p className="text-sm">
                  Coming soon – TikTok Shop & BytePlus integration
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </motion.header>

        {/* Filter Chips */}
        <motion.div variants={itemVariants} className="mb-8 flex flex-wrap gap-2">
          {LIBRARY_FILTERS.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={cn(
                'rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200',
                activeFilter === filter.id
                  ? 'bg-ink-900 text-white shadow-soft'
                  : 'bg-white text-ink-700 hover:bg-ink-50 border border-border'
              )}
            >
              {filter.label}
            </button>
          ))}
        </motion.div>

        {/* Library Grid */}
        <motion.div
          variants={containerVariants}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filteredLibrary.map((item, index) => (
            <motion.div
              key={item.id}
              variants={itemVariants}
              // TODO: BACKEND - Replace with paginated fetch from video library API
            >
              <LibraryCard item={item} />
            </motion.div>
          ))}
        </motion.div>

        {filteredLibrary.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-muted/50 py-16 text-center">
            <p className="text-ink-500">No videos found for this filter</p>
          </div>
        )}
      </motion.section>

      {/* Navigation */}
      <WizardActions
        onBack={() => onNavigate(4)}
        backLabel="Back to video"
        primaryLabel="Create Another Video"
        onPrimary={handleStartNew}
      />
    </div>
  );
}
