import Link from 'next/link';
import type { Skill } from '@/types';
import { SkillCard } from './SkillCard';

interface SkillGridProps {
  skills: Skill[];
  emptyMessage?: string;
}

export function SkillGrid({ skills, emptyMessage = 'No skills found' }: SkillGridProps) {
  if (skills.length === 0) {
    return (
      <div className="text-center py-16 px-6 rounded-xl border border-dashed border-border bg-card/50">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted/10 border border-border mb-4">
          <svg className="w-6 h-6 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <p className="text-muted font-medium mb-2">{emptyMessage}</p>
        <p className="text-sm text-muted/70 mb-6">Try browsing all available skills instead</p>
        <Link
          href="/skills"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-terminal/10 border border-terminal/20 text-terminal text-sm font-mono hover:bg-terminal/20 transition-colors"
        >
          Browse all skills
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {skills.map((skill) => (
        <SkillCard key={skill.id} skill={skill} />
      ))}
    </div>
  );
}
