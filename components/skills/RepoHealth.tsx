import type { Skill } from '@/types';

interface RepoHealthProps {
  skill: Skill;
}

function getActivityStatus(lastCommitDate?: string): { label: string; color: string } {
  if (!lastCommitDate) return { label: 'Unknown', color: 'bg-muted' };

  const daysSince = Math.floor(
    (Date.now() - new Date(lastCommitDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSince <= 30) return { label: 'Active', color: 'bg-green-500' };
  if (daysSince <= 90) return { label: 'Maintained', color: 'bg-yellow-500' };
  if (daysSince <= 180) return { label: 'Slow', color: 'bg-orange-500' };
  return { label: 'Inactive', color: 'bg-red-500' };
}

export function RepoHealth({ skill }: RepoHealthProps) {
  const activity = getActivityStatus(skill.lastCommitDate);

  const badges = [
    {
      label: activity.label,
      icon: (
        <span className={`w-2 h-2 rounded-full ${activity.color} inline-block`} />
      ),
    },
  ];

  if (skill.openIssuesCount !== undefined) {
    badges.push({
      label: `${skill.openIssuesCount} issues`,
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" strokeWidth="2" />
          <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" />
          <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" />
        </svg>
      ),
    });
  }

  if (skill.hasWiki) {
    badges.push({
      label: 'Wiki',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    });
  }

  if (skill.hasDiscussions) {
    badges.push({
      label: 'Discussions',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
        </svg>
      ),
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary/80 text-xs text-muted border border-border/50 font-mono"
        >
          {badge.icon}
          {badge.label}
        </span>
      ))}
    </div>
  );
}
