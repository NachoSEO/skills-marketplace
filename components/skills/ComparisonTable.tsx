import Link from 'next/link';
import type { Skill } from '@/types';

interface ComparisonTableProps {
  currentSkill: Skill;
  alternatives: Skill[];
}

function getActivityLabel(updatedAt?: string): string {
  if (!updatedAt) return 'Unknown';
  const days = Math.floor((Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 7) return 'This week';
  if (days <= 30) return 'This month';
  if (days <= 90) return 'Recently';
  if (days <= 365) return 'This year';
  return 'Over a year';
}

function getHealthDots(skill: Skill): number {
  let score = 0;
  if (skill.readmeContent) score++;
  if (skill.license) score++;
  if (skill.codeSignals?.hasTests) score++;
  if (skill.codeSignals?.hasCI) score++;
  if (skill.lastCommitDate) {
    const days = (Date.now() - new Date(skill.lastCommitDate).getTime()) / (1000 * 60 * 60 * 24);
    if (days <= 90) score++;
  }
  return score;
}

export function ComparisonTable({ currentSkill, alternatives }: ComparisonTableProps) {
  if (alternatives.length === 0) return null;

  const allSkills = [currentSkill, ...alternatives];

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-secondary/50">
            <th className="text-left px-4 py-3 font-medium text-muted">Skill</th>
            <th className="text-right px-4 py-3 font-medium text-muted">Stars</th>
            <th className="text-left px-4 py-3 font-medium text-muted">Language</th>
            <th className="text-left px-4 py-3 font-medium text-muted">Updated</th>
            <th className="text-center px-4 py-3 font-medium text-muted">Health</th>
          </tr>
        </thead>
        <tbody>
          {allSkills.map((skill, i) => {
            const isCurrent = skill.id === currentSkill.id;
            const health = getHealthDots(skill);
            return (
              <tr
                key={skill.id}
                className={`border-b border-border/50 last:border-0 ${
                  isCurrent ? 'bg-terminal/5' : 'hover:bg-secondary/30'
                }`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {isCurrent ? (
                      <span className="font-medium text-terminal">{skill.name}</span>
                    ) : (
                      <Link
                        href={`/skills/${skill.slug}`}
                        className="font-medium hover:text-terminal transition-colors"
                      >
                        {skill.name}
                      </Link>
                    )}
                    {isCurrent && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-terminal/20 text-terminal font-mono">
                        current
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted mt-0.5">{skill.author}</div>
                </td>
                <td className="px-4 py-3 text-right font-mono">
                  {skill.stars?.toLocaleString() || '0'}
                </td>
                <td className="px-4 py-3 text-muted">{skill.language || '-'}</td>
                <td className="px-4 py-3 text-muted">{getActivityLabel(skill.updatedAt)}</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((dot) => (
                      <span
                        key={dot}
                        className={`w-1.5 h-1.5 rounded-full ${
                          dot <= health ? 'bg-terminal' : 'bg-border'
                        }`}
                      />
                    ))}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
