'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { ImageOff, Link2, Loader2, Replace, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fileToResizedDataUrl } from '@/lib/wizard/image';
import type { ImageSource } from '@/lib/wizard/types';
import { cn } from '@/lib/utils';

const MAX_FILE_BYTES = 10 * 1024 * 1024;

interface ProductImageFieldProps {
  imageUrl: string | null;
  onChange: (imageUrl: string, source: ImageSource) => void;
  onClear: () => void;
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function ProductImageField({ imageUrl, onChange, onClear }: ProductImageFieldProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linkDraft, setLinkDraft] = useState('');
  const [previewFailed, setPreviewFailed] = useState(false);

  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
    accept: { 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'], 'image/webp': ['.webp'] },
    maxFiles: 1,
    maxSize: MAX_FILE_BYTES,
    multiple: false,
    noClick: Boolean(imageUrl),
    noKeyboard: Boolean(imageUrl),
    onDrop: (accepted, rejections) => {
      setError(null);
      if (rejections.length > 0) {
        setError(rejections[0].errors[0]?.message ?? 'This file cannot be used.');
        return;
      }
      const file = accepted[0];
      if (!file) return;

      setIsProcessing(true);
      // TODO: BACKEND - Upload the product photo to object storage so it survives across devices.
      fileToResizedDataUrl(file)
        .then((dataUrl) => {
          setPreviewFailed(false);
          onChange(dataUrl, 'upload');
        })
        .catch((cause: Error) => setError(cause.message))
        .finally(() => setIsProcessing(false));
    },
  });

  const handleUseLink = () => {
    const trimmed = linkDraft.trim();
    if (!isHttpUrl(trimmed)) {
      setError('Please paste a full web address that starts with https://');
      return;
    }
    setError(null);
    setPreviewFailed(false);
    onChange(trimmed, 'url');
    setLinkDraft('');
  };

  const handleClear = () => {
    setError(null);
    setPreviewFailed(false);
    onClear();
  };

  if (imageUrl) {
    return (
      <div className="group relative overflow-hidden rounded-3xl border border-border bg-muted shadow-soft">
        <div className="relative aspect-[4/5] w-full">
          {previewFailed ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
              <ImageOff className="h-8 w-8 text-ink-500" />
              <p className="text-sm text-ink-700">This image could not be loaded. Try another photo or link.</p>
            </div>
          ) : (
            <img
              src={imageUrl}
              alt="Your product"
              onError={() => setPreviewFailed(true)}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            />
          )}
        </div>
        <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-2 rounded-2xl bg-white/90 p-2 pl-4 shadow-lift backdrop-blur">
          <span className="text-sm font-medium text-ink-700">Product photo</span>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={open} className="text-ink-700">
              <Replace className="h-4 w-4" />
              Replace
            </Button>
            <Button variant="ghost" size="sm" onClick={handleClear} className="text-error hover:text-error">
              <Trash2 className="h-4 w-4" />
              Remove
            </Button>
          </div>
        </div>
        <input {...getInputProps()} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        {...getRootProps()}
        className={cn(
          'flex min-h-[380px] cursor-pointer flex-col items-center justify-center gap-5 rounded-3xl border-2 border-dashed p-10 text-center transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          isDragActive
            ? 'scale-[1.01] border-blush-500 bg-blush-100'
            : 'border-blush-300 bg-blush-50/60 hover:border-blush-400 hover:bg-blush-100/70',
        )}
      >
        <input {...getInputProps()} />
        <span
          className={cn(
            'flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-soft transition-transform duration-500',
            isDragActive && '-translate-y-1',
          )}
        >
          {isProcessing ? (
            <Loader2 className="h-6 w-6 animate-spin text-gold-500" />
          ) : (
            <Upload className="h-6 w-6 text-blush-600" />
          )}
        </span>
        <div className="space-y-2">
          <p className="text-lg font-semibold text-ink-900">
            {isDragActive ? 'Release to add your photo' : 'Drop your product photo here'}
          </p>
          <p className="text-sm text-ink-500">
            or <span className="font-medium text-ink-700 underline underline-offset-4">browse your files</span>
            {' '}· PNG, JPG or WEBP up to 10 MB
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-soft">
        <label htmlFor="product-image-link" className="flex items-center gap-2 text-sm font-medium text-ink-700">
          <Link2 className="h-4 w-4 text-ink-500" />
          Or paste a product image link
        </label>
        <div className="mt-3 flex gap-2">
          <Input
            id="product-image-link"
            value={linkDraft}
            onChange={(event) => setLinkDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                handleUseLink();
              }
            }}
            placeholder="https://example.com/product.jpg"
            className="h-11 rounded-xl border-input bg-background focus-visible:ring-blush-400"
          />
          <Button
            variant="outline"
            onClick={handleUseLink}
            disabled={!linkDraft.trim()}
            className="h-11 rounded-xl px-5"
          >
            Use link
          </Button>
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-error/10 px-4 py-3 text-sm text-error">
          {error}
        </p>
      )}
    </div>
  );
}
