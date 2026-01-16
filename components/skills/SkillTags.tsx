interface SkillTagsProps {
  tags: string[];
}

export function SkillTags({ tags }: SkillTagsProps) {
  if (!tags || tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/70 border border-transparent text-sm text-muted"
        >
          <span className="text-terminal/60">#</span>
          {tag}
        </span>
      ))}
    </div>
  );
}
