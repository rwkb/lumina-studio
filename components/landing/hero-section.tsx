'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Play, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HERO_IMAGE, HERO_POSTER } from '@/lib/wizard/mock-data';

const VALUE_POINTS = ['Script written in seconds', 'You approve every keyframe', 'Ready for every feed'];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blush-100 via-background to-gold-100">
      <div className="pointer-events-none absolute -left-24 top-16 h-96 w-96 rounded-full bg-blush-300/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 right-0 h-[28rem] w-[28rem] rounded-full bg-gold-200/60 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-6 py-20 lg:grid-cols-2 lg:gap-12 lg:px-10 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-blush-300 bg-white/70 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-ink-700 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-gold-500" />
            AI video studio for beauty and fashion
          </span>

          <h1 className="mt-6 text-5xl font-semibold leading-[1.1] tracking-tight text-ink-900 md:text-6xl">
            Turn one product photo into a video worth stopping for.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-500">
            Lumina Studio writes the hook, storyboards the keyframes, and renders
            platform-ready short videos for TikTok, Reels, and Shorts, so every
            launch looks like a campaign.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-5">
            <Button asChild variant="cta" size="xl" className="group">
              <Link href="/create">
                Create New Video
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
            <a
              href="#recent"
              className="text-sm font-medium text-ink-700 underline-offset-4 transition-colors hover:text-ink-900 hover:underline"
            >
              See recent projects
            </a>
          </div>

          <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3">
            {VALUE_POINTS.map((point) => (
              <li key={point} className="flex items-center gap-2 text-sm text-ink-700">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sage-100">
                  <Check className="h-3 w-3 text-sage-700" strokeWidth={3} />
                </span>
                {point}
              </li>
            ))}
          </ul>
        </motion.div>

        <ProductToVideoVisual />
      </div>
    </section>
  );
}

function ProductToVideoVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto h-[480px] w-full max-w-md sm:h-[560px]"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute left-0 top-10 w-[60%] -rotate-3 rounded-3xl border border-white bg-white p-2.5 shadow-lift"
      >
        <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-muted">
          <img src={HERO_IMAGE} alt="Product photo" className="h-full w-full object-cover" />
        </div>
        <p className="px-1 pb-1 pt-3 text-xs font-medium uppercase tracking-wider text-ink-500">
          Product photo
        </p>
      </motion.div>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-0 right-0 w-[62%] rotate-2 rounded-3xl border border-white bg-white p-2.5 shadow-lift"
      >
        <div className="relative aspect-[9/16] overflow-hidden rounded-2xl bg-ink-900">
          <img src={HERO_POSTER} alt="Generated video frame" className="h-full w-full object-cover opacity-90" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-ink-900 shadow-lift backdrop-blur">
              <Play className="ml-1 h-5 w-5 fill-ink-900" />
            </span>
          </div>
          <div className="absolute inset-x-4 bottom-4">
            <div className="h-1 w-full overflow-hidden rounded-full bg-white/30">
              <motion.div
                className="h-full rounded-full bg-gold-300"
                initial={{ width: '0%' }}
                animate={{ width: '70%' }}
                transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
              />
            </div>
          </div>
        </div>
        <p className="px-1 pb-1 pt-3 text-xs font-medium uppercase tracking-wider text-ink-500">
          9:16 video, ready to post
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.1, duration: 0.6, ease: 'backOut' }}
        className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gold-400 text-ink-900 shadow-glow"
      >
        <Sparkles className="h-6 w-6" />
      </motion.div>
    </motion.div>
  );
}
