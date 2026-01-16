import Link from 'next/link';

interface SkillTagsProps {
  tags: string[];
}

export function SkillTags({ tags }: SkillTagsProps) {
  if (!tags || tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Link
          key={tag}
          href={`/skills?q=${encodeURIComponent(tag)}`}
          className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/70 hover:bg-terminal/10 border border-transparent hover:border-terminal/30 text-sm text-muted hover:text-terminal transition-all"
        >
          <span className="text-terminal/60 group-hover:text-terminal transition-colors">
            #
          </span>
          {tag}
        </Link>
      ))}
    </div>
  );
}
