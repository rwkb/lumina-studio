import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export function BrandLogo() {
  return (
    <Link href="/" className="group inline-flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blush-400 text-ink-900 shadow-soft transition-transform duration-300 group-hover:rotate-12">
        <Sparkles className="h-4 w-4" strokeWidth={2} />
      </span>
      <span className="text-[17px] font-semibold tracking-tight text-ink-900">
        Lumina <span className="font-normal text-ink-500">Studio</span>
      </span>
    </Link>
  );
}
