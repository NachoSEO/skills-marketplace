import type { Skill } from '../../types';

export function composeSkillText(skill: Skill, readmeContent?: string): string {
  const parts = [
    // Repeat name for weight
    skill.name,
    skill.name,
    skill.description,
    `Category: ${skill.category}`,
    skill.tags.length > 0 ? `Tags: ${skill.tags.join(' ')}` : '',
    skill.language ? `Language: ${skill.language}` : '',
  ];

  if (readmeContent) {
    const cleaned = readmeContent
      // Remove markdown badges [![...](...](...))
      .replace(/\[!\[[^\]]*\]\([^)]*\)\]\([^)]*\)/g, '')
      // Remove image links ![...](...)
      .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
      // Remove HTML tags
      .replace(/<[^>]+>/g, '')
      // Remove URLs
      .replace(/https?:\/\/\S+/g, '')
      // Collapse whitespace
      .replace(/\s+/g, ' ')
      .trim();

    // Truncate to ~4KB
    parts.push(cleaned.slice(0, 4096));
  }

  return parts.filter(Boolean).join(' ');
}

export function computeAlternativeScore(
  cosineSim: number,
  skillA: Skill,
  skillB: Skill
): { score: number; reason: string } {
  const categoryBonus = skillA.category === skillB.category ? 1.0 : 0;
  const maxStars = Math.max(skillA.stars || 1, skillB.stars || 1);
  const popularityNorm = Math.log(1 + (skillB.stars || 0)) / Math.log(1 + maxStars);

  const tagsA = new Set(skillA.tags);
  const tagsB = new Set(skillB.tags);
  const shared = [...tagsA].filter((t) => tagsB.has(t));
  const maxTags = Math.max(tagsA.size, tagsB.size, 1);
  const tagOverlapNorm = shared.length / maxTags;

  const score =
    cosineSim * 0.55 +
    categoryBonus * 0.20 +
    popularityNorm * 0.15 +
    tagOverlapNorm * 0.10;

  const reason = generateReason(skillA, skillB, shared, categoryBonus === 1);

  return { score: Math.round(score * 100), reason };
}

export function computeRelatedScore(
  cosineSim: number,
  skillA: Skill,
  skillB: Skill
): { score: number; reason: string } {
  const categoryBonus = skillA.category === skillB.category ? 1.0 : 0;
  const sameAuthor = skillA.author === skillB.author ? 1.0 : 0;

  const tagsA = new Set(skillA.tags);
  const tagsB = new Set(skillB.tags);
  const shared = [...tagsA].filter((t) => tagsB.has(t));
  const maxTags = Math.max(tagsA.size, tagsB.size, 1);
  const tagOverlapNorm = shared.length / maxTags;

  const score =
    cosineSim * 0.45 +
    categoryBonus * 0.20 +
    sameAuthor * 0.15 +
    tagOverlapNorm * 0.20;

  const reason = generateReason(skillA, skillB, shared, categoryBonus === 1);

  return { score: Math.round(score * 100), reason };
}

function generateReason(
  skillA: Skill,
  skillB: Skill,
  sharedTags: string[],
  sameCategory: boolean
): string {
  const parts: string[] = [];

  if (sharedTags.length > 0) {
    const tagList = sharedTags.slice(0, 3).join(', ');
    parts.push(`Both tagged with ${tagList}`);
  }

  if (sameCategory) {
    parts.push(`Same category`);
  }

  if (skillA.language && skillA.language === skillB.language) {
    parts.push(`Both use ${skillA.language}`);
  }

  if (parts.length === 0) {
    parts.push('Similar functionality based on content analysis');
  }

  return parts.join('. ');
}
