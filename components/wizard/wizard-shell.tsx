'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { ProgressStepper } from './progress-stepper';
import { Button } from '@/components/ui/button';
import { StepProductInput } from './steps/step-product-input';
import { StepScriptReview } from './steps/step-script-review';
import { StepKeyframes } from './steps/step-keyframes';
import { StepGenerate } from './steps/step-generate';
import { StepResult } from './steps/step-result';
import { MIN_SELECTED_KEYFRAMES, isProductComplete, useWizardStore } from '@/lib/wizard/store';
import { STEP_LABELS } from '@/lib/wizard/options';
import type { ProductDraft, VideoScript, WizardStep } from '@/lib/wizard/types';

function getFurthestValidStep(
  product: ProductDraft,
  script: VideoScript | null,
  selectedKeyframeCount: number,
  hasVideos: boolean,
): WizardStep {
  if (!isProductComplete(product)) return 1;
  if (!script) return 2;
  if (selectedKeyframeCount < MIN_SELECTED_KEYFRAMES) return 3;
  if (!hasVideos) return 4;
  return 5;
}

const stepVariants = {
  enter: (direction: number) => ({ opacity: 0, x: direction * 40 }),
  center: { opacity: 1, x: 0 },
  exit: (direction: number) => ({ opacity: 0, x: direction * -40 }),
};

export function WizardShell() {
  const currentStep = useWizardStore((state) => state.currentStep);
  const product = useWizardStore((state) => state.product);
  const script = useWizardStore((state) => state.script);
  const selectedKeyframeIds = useWizardStore((state) => state.selectedKeyframeIds);
  const generatedVideos = useWizardStore((state) => state.generatedVideos);
  const goToStep = useWizardStore((state) => state.goToStep);
  const resetWizard = useWizardStore((state) => state.resetWizard);

  const [isReady, setIsReady] = useState(false);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    setIsReady(true);
  }, []);

  const furthestValidStep = getFurthestValidStep(
    product,
    script,
    selectedKeyframeIds.length,
    generatedVideos.length > 0,
  );

  useEffect(() => {
    if (isReady && furthestValidStep < currentStep) {
      goToStep(furthestValidStep);
    }
  }, [isReady, furthestValidStep, currentStep, goToStep]);

  const navigate = useCallback(
    (step: WizardStep) => {
      setDirection(step >= currentStep ? 1 : -1);
      goToStep(step);
    },
    [currentStep, goToStep],
  );

  const renderStep = (): ReactNode => {
    switch (currentStep) {
      case 1:
        return <StepProductInput onNavigate={navigate} />;
      case 2:
        return <StepScriptReview onNavigate={navigate} />;
      case 3:
        return <StepKeyframes onNavigate={navigate} />;
      case 4:
        return <StepGenerate onNavigate={navigate} />;
      case 5:
        return <StepResult onNavigate={navigate} />;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 pb-20 pt-10 lg:px-10">
        <div className="mb-6 flex items-center justify-between">
          <ProgressStepper currentStep={currentStep} onSelect={navigate} />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm('Clear all progress and start over? This cannot be undone.')) {
                resetWizard();
                window.location.href = '/';
              }
            }}
            className="text-ink-500 hover:text-ink-700"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Start Over
          </Button>
        </div>

        <div className="mt-12 rounded-3xl border border-white bg-card p-6 shadow-soft sm:p-8 md:p-12">
          <p className="sr-only">
            Step {currentStep}: {STEP_LABELS[currentStep]}
          </p>
          {isReady ? (
            <AnimatePresence mode="wait" initial={false} custom={direction}>
              <motion.div
                key={currentStep}
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="skeleton-shimmer h-[480px] rounded-2xl" />
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
