import type { WizardStep } from '@/lib/wizard/types';

interface StepHeadingProps {
  step: WizardStep;
  title: string;
  description: string;
}

export function StepHeading({ step, title, description }: StepHeadingProps) {
  return (
    <header className="mb-10 max-w-2xl">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold-600">
        Step {step} of 5
      </p>
      <h2 className="mt-3 text-3xl font-semibold leading-[1.15] tracking-tight text-ink-900 md:text-4xl">
        {title}
      </h2>
      <p className="mt-3 text-base leading-relaxed text-ink-500">{description}</p>
    </header>
  );
}
