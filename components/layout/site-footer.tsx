import { BrandLogo } from './brand-logo';

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-10 text-sm text-ink-500 md:flex-row lg:px-10">
        <BrandLogo />
        <p>Crafted for beauty and fashion brands.</p>
        <p>&copy; 2026 Lumina Studio</p>
      </div>
    </footer>
  );
}
