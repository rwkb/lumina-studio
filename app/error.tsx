'use client';

import { useEffect } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

/**
 * Error Boundary for Lumina Studio
 * Catches runtime errors and provides an elegant fallback UI
 * matching the soft luxury design system
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error for debugging - in production, send to error tracking service
    console.error('Lumina Studio error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-rose-200 bg-white p-8 shadow-soft">
        {/* Error Icon */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
            <AlertTriangle className="h-8 w-8 text-rose-500" />
          </div>
        </div>

        {/* Error Message */}
        <h2 className="mb-3 text-center text-xl font-semibold text-ink-900">
          Something went wrong
        </h2>
        <p className="mb-6 text-center text-sm leading-relaxed text-ink-600">
          We encountered an unexpected error while processing your request.
          Please try again, or refresh the page if the problem persists.
        </p>

        {/* Retry Button */}
        <button
          onClick={reset}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blush-400 px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-blush-500 focus:outline-none focus:ring-2 focus:ring-blush-300 focus:ring-offset-2"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>

        {/* Error Digest (for debugging) */}
        {error.digest && (
          <p className="mt-4 text-center text-xs text-ink-400">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
