'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { STYLE_OPTIONS } from '@/lib/wizard/options';
import type { StylePreset } from '@/lib/wizard/types';

interface StylePresetPickerProps {
  value: StylePreset;
  onChange: (style: StylePreset) => void;
}

export function StylePresetPicker({ value, onChange }: StylePresetPickerProps) {
  return (
    <div role="radiogroup" aria-label="Video style" className="grid gap-3 sm:grid-cols-2">
      {STYLE_OPTIONS.map((option) => {
        const isSelected = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(option.id)}
            className={cn(
              'group relative flex items-start gap-4 overflow-hidden rounded-2xl border bg-white p-4 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              isSelected
                ? 'border-blush-400 shadow-glow'
                : 'border-border shadow-soft hover:-translate-y-0.5 hover:border-blush-300 hover:shadow-lift',
            )}
          >
            {isSelected && (
              <motion.span
                layoutId="style-preset-indicator"
                className="absolute inset-0 rounded-2xl bg-blush-50"
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
            )}
            <span
              className={cn(
                'relative h-12 w-12 shrink-0 rounded-xl bg-gradient-to-br transition-transform duration-500 group-hover:scale-105',
                option.swatchClass,
              )}
            />
            <span className="relative flex min-w-0 flex-1 flex-col gap-1">
              <span className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-ink-900">{option.id}</span>
                <span
                  className={cn(
                    'flex h-5 w-5 items-center justify-center rounded-full border transition-colors',
                    isSelected ? 'border-gold-500 bg-gold-400' : 'border-ink-300 bg-white',
                  )}
                >
                  {isSelected && <Check className="h-3 w-3 text-ink-900" strokeWidth={3} />}
                </span>
              </span>
              <span className="text-xs leading-relaxed text-ink-500">{option.description}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
