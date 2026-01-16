import Link from 'next/link';
import type { Skill } from '@/types';
import { formatDate } from '@/lib/utils';

interface TechSpecProps {
  skill: Skill;
}

export function TechSpec({ skill }: TechSpecProps) {
  const specs = [
    {
      label: 'Language',
      value: skill.language,
      href: skill.language ? `/languages/${encodeURIComponent(skill.language.toLowerCase())}` : undefined,
      color: skill.language ? languageColors[skill.language] : undefined,
    },
    {
      label: 'License',
      value: skill.license,
      href: skill.license ? `/licenses/${encodeURIComponent(skill.license.toLowerCase())}` : undefined,
    },
    {
      label: 'Created',
      value: skill.createdAt ? formatDate(skill.createdAt) : undefined,
    },
    {
      label: 'Updated',
      value: skill.updatedAt ? formatDate(skill.updatedAt) : undefined,
    },
  ].filter((spec) => spec.value);

  if (specs.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {specs.map((spec) => (
        <div
          key={spec.label}
          className="p-4 rounded-xl border border-border bg-card/50"
        >
          <div className="text-xs text-muted uppercase tracking-wider mb-1.5">
            {spec.label}
          </div>
          {spec.href ? (
            <Link
              href={spec.href}
              className="flex items-center gap-2 text-sm font-medium hover:text-terminal transition-colors group"
            >
              {spec.color && (
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: spec.color }}
                />
              )}
              <span className="group-hover:underline">{spec.value}</span>
            </Link>
          ) : (
            <div className="flex items-center gap-2 text-sm font-medium">
              {spec.color && (
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: spec.color }}
                />
              )}
              <span>{spec.value}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

const languageColors: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f7df1e',
  Python: '#3776ab',
  Rust: '#dea584',
  Go: '#00add8',
  Ruby: '#cc342d',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  Shell: '#89e051',
  Dockerfile: '#384d54',
};
