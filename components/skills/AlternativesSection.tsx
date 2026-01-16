import type { Skill } from '@/types';
import { AlternativeCard } from './AlternativeCard';

interface AlternativesSectionProps {
  alternatives: Skill[];
  currentSkillName: string;
}

export function AlternativesSection({ alternatives, currentSkillName }: AlternativesSectionProps) {
  if (alternatives.length === 0) {
    return null;
  }

  return (
    <div className="mt-16 pt-16 border-t border-border">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <svg
            className="w-5 h-5 text-accent"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
            />
          </svg>
          <h2 className="text-2xl font-bold">
            Alternatives to {currentSkillName}
          </h2>
        </div>
        <p className="text-sm text-muted">
          Other skills that solve similar problems. Compare features and choose the best fit for your workflow.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {alternatives.map((skill) => (
          <AlternativeCard
            key={skill.id}
            skill={skill}
            currentSkillName={currentSkillName}
          />
        ))}
      </div>
    </div>
  );
}
