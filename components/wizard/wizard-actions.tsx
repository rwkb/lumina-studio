import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface WizardActionsProps {
  onBack?: () => void;
  backHref?: string;
  backLabel?: string;
  primaryLabel: string;
  onPrimary: () => void;
  primaryIcon?: ReactNode;
  primaryDisabled?: boolean;
  hint?: string;
  extra?: ReactNode;
}

export function WizardActions({
  onBack,
  backHref,
  backLabel = 'Back',
  primaryLabel,
  onPrimary,
  primaryIcon,
  primaryDisabled = false,
  hint,
  extra,
}: WizardActionsProps) {
  const backButton = backHref ? (
    <Button asChild variant="ghost" size="lg" className="text-ink-700">
      <Link href={backHref}>
        <ArrowLeft className="h-4 w-4" />
        {backLabel}
      </Link>
    </Button>
  ) : onBack ? (
    <Button variant="ghost" size="lg" className="text-ink-700" onClick={onBack}>
      <ArrowLeft className="h-4 w-4" />
      {backLabel}
    </Button>
  ) : (
    <span />
  );

  return (
    <div className="mt-10 flex flex-col-reverse gap-4 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
      {backButton}
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-5">
        {extra}
        {hint && primaryDisabled && (
          <p className="text-center text-sm text-ink-500 sm:text-right">{hint}</p>
        )}
        <Button
          variant="cta"
          size="lg"
          onClick={onPrimary}
          disabled={primaryDisabled}
          className="min-w-[220px]"
        >
          {primaryLabel}
          {primaryIcon}
        </Button>
      </div>
    </div>
  );
}
