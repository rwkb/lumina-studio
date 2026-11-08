'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { STEP_LABELS, WIZARD_STEPS } from '@/lib/wizard/options';
import type { WizardStep } from '@/lib/wizard/types';

interface ProgressStepperProps {
  currentStep: WizardStep;
  onSelect: (step: WizardStep) => void;
}

export function ProgressStepper({ currentStep, onSelect }: ProgressStepperProps) {
  const progressPercent = ((currentStep - 1) / (WIZARD_STEPS.length - 1)) * 100;

  return (
    <nav aria-label="Wizard progress" className="w-full">
      <ol className="relative grid grid-cols-5 gap-2">
        <div className="pointer-events-none absolute left-[10%] right-[10%] top-5 h-px bg-ink-200" />
        <motion.div
          className="absolute left-[10%] top-5 h-px origin-left bg-gold-400"
          style={{ width: '80%' }}
          initial={false}
          animate={{ scaleX: progressPercent / 100 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />

        {WIZARD_STEPS.map((step) => {
          const isComplete = step < currentStep;
          const isCurrent = step === currentStep;
          const isClickable = isComplete;

          return (
            <li key={step} className="relative flex flex-col items-center">
              <button
                type="button"
                onClick={() => isClickable && onSelect(step)}
                disabled={!isClickable}
                aria-current={isCurrent ? 'step' : undefined}
                className={cn(
                  'group flex flex-col items-center gap-3 rounded-xl px-1 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isClickable ? 'cursor-pointer' : 'cursor-default',
                )}
              >
                <span
                  className={cn(
                    'relative flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold transition-all duration-500',
                    isComplete && 'border-gold-400 bg-gold-400 text-ink-900 group-hover:bg-gold-300',
                    isCurrent && 'border-blush-400 bg-blush-400 text-ink-900 shadow-glow',
                    !isComplete && !isCurrent && 'border-ink-200 bg-white text-ink-500',
                  )}
                >
                  {isComplete ? <Check className="h-4 w-4" strokeWidth={2.5} /> : step}
                  {isCurrent && (
                    <motion.span
                      className="absolute inset-0 rounded-full border border-blush-400"
                      animate={{ scale: [1, 1.35], opacity: [0.6, 0] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                    />
                  )}
                </span>
                <span
                  className={cn(
                    'hidden text-center text-xs font-medium leading-tight transition-colors md:block',
                    isCurrent ? 'text-ink-900' : isComplete ? 'text-ink-700' : 'text-ink-500',
                  )}
                >
                  {STEP_LABELS[step]}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <p className="mt-5 text-center text-xs font-medium uppercase tracking-[0.16em] text-ink-500 md:hidden">
        Step {currentStep} of 5 · {STEP_LABELS[currentStep]}
      </p>
    </nav>
  );
}
