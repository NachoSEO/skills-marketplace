import type { Skill } from '@/types';

/**
 * Prompt injection patterns commonly used to hijack LLM behavior.
 * Used to sanitize user-controlled skill content before displaying or
 * feeding to any AI/embedding API.
 */
const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+instructions?/gi,
  /disregard\s+(all\s+)?(previous|prior|above)\s+instructions?/gi,
  /forget\s+(all\s+)?(previous|prior)\s+instructions?/gi,
  /you\s+are\s+now\s+a/gi,
  /act\s+as\s+(a\s+|an\s+)?(?:different\s+)?ai/gi,
  /new\s+instructions?:/gi,
  /system\s+prompt:/gi,
  /\[system\]/gi,
  /\[instructions?\]/gi,
  /<\s*system\s*>/gi,
  /\/\*\s*instructions?/gi,
  /override\s+(safety|security|guidelines?)/gi,
  /jailbreak/gi,
  /DAN\s+mode/gi,
  /do\s+anything\s+now/gi,
];

/**
 * Sanitize a user-controlled text string by stripping known prompt injection
 * patterns. Safe for HTML display and AI-adjacent processing.
 */
export function sanitizeUserContent(text: string): string {
  if (!text) return text;

  let sanitized = text;
  for (const pattern of INJECTION_PATTERNS) {
    sanitized = sanitized.replace(pattern, '[removed]');
  }

  return sanitized;
}

/**
 * Build a safe text representation of a skill for AI/embedding APIs.
 * Uses ONLY structured metadata fields — never free-text descriptions or
 * README content that could contain adversarial injection prompts.
 *
 * Suitable for: embedding APIs, similarity computation, AI-powered search.
 */
export function buildSafeSkillText(skill: Skill): string {
  const parts: string[] = [];

  if (skill.name) parts.push(skill.name);
  if (skill.category) parts.push(`category:${skill.category}`);
  if (skill.tags.length > 0) parts.push(`tags:${skill.tags.join(',')}`);
  if (skill.language) parts.push(`language:${skill.language}`);
  if (skill.license) parts.push(`license:${skill.license}`);
  if (skill.author) parts.push(`author:${skill.author}`);

  return parts.join(' ');
}

/**
 * Extract safe structured metadata from a Skill for use in AI-adjacent
 * pipelines (embedding, similarity, ranking). Explicitly excludes
 * free-text fields that could contain prompt injection.
 */
export function getSafeSkillMetadata(skill: Skill): {
  name: string;
  slug: string;
  category: string;
  tags: string[];
  language: string | null | undefined;
  license: string | null | undefined;
  author: string;
  stars: number | undefined;
  forks: number | undefined;
  featured: boolean | undefined;
  rank: number | undefined;
  rankScore: number | undefined;
  isHot: boolean | undefined;
  createdAt: string;
} {
  return {
    name: skill.name,
    slug: skill.slug,
    category: skill.category,
    tags: skill.tags,
    language: skill.language,
    license: skill.license,
    author: skill.author,
    stars: skill.stars,
    forks: skill.forks,
    featured: skill.featured,
    rank: skill.rank,
    rankScore: skill.rankScore,
    isHot: skill.isHot,
    createdAt: skill.createdAt,
  };
}
