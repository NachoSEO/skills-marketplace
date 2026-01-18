import type { Metadata } from 'next';
import Link from 'next/link';
import { getSkillsSync, getContributorsWithStats } from '@/lib/skills';
import { ContributorCard } from '@/components/contributors/ContributorCard';

export const metadata: Metadata = {
  title: 'Top Contributors',
  description: 'Discover the top 25 contributors to Claude Code skills, ranked by combined score of stars and skill count.',
  alternates: {
    canonical: '/contributors',
  },
};

export default function ContributorsPage() {
  const skills = getSkillsSync();
  const contributors = getContributorsWithStats(skills);

  // Score = total stars + number of skills, limited to top 25
  const topContributors = [...contributors]
    .map((c) => ({ ...c, score: c.totalStars + c.skillCount }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 25);

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-2 text-sm text-muted mb-8">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-foreground">Contributors</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Top Contributors</h1>
          <p className="text-lg text-muted">
            Top 25 contributors ranked by combined score (stars + skills)
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {topContributors.map((contributor, index) => (
            <ContributorCard
              key={contributor.author}
              author={contributor.author}
              skillCount={contributor.skillCount}
              totalStars={contributor.totalStars}
              topLanguages={contributor.languages}
              rank={index + 1}
              score={contributor.score}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
