'use client';

import { useWizardStore, isProductComplete } from '@/lib/wizard/store';
import { PLATFORMS, VIDEO_DURATIONS, LANGUAGES, type Platform, type VideoDuration, type Language, type ImageSource } from '@/lib/wizard/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StepHeading } from '../step-heading';
import { WizardActions } from '../wizard-actions';
import { ProductImageField } from './product-image-field';
import { StylePresetPicker } from './style-preset-picker';
import type { WizardStep } from '@/lib/wizard/types';

const FIELD_INPUT_CLASS =
  'h-12 rounded-xl border-input bg-background text-ink-900 placeholder:text-ink-300 focus-visible:ring-blush-400';

interface StepProductInputProps {
  onNavigate: (step: WizardStep) => void;
}

export function StepProductInput({ onNavigate }: StepProductInputProps) {
  const product = useWizardStore((state) => state.product);
  const updateProduct = useWizardStore((state) => state.updateProduct);
  const isComplete = isProductComplete(product);

  const handleImageChange = (imageUrl: string, source: ImageSource) =>
    updateProduct({ imageUrl, imageSource: source });

  return (
    <div>
      <StepHeading
        step={1}
        title="Tell us about your product"
        description="Add a hero photo and a few details. We will use them to write the script, storyboard the shots, and style the video."
      />

      <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <ProductImageField
          imageUrl={product.imageUrl}
          onChange={handleImageChange}
          onClear={() => updateProduct({ imageUrl: null, imageSource: null })}
        />

        <div className="flex flex-col gap-7">
          <div className="grid gap-2">
            <Label htmlFor="product-name" className="text-sm font-medium text-ink-700">
              Product name
            </Label>
            <Input
              id="product-name"
              value={product.name}
              maxLength={80}
              onChange={(event) => updateProduct({ name: event.target.value })}
              placeholder="e.g. Petal Glow Serum"
              className={FIELD_INPUT_CLASS}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="product-description" className="text-sm font-medium text-ink-700">
              Product description
            </Label>
            <Textarea
              id="product-description"
              value={product.description}
              maxLength={600}
              onChange={(event) => updateProduct({ description: event.target.value })}
              placeholder="Key benefits, texture, finish, ingredients, or what makes it special"
              className="min-h-[120px] rounded-xl border-input bg-background text-ink-900 placeholder:text-ink-300 focus-visible:ring-blush-400"
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="platform" className="text-sm font-medium text-ink-700">
                Platform
              </Label>
              <Select
                value={product.platform}
                onValueChange={(value) => updateProduct({ platform: value as Platform })}
              >
                <SelectTrigger id="platform" className="h-12 rounded-xl border-input bg-background text-ink-900">
                  <SelectValue placeholder="Choose a platform" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {PLATFORMS.map((platform) => (
                    <SelectItem key={platform} value={platform} className="rounded-lg">
                      {platform}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="duration" className="text-sm font-medium text-ink-700">
                Video Duration
              </Label>
              <Select
                value={product.duration}
                onValueChange={(value) => updateProduct({ duration: value as VideoDuration })}
              >
                <SelectTrigger id="duration" className="h-12 rounded-xl border-input bg-background text-ink-900">
                  <SelectValue placeholder="Choose duration" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {VIDEO_DURATIONS.map((duration) => (
                    <SelectItem key={duration} value={duration} className="rounded-lg">
                      {duration}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="language" className="text-sm font-medium text-ink-700">
              Script Language
            </Label>
            <Select
              value={product.language}
              onValueChange={(value) => updateProduct({ language: value as Language })}
            >
              <SelectTrigger id="language" className="h-12 rounded-xl border-input bg-background text-ink-900">
                <SelectValue placeholder="Choose language" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {LANGUAGES.map((language) => (
                  <SelectItem key={language} value={language} className="rounded-lg">
                    {language}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-3">
            <Label className="text-sm font-medium text-ink-700">Style preset</Label>
            <StylePresetPicker
              value={product.style}
              onChange={(style) => updateProduct({ style })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="brand-notes" className="text-sm font-medium text-ink-700">
              Brand tone and notes <span className="font-normal text-ink-500">(optional)</span>
            </Label>
            <Textarea
              id="brand-notes"
              value={product.brandNotes}
              maxLength={400}
              onChange={(event) => updateProduct({ brandNotes: event.target.value })}
              placeholder="e.g. Calm, confident, never salesy. Avoid trend-heavy slang."
              className="min-h-[88px] rounded-xl border-input bg-background text-ink-900 placeholder:text-ink-300 focus-visible:ring-blush-400"
            />
          </div>
        </div>
      </div>

      <WizardActions
        backHref="/"
        backLabel="Back to home"
        primaryLabel="Continue"
        onPrimary={() => onNavigate(2)}
        primaryDisabled={!isComplete}
        hint="Add a photo, product name, and description to continue"
      />
    </div>
  );
}
