import type { Metadata } from 'next';
import Link from 'next/link';
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd';
import { getComparePairs, getSkillsSync, getSkillBySlug } from '@/lib/skills';

const BASE_URL = 'https://skillsforge.dev';

export const metadata: Metadata = {
  title: 'Compare Claude Code Skills',
  description: 'Side-by-side comparisons of Claude Code skills — features, stars, use cases, pros and cons to help you choose the right tool.',
  alternates: { canonical: '/compare' },
  openGraph: {
    title: 'Compare Claude Code Skills | SkillsForge',
    description: 'Side-by-side comparisons of Claude Code skills — features, stars, use cases, pros and cons to help you choose the right tool.',
    type: 'website',
    url: `${BASE_URL}/compare`,
  },
};

export default function CompareIndexPage() {
  const pairs = getComparePairs();
  const skills = getSkillsSync();

  const breadcrumbItems = [
    { name: 'Home', url: BASE_URL },
    { name: 'Compare', url: `${BASE_URL}/compare` },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />

      <div className="min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted mb-8">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-foreground">Compare</span>
          </nav>

          {/* Header */}
          <div className="mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">Compare Skills</h1>
            <p className="text-lg text-muted max-w-2xl">
              Not sure which skill to use? Compare them side by side — features, community adoption, pros and cons.
            </p>
          </div>

          {/* Comparison cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pairs.map((pair) => {
              const skillA = getSkillBySlug(skills, pair.slugA);
              const skillB = getSkillBySlug(skills, pair.slugB);
              if (!skillA || !skillB) return null;
              const compSlug = `${pair.slugA}-vs-${pair.slugB}`;

              return (
                <Link
                  key={compSlug}
                  href={`/compare/${compSlug}`}
                  className="group p-6 rounded-xl border border-border bg-card hover:border-terminal/50 transition-all"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-sm font-semibold group-hover:text-terminal transition-colors line-clamp-1">
                      {skillA.name}
                    </span>
                    <span className="text-xs text-muted font-mono shrink-0">vs</span>
                    <span className="text-sm font-semibold group-hover:text-terminal transition-colors line-clamp-1">
                      {skillB.name}
                    </span>
                  </div>
                  <p className="text-xs text-muted mb-4 line-clamp-2">{pair.reason}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-muted font-mono">
                      <span>★ {skillA.stars?.toLocaleString() || '—'}</span>
                      <span className="text-border">|</span>
                      <span>★ {skillB.stars?.toLocaleString() || '—'}</span>
                    </div>
                    <svg className="w-4 h-4 text-muted group-hover:text-terminal transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
