import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeroSection } from '@/components/landing/hero-section';
import { RecentProjects } from '@/components/landing/recent-projects';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      <SiteHeader
        action={
          <Button asChild variant="cta" size="sm">
            <Link href="/create">
              Create New Video
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        }
      />
      <HeroSection />
      <RecentProjects />
      <SiteFooter />
    </main>
  );
}
