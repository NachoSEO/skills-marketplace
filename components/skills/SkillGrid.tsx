import type { Skill } from '@/types';
import { SkillCard } from './SkillCard';

interface SkillGridProps {
  skills: Skill[];
  emptyMessage?: string;
}

export function SkillGrid({ skills, emptyMessage = 'No skills found' }: SkillGridProps) {
  if (skills.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted">{emptyMessage}</p>
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
