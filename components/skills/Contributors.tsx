interface ContributorsProps {
  topContributors?: { login: string; avatarUrl: string; contributions: number }[];
  contributorsCount?: number;
}

export function Contributors({ topContributors, contributorsCount }: ContributorsProps) {
  if (!topContributors || topContributors.length === 0) return null;

  const remaining = (contributorsCount || topContributors.length) - topContributors.length;

  return (
    <div className="flex items-center gap-3">
      <div className="flex -space-x-2">
        {topContributors.map((contributor) => (
          <a
            key={contributor.login}
            href={`https://github.com/${contributor.login}`}
            target="_blank"
            rel="noopener noreferrer"
            title={`${contributor.login} (${contributor.contributions} contributions)`}
            className="relative hover:z-10 transition-transform hover:scale-110"
          >
            <img
              src={contributor.avatarUrl}
              alt={contributor.login}
              width={32}
              height={32}
              className="w-8 h-8 rounded-full border-2 border-card bg-secondary"
              loading="lazy"
            />
          </a>
        ))}
      </div>
      {remaining > 0 && (
        <span className="text-xs text-muted font-mono">
          +{remaining} more
        </span>
      )}
    </div>
  );
}
