import type { Metadata } from 'next';
import { WizardShell } from '@/components/wizard/wizard-shell';

export const metadata: Metadata = {
  title: 'Create New Video | SeedReel',
};

export default function CreatePage() {
  return <WizardShell />;
}
