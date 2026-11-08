import type { ReactNode } from 'react';
import { BrandLogo } from './brand-logo';

export function SiteHeader({ action }: { action?: ReactNode }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-10">
        <BrandLogo />
        {action}
      </div>
    </header>
  );
}
