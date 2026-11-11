'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type APIStatus = 'working' | 'partial' | 'fallback' | 'checking' | 'idle';

interface APIStatusIndicatorProps {
  status: APIStatus;
  label: string;
  className?: string;
}

export function APIStatusIndicator({ status, label, className }: APIStatusIndicatorProps) {
  const statusConfig = {
    working: {
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      label: 'API Connected',
    },
    partial: {
      icon: AlertCircle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      label: 'Partial Success',
    },
    fallback: {
      icon: AlertCircle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      label: 'Using Fallback',
    },
    checking: {
      icon: Loader2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      label: 'Checking...',
    },
    idle: {
      icon: CheckCircle2,
      color: 'text-gray-400',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      label: 'Not Started',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm',
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      <Icon
        className={cn('h-4 w-4', config.color, status === 'checking' && 'animate-spin')}
      />
      <span className={cn('font-medium', config.color)}>{label}</span>
      <span className="text-xs text-gray-500">• {config.label}</span>
    </motion.div>
  );
}

interface APIStatusBarProps {
  textStatus: APIStatus;
  imageStatus: APIStatus;
  videoStatus: APIStatus;
  className?: string;
}

export function APIStatusBar({ textStatus, imageStatus, videoStatus, className }: APIStatusBarProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      <APIStatusIndicator status={textStatus} label="Text API" />
      <APIStatusIndicator status={imageStatus} label="Image API" />
      <APIStatusIndicator status={videoStatus} label="Video API" />
    </div>
  );
}
