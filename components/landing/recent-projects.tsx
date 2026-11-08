'use client';

import { motion } from 'framer-motion';
import { LibraryCard } from '@/components/shared/library-card';
import { RECENT_PROJECTS } from '@/lib/wizard/mock-data';

export function RecentProjects() {
  return (
    <section id="recent" className="mx-auto max-w-7xl scroll-mt-24 px-6 py-24 lg:px-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mb-12 flex flex-col gap-3 md:flex-row md:items-end md:justify-between"
      >
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold-600">Recent projects</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink-900 md:text-4xl">
            Fresh from the studio
          </h2>
        </div>
        <p className="max-w-sm text-sm leading-relaxed text-ink-500">
          Launches made with Lumina Studio this month, ready to post across every feed.
        </p>
      </motion.div>

      <div className="grid gap-8 md:grid-cols-3">
        {RECENT_PROJECTS.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            <LibraryCard item={item} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
