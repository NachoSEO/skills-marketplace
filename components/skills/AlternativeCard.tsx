import Link from 'next/link';
import type { Skill } from '@/types';

interface AlternativeCardProps {
  skill: Skill;
  currentSkillName: string;
}

export function AlternativeCard({ skill, currentSkillName }: AlternativeCardProps) {
  return (
    <Link
      href={`/skills/${skill.slug}`}
      className="group relative block p-5 rounded-lg border border-border bg-card hover:border-accent/50 transition-all duration-300 overflow-hidden"
    >
      {/* Hover gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/0 to-accent/0 group-hover:from-accent/5 group-hover:to-transparent transition-all duration-300" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <h4 className="font-semibold text-card-foreground group-hover:text-accent transition-colors line-clamp-1">
            {skill.name}
          </h4>
          {skill.stars !== undefined && skill.stars > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-3.5 h-3.5 text-yellow-500"
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

        {/* Author */}
        <div className="text-xs text-muted font-mono mb-3 flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          {skill.author}
        </div>

        {/* Description */}
        <p className="text-sm text-muted line-clamp-2 mb-4">
          {skill.description}
        </p>

        {/* Pros & Cons */}
        {(skill.pros?.length || skill.cons?.length) && (
          <div className="space-y-2 pt-3 border-t border-border/50">
            {/* Pros */}
            {skill.pros && skill.pros.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {skill.pros.slice(0, 2).map((pro, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {pro}
                  </span>
                ))}
              </div>
            )}

            {/* Cons */}
            {skill.cons && skill.cons.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {skill.cons.slice(0, 2).map((con, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {con}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Arrow on hover */}
        <div className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
          <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
