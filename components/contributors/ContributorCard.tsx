import Link from 'next/link';
import Image from 'next/image';

interface ContributorCardProps {
  author: string;
  skillCount: number;
  totalStars: number;
  topLanguages: string[];
  rank?: number;
  score?: number;
}

export function ContributorCard({ author, skillCount, totalStars, topLanguages, rank, score }: ContributorCardProps) {
  return (
    <Link
      href={`/contributors/${author}`}
      className="group relative block p-6 rounded-xl border border-border bg-card hover:border-terminal/50 transition-all duration-300 overflow-hidden"
    >
      {/* Hover glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-terminal/0 via-terminal/0 to-terminal/0 group-hover:from-terminal/5 group-hover:via-transparent group-hover:to-accent/5 transition-all duration-300" />

      {/* Top gradient line on hover */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-terminal/0 to-transparent group-hover:via-terminal transition-all duration-300" />

      {/* Rank badge */}
      {rank && (
        <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-terminal/10 border border-terminal/30 flex items-center justify-center">
          <span className="text-xs font-bold text-terminal font-mono">#{rank}</span>
        </div>
      )}

      <div className="relative">
        {/* Header with avatar */}
        <div className="flex items-center gap-4 mb-4">
          <Image
            src={`https://github.com/${author}.png`}
            alt={author}
            width={48}
            height={48}
            className="rounded-full ring-2 ring-border group-hover:ring-terminal/50 transition-all"
          />
          <div>
            <h3 className="font-semibold text-card-foreground group-hover:text-terminal transition-colors">
              {author}
            </h3>
            {score !== undefined && (
              <p className="text-xs text-muted font-mono">
                Score: {score.toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1.5 text-sm text-muted">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            </svg>
            <span className="font-mono">{skillCount} {skillCount === 1 ? 'skill' : 'skills'}</span>
          </div>
          {totalStars > 0 && (
            <div className="flex items-center gap-1 text-sm text-muted">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4 text-yellow-500"
              >
                <path
                  fillRule="evenodd"
                  d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-mono">{totalStars.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Languages */}
        {topLanguages.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {topLanguages.slice(0, 3).map((language) => (
              <span
                key={language}
                className="text-xs px-2 py-0.5 rounded-md bg-secondary/80 text-secondary-foreground font-mono border border-border/50"
              >
                {language}
              </span>
            ))}
            {topLanguages.length > 3 && (
              <span className="text-xs px-2 py-0.5 rounded-md bg-secondary/50 text-muted font-mono">
                +{topLanguages.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Arrow indicator on hover */}
        <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
          <svg className="w-5 h-5 text-terminal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
