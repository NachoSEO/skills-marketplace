import Link from 'next/link';
import { SkillCard } from '@/components/skills/SkillCard';
import type { Skill } from '@/types';
import type { Collection } from '@/types/programmatic-seo';

interface CollectionCarouselProps {
  collection: Collection;
  skills: Skill[];
}

export function CollectionCarousel({ collection, skills }: CollectionCarouselProps) {
  if (skills.length === 0) return null;

  const preview = skills.slice(0, 3);

  return (
    <div className="mb-12">
      <div className="flex items-end justify-between mb-6">
        <div>
          <div className="font-mono text-terminal text-sm mb-1">// {collection.slug.replace(/-/g, '_')}</div>
          <h3 className="text-xl font-bold">{collection.title}</h3>
          {collection.description && (
            <p className="text-sm text-muted mt-1 max-w-xl">{collection.description}</p>
          )}
        </div>
        <Link
          href={`/collections/${collection.slug}`}
          className="group flex items-center gap-2 text-sm font-medium text-muted hover:text-terminal transition-colors shrink-0 ml-4"
        >
          <span>{skills.length} skills</span>
          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {preview.map((skill, index) => (
          <div
            key={skill.id}
            className="opacity-0 fade-in-up"
            style={{ animationDelay: `${0.1 * (index + 1)}s`, animationFillMode: 'forwards' }}
          >
            <SkillCard skill={skill} />
          </div>
        ))}
      </div>
    </div>
  );
}
