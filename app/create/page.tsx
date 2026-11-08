import type { Metadata } from 'next';
import { WizardShell } from '@/components/wizard/wizard-shell';

export const metadata: Metadata = {
  title: 'Create New Video | Lumina Studio',
};

export default function CreatePage() {
  return <WizardShell />;
}
