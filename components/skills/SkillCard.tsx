import Link from 'next/link';
import type { Skill } from '@/types';
import { sanitizeUserContent } from '@/lib/guardrails';

interface SkillCardProps {
  skill: Skill;
}

export function SkillCard({ skill }: SkillCardProps) {
  return (
    <Link
      href={`/skills/${skill.slug}`}
      className="group relative block p-6 rounded-xl border border-border bg-card hover:border-terminal/50 transition-all duration-300 overflow-hidden"
    >
      {/* Hover glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-terminal/0 via-terminal/0 to-terminal/0 group-hover:from-terminal/5 group-hover:via-transparent group-hover:to-accent/5 transition-all duration-300" />

      {/* Top gradient line on hover */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-terminal/0 to-transparent group-hover:via-terminal transition-all duration-300" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            {/* Rank badge */}
            {skill.rank && skill.rank <= 20 && (
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-terminal/15 text-terminal border border-terminal/30">
                #{skill.rank}
              </span>
            )}
            <span className="text-terminal font-mono text-sm opacity-50 group-hover:opacity-100 transition-opacity">
              /
            </span>
            <h3 className="font-semibold text-card-foreground group-hover:text-terminal transition-colors line-clamp-1">
              {skill.name}
            </h3>
            {/* Hot badge */}
            {skill.isHot && (
              <span className="text-orange-500 text-sm" title="Trending">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 23c-4.97 0-9-3.58-9-8 0-2.52.74-4.6 2.06-6.42.47-.65 1-1.26 1.58-1.82.25-.25.67-.08.68.28l.09 2.52c.01.32.42.47.62.22l3.59-4.53c.23-.29.64-.28.86.02 1.53 2.05 3.55 5.01 4.1 8.02.06.32.42.48.67.25.48-.44.89-.94 1.2-1.45.2-.33.66-.34.81.02C20.37 14.63 21 16.73 21 19c0 2.21-4.03 4-9 4z" />
                </svg>
              </span>
            )}
          </div>
          {skill.stars !== undefined && skill.stars > 0 && (
            <div className="flex items-center gap-1 text-sm text-muted shrink-0">
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
              <span className="font-mono">{skill.stars.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-muted line-clamp-2 mb-4 group-hover:text-muted-foreground transition-colors">
          {sanitizeUserContent(skill.description)}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="text-xs px-2 py-1 rounded-md bg-secondary/80 text-secondary-foreground font-mono border border-border/50">
            {skill.category}
          </span>
          <span className="text-xs text-muted font-mono flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {skill.author}
          </span>
        </div>

        {/* Featured badge */}
        {skill.featured && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <span className="inline-flex items-center gap-1.5 text-xs text-terminal font-medium font-mono">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-3.5 h-3.5"
              >
                <path
                  fillRule="evenodd"
                  d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
                  clipRule="evenodd"
                />
              </svg>
              featured
            </span>
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
