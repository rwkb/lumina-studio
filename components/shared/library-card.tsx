import type { LibraryItem, LibraryStatus } from '@/lib/wizard/types';
import { FALLBACK_LIBRARY_THUMBNAIL } from '@/lib/wizard/fallback-data';
import { cn } from '@/lib/utils';

const STATUS_STYLES: Record<LibraryStatus, string> = {
  Ready: 'bg-sage-100 text-sage-700',
  Processing: 'bg-gold-100 text-gold-700',
  Draft: 'bg-ink-100 text-ink-700',
};

export function formatLibraryDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function LibraryCard({ item }: { item: LibraryItem }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all duration-500 hover:-translate-y-1 hover:shadow-lift">
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        {/* Thumbnail with fallback for failed loads */}
        <img
          src={item.thumbnailUrl}
          alt={item.title}
          onError={(e) => {
            // Fallback system: Use default placeholder on image load failure
            if (e.currentTarget.src !== FALLBACK_LIBRARY_THUMBNAIL) {
              e.currentTarget.src = FALLBACK_LIBRARY_THUMBNAIL;
            }
          }}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-ink-700 shadow-soft backdrop-blur">
            {item.platform}
          </span>
          <span
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium shadow-soft',
              STATUS_STYLES[item.status],
            )}
          >
            {item.status}
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-5">
        <p className="text-xs font-medium uppercase tracking-wider text-ink-500">
          {formatLibraryDate(item.createdAt)}
        </p>
        <h3 className="text-base font-semibold leading-snug text-ink-900">{item.title}</h3>
      </div>
    </article>
  );
}
