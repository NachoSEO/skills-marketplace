import type { Metadata } from 'next';
import { SkillsPageClient } from '@/components/skills/SkillsPageClient';
import { getSkillsSync } from '@/lib/skills';

const BASE_URL = 'https://skillsforge.dev';

export function generateMetadata(): Metadata {
  const skills = getSkillsSync();
  return {
    title: 'Browse All Skills',
    description: `Discover ${skills.length}+ Claude Code skills. Search by category, language, or use case.`,
    alternates: { canonical: '/skills' },
    openGraph: {
      title: 'Browse Claude Code Skills | SkillsForge',
      description: `Discover ${skills.length}+ Claude Code skills. Search by category, language, or use case.`,
      type: 'website',
      url: `${BASE_URL}/skills`,
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Browse Claude Code Skills | SkillsForge',
      description: `Discover ${skills.length}+ Claude Code skills. Search by category, language, or use case.`,
    },
  };
}

export default function SkillsPage() {
  return <SkillsPageClient />;
}
