# Production Readiness Analysis: Lumina Studio

## Executive Summary

Lumina Studio is a Next.js video generation wizard currently in **demo/prototype stage**. The application uses mock data throughout and has **no fallback mechanisms** for external asset failures. The codebase is **not a Git repository** and requires GitHub setup. Three critical areas need improvement for reliable demos: (1) external URL dependencies have no fallbacks, (2) error handling is inconsistent across components, and (3) no offline/local asset strategy exists.

---

## 1. External Dependencies

### 1.1 Image Assets (Pexels)

**Source:** `lib/wizard/mock-data.ts:12`

All keyframe images and library thumbnails come from Pexels CDN:

```typescript
const img = (id: string) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&h=650&w=940`;
```

**Affected Components:**
- `step-keyframes.tsx` - 4 keyframe images per session
- `step-generate.tsx` - Video poster images
- `step-result.tsx` - Video poster images
- `library-card.tsx` - Library thumbnails
- `recent-projects.tsx` - Landing page project cards

**Image IDs in use:**
| Context | Pexels ID | Location |
|---------|-----------|----------|
| HERO_IMAGE | 4041231 | mock-data.ts:15 |
| HERO_POSTER | 2949157 | mock-data.ts:16 |
| KEYFRAME_POOL[0-7] | 2949157, 13232449, 27357173, 8100774, 9775170, 3762405, 38169306, 6682948 | mock-data.ts:22-29 |
| RECENT_PROJECTS | 4889718, 7364096, 7038196 | mock-data.ts:112-132 |
| LIBRARY_ITEMS | 850801, 3762405, 7321509, 7256096, 10448594, 20419734 | mock-data.ts:136-172 |

**Risk:** 22 unique Pexels URLs. If Pexels CDN is unavailable or images are removed, the demo will show broken images throughout the wizard flow.

### 1.2 Video Assets (Google Cloud Storage)

**Source:** `lib/wizard/mock-data.ts:19`

```typescript
export const SAMPLE_VIDEO_URL =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
```

**Affected Components:**
- `step-generate.tsx:181` - VideoPlayerCard video source
- `step-result.tsx:72` - Result video player

**Risk:** Single point of failure. This is a Google test video that could be removed or rate-limited. All generated "videos" use this same URL.

### 1.3 Summary: External URL Count

| Asset Type | Count | Source Domain |
|------------|-------|---------------|
| Pexels images | 22 unique URLs | images.pexels.com |
| Sample video | 1 URL | commondatastorage.googleapis.com |
| **Total external URLs** | **23** | - |

---

## 2. Mock Data Reliability Analysis

### 2.1 Script Generation

**File:** `components/wizard/steps/step-script-review.tsx`

**Mechanism:**
1. On mount, if `script` is null, starts 800ms timeout
2. Calls `buildMockScript(product, regenerateVariant)` after delay
3. Stores result in Zustand via `setScript()`

**Code path (lines 107-115):**
```typescript
useEffect(() => {
  if (!script) {
    const timer = setTimeout(() => {
      const generatedScript = buildMockScript(product, regenerateVariant);
      setScript(generatedScript);
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }
}, [script, product, setScript, regenerateVariant]);
```

**Fallback status:** None. If `buildMockScript` throws or returns malformed data, the step shows loading skeleton forever. However, `buildMockScript` is deterministic and has no external dependencies—it uses template strings with product data.

**Reliability:** Script generation is reliable because it's purely local string manipulation with no external calls.

### 2.2 Keyframe Image Generation

**File:** `components/wizard/steps/step-keyframes.tsx`

**Mechanism:**
1. On mount, if `keyframes.length === 0`, starts 900ms timeout
2. Calls `buildMockKeyframes(product.imageUrl)` which returns 4 keyframe objects with Pexels URLs
3. Stores in Zustand via `setKeyframes()`

**Code path (lines 97-107):**
```typescript
useEffect(() => {
  if (keyframes.length === 0) {
    const timer = setTimeout(() => {
      const generatedKeyframes = buildMockKeyframes(product.imageUrl);
      setKeyframes(generatedKeyframes);
      setIsLoading(false);
    }, 900);
    return () => clearTimeout(timer);
  }
}, [keyframes.length, product.imageUrl, setKeyframes]);
```

**Fallback status:** None. If Pexels URLs fail to load, images show broken/alt text.

**Individual keyframe regeneration (lines 109-119):**
```typescript
const handleRegenerate = async (id: string) => {
  setRegeneratingId(id);
  await new Promise((resolve) => setTimeout(resolve, 700));
  const currentUrls = keyframes.map((k) => k.imageUrl);
  const newImageUrl = pickAlternateKeyframeImage(currentUrls);
  replaceKeyframeImage(id, newImageUrl);
  setRegeneratingId(null);
};
```

`pickAlternateKeyframeImage` cycles through `KEYFRAME_POOL` but all URLs are still Pexels. No local fallback.

**Reliability:** Single point of failure on Pexels availability.

### 2.3 Video Generation

**File:** `components/wizard/steps/step-generate.tsx`

**Mechanism:**
1. On mount, if `generatedVideos.length === 0`, starts 3500ms timeout
2. Calls `buildMockVideos()` which creates 2 video objects with `SAMPLE_VIDEO_URL`
3. Stores in Zustand via `setGeneratedVideos()`

**Code path (lines 150-164):**
```typescript
useEffect(() => {
  if (generatedVideos.length === 0 && keyframes.length > 0) {
    const timer = setTimeout(() => {
      const selectedKeyframes = keyframes.filter((k) =>
        selectedKeyframeIds.includes(k.id)
      );
      const videos = buildMockVideos(selectedKeyframes, product, script!);
      setGeneratedVideos(videos);
      setIsGenerating(false);
    }, 3500);
    return () => clearTimeout(timer);
  }
}, [...]);
```

**Fallback status:** None. If the Google Storage video URL fails, the video player shows an error or blank.

**Reliability:** Single point of failure on Google Cloud Storage availability.

---

## 3. Error Handling Analysis

### 3.1 Image Error Handling

**Product Image (Step 1):** `components/wizard/steps/product-image-field.tsx:94`

```typescript
<img
  src={imageUrl}
  alt="Your product"
  onError={() => setPreviewFailed(true)}
  className="..."
/>
```

**Status:** Has fallback UI. Shows "This image could not be loaded. Try another photo or link." message when user-provided image fails.

**Keyframe Images (Step 3):** `components/wizard/steps/step-keyframes.tsx`

**Status:** No error handling. The `KeyframeCard` component renders `<img>` without `onError` handler. Pexels failures will show broken image icon.

**Library Thumbnails:** `components/shared/library-card.tsx`

**Status:** No error handling. `<img>` element has no `onError` handler.

**Video Poster Images:** `step-generate.tsx`, `step-result.tsx`

**Status:** No error handling. Video poster images from Pexels can fail silently.

### 3.2 Video Error Handling

**Video Players (Steps 4 & 5):** `step-generate.tsx:32-43`, `step-result.tsx:69-76`

```typescript
<video
  src={video.videoUrl}
  poster={video.posterUrl}
  controls
  playsInline
  className="h-full w-full object-cover"
/>
```

**Status:** No error handling. If video fails to load, browser shows native error. No fallback video or error message.

### 3.3 State Corruption Handling

**File:** `lib/wizard/store.ts`

**Mechanism:** Zustand with `persist` middleware using `localStorage`.

**Code (lines 55-70):**
```typescript
export const useWizardStore = create<WizardState>()(
  persist(
    (set) => ({
      currentStep: 1,
      product: EMPTY_PRODUCT,
      script: null,
      keyframes: [],
      selectedKeyframeIds: [],
      generatedVideos: [],
      // ... actions
    }),
    {
      name: 'lumina-studio-wizard',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentStep: state.currentStep,
        product: state.product,
        script: state.script,
        keyframes: state.keyframes,
        selectedKeyframeIds: state.selectedKeyframeIds,
        generatedVideos: state.generatedVideos,
      }),
    },
  ),
);
```

**Issues:**
1. No validation on hydration—if localStorage contains malformed JSON, app may crash
2. No version migration strategy—if state shape changes, old state may cause errors
3. `script!` assertion in `step-generate.tsx:158` assumes script exists, but could be null

**Step navigation guard:** `wizard-shell.tsx:22-30` has `getFurthestValidStep()` that prevents jumping ahead, but doesn't recover from corrupted state.

### 3.4 Uncaught Promise Rejections

**Found issues:**

1. `step-generate.tsx:174-178` - `handleDownload` doesn't catch errors:
   ```typescript
   const handleDownload = async (video: GeneratedVideo) => {
     const link = document.createElement('a');
     link.href = video.videoUrl;
     link.download = `${video.title}.mp4`;
     link.click(); // No error handling if URL is invalid
   };
   ```

2. `step-keyframes.tsx:109-119` - `handleRegenerate` uses `await` but no try-catch:
   ```typescript
   const handleRegenerate = async (id: string) => {
     setRegeneratingId(id);
     await new Promise((resolve) => setTimeout(resolve, 700)); // Safe
     const newImageUrl = pickAlternateKeyframeImage(currentUrls); // Could throw?
     // ...
   };
   ```

3. `step-script-review.tsx:99-106` - `handleRegenerate` has no try-catch:
   ```typescript
   const handleRegenerate = async () => {
     setIsRegenerating(true);
     await new Promise((resolve) => setTimeout(resolve, 600));
     const newScript = buildMockScript(product, nextVariant);
     setScript(newScript);
     setIsRegenerating(false);
   };
   ```

### 3.5 Error Boundaries

**File:** `app/layout.tsx`

**Status:** No error boundary component wrapping the app. Unhandled React errors will crash the entire application.

---

## 4. Demo Flow Reliability

### 4.1 Offline Capability Assessment

**Current state:** The application requires internet connectivity for:
- All Pexels images (22 URLs)
- Sample video (1 URL)

**Scenario: User loses internet during demo:**
1. Landing page: Recent projects show broken images
2. Step 1: If user uploads local file (converted to data URL), works offline
3. Step 2: Script generation works (pure local computation)
4. Step 3: Keyframe images fail to load, no visual fallback
5. Step 4: Video fails to play, no fallback
6. Step 5: Video library thumbnails fail, video fails to play

**Result:** Demo is not usable offline.

### 4.2 Asset Caching

**Current caching strategy:** None implemented. The app relies on browser HTTP caching for external URLs.

**Next.js caching:** No `next/image` optimization is used—all images are external `<img>` tags, not `<Image>` components.

---

## 5. Gap Summary and Priority Ranking

### Priority 1: Critical (Demo Breakers)

| Gap | Impact | Effort |
|-----|--------|--------|
| No fallback video asset | Step 4 & 5 unusable if Google Storage fails | Low |
| No fallback keyframe images | Step 3 shows broken images | Medium |
| No error boundary | Any unhandled error crashes entire app | Low |

### Priority 2: High (Demo Quality)

| Gap | Impact | Effort |
|-----|--------|--------|
| No video error handling | Confusing UX when video fails | Low |
| No keyframe image error handling | Broken image icons | Low |
| No local asset strategy | Requires internet for demo | Medium |

### Priority 3: Medium (Robustness)

| Gap | Impact | Effort |
|-----|--------|--------|
| Zustand state validation | Potential crashes on malformed localStorage | Low |
| No version migration for persisted state | Future breaking changes | Medium |
| Unhandled promise rejections | Potential silent failures | Low |

### Priority 4: Low (Nice to Have)

| Gap | Impact | Effort |
|-----|--------|--------|
| No offline PWA support | Cannot demo without internet | High |
| No `next/image` optimization | Slower loads, no responsive images | Medium |

---

## 6. Recommended Fallback Strategy

### 6.1 Script Fallback

**Current reliability:** High (no external dependencies)

**Recommendation:** No fallback needed. Consider adding a hardcoded backup script template in case `buildMockScript` throws:

```typescript
// lib/wizard/fallback-data.ts
export const FALLBACK_SCRIPT: VideoScript = {
  hook: "Stop scrolling. This is the moment your routine has been waiting for.",
  body: "Show the texture in a beautiful close-up. Highlight the lightweight finish and visible glow.",
  cta: "Tap the link in bio to shop before it sells out.",
  voiceover: "Your skin deserves this moment. Treat yourself today.",
  seedancePrompt: "Vertical 9:16 beauty video, soft natural light, elegant pacing.",
  caption: "Your new favorite glow ritual is here.",
  hashtags: "#skincare #beauty #glowup",
};
```

### 6.2 Keyframe Image Fallback

**Recommended approach:** Store 4-8 local fallback images in `public/fallbacks/keyframes/`

**Implementation:**
1. Create `lib/wizard/fallback-data.ts` with local URLs:
   ```typescript
   export const FALLBACK_KEYFRAMES: Keyframe[] = [
     { id: 'kf-hero-close-up', label: 'Hero Close-up', imageUrl: '/fallbacks/keyframes/hero.jpg' },
     { id: 'kf-lifestyle', label: 'Lifestyle', imageUrl: '/fallbacks/keyframes/lifestyle.jpg' },
     { id: 'kf-dynamic-shot', label: 'Dynamic Shot', imageUrl: '/fallbacks/keyframes/dynamic.jpg' },
     { id: 'kf-end-frame', label: 'End Frame', imageUrl: '/fallbacks/keyframes/end.jpg' },
   ];
   ```

2. Modify `step-keyframes.tsx` to use `onError` fallback:
   ```typescript
   const handleImageError = (id: string) => {
     const fallback = FALLBACK_KEYFRAMES.find(k => k.id === id);
     if (fallback) replaceKeyframeImage(id, fallback.imageUrl);
   };
   ```

3. Add `onError` to `<img>` in `KeyframeCard`

### 6.3 Video Fallback

**Recommended approach:** Include a sample video in `public/fallbacks/sample-video.mp4`

**Implementation:**
1. Download a short (~10s) royalty-free beauty/fashion video clip
2. Place at `public/fallbacks/sample-video.mp4`
3. Create fallback constant:
   ```typescript
   export const FALLBACK_VIDEO_URL = '/fallbacks/sample-video.mp4';
   ```
4. Add error handling to video elements:
   ```typescript
   <video
     src={video.videoUrl}
     onError={(e) => { e.currentTarget.src = FALLBACK_VIDEO_URL; }}
     ...
   />
   ```

### 6.4 Library Thumbnail Fallback

**Recommended approach:** Use a generic placeholder image for library cards

**Implementation:**
```typescript
// In library-card.tsx
<img
  src={item.thumbnailUrl}
  alt={item.title}
  onError={(e) => { e.currentTarget.src = '/fallbacks/library-placeholder.jpg'; }}
  ...
/>
```

---

## 7. Implementation Priorities

### Phase 1: Critical Fixes (1-2 hours)

1. Add error boundary component at root layout
2. Add local fallback video (`public/fallbacks/sample-video.mp4`)
3. Add video error handling in `step-generate.tsx` and `step-result.tsx`

### Phase 2: Image Fallbacks (2-4 hours)

1. Create local fallback images for keyframes
2. Add `onError` handlers to all `<img>` elements
3. Add generic library placeholder image

### Phase 3: State Resilience (1-2 hours)

1. Add validation to Zustand hydration
2. Add version field to persisted state
3. Wrap async handlers in try-catch

### Phase 4: GitHub Setup (30 minutes)

1. Initialize git repository
2. Create `.gitignore` (already exists)
3. Create `README.md`
4. Make initial commit
5. Create GitHub repository and push

---

## 8. Files to Modify

| File | Changes |
|------|---------|
| `lib/wizard/fallback-data.ts` | **Create** - Local fallback assets |
| `lib/wizard/mock-data.ts` | Import and use fallback data |
| `components/wizard/steps/step-keyframes.tsx` | Add `onError` handler to images |
| `components/wizard/steps/step-generate.tsx` | Add video error handling |
| `components/wizard/steps/step-result.tsx` | Add video error handling |
| `components/shared/library-card.tsx` | Add image error handling |
| `lib/wizard/store.ts` | Add hydration validation |
| `app/layout.tsx` | Add error boundary |
| `app/error.tsx` | **Create** - Error boundary component |
| `public/fallbacks/` | **Create** - Local asset directory |

---

## 9. Current Stage Assessment

Based on the original spec and current implementation:

**Completion Status: ~85%**

**Completed:**
- All 5 wizard steps functional
- Design system fully implemented
- State management with Zustand persistence
- Smooth animations with Framer Motion
- All UI components (shadcn/ui)
- Platform/style presets
- Responsive design
- Mock data for all stages

**Missing vs. Spec:**
- No fallback assets for demo reliability
- No error boundaries
- No README.md
- Not a Git repository

**Additional Notes:**
- Bolt.new artifacts may be present (check for `.bolt/` directory or bolt-related comments)
- The spec mentions "no authentication, no database, no real backend calls"—correctly implemented
- All `// TODO: BACKEND` comments are in place for future BytePlus integration

---

## 10. Conclusion

Lumina Studio is a well-architected demo application that needs reliability hardening before production demos. The primary risks are external URL dependencies (Pexels images and Google Storage video) that have no fallbacks. Implementing local fallback assets and error handling will ensure demos work reliably regardless of network conditions or external service availability.
