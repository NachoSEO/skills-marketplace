import type { Skill, Category, SkillRegistry, SkillCacheEntry, SkillsIndex } from '@/types';
import { getRepoInfo, getSkillMdContent, parseSkillMd, generateInstallCommand } from './github';
import skillsRegistry from '@/data/skills-registry.json';
import categoriesData from '@/data/categories.json';

let skillsDataCache: Skill[] | null = null;
let skillsIndexCache: SkillsIndex | null = null;
let legacyCache: Map<string, SkillCacheEntry> = new Map();

function loadSkillsData(): Skill[] {
  if (skillsDataCache) return skillsDataCache;

  try {
    skillsDataCache = require('@/data/skills-data.json') as Skill[];
  } catch {
    skillsDataCache = null;
  }

  return skillsDataCache || [];
}

function loadSkillsIndex(): SkillsIndex | null {
  if (skillsIndexCache) return skillsIndexCache;

  try {
    skillsIndexCache = require('@/data/skills-index.json') as SkillsIndex;
  } catch {
    skillsIndexCache = null;
  }

  return skillsIndexCache;
}

function loadLegacyCache(): Map<string, SkillCacheEntry> {
  if (legacyCache.size > 0) return legacyCache;

  try {
    const cacheData = require('@/data/skills-cache.json') as SkillCacheEntry[];
    legacyCache = new Map(cacheData.map((entry) => [entry.slug, entry]));
  } catch {
    legacyCache = new Map();
  }

  return legacyCache;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function getAllSkills(): Promise<Skill[]> {
  const skills: Skill[] = [];
  const registry = skillsRegistry as SkillRegistry[];

  for (const entry of registry) {
    const skill = await getSkillFromRegistry(entry);
    if (skill) {
      skills.push(skill);
    }
  }

  return skills.sort((a, b) => (b.stars || 0) - (a.stars || 0));
}

export async function getSkillFromRegistry(entry: SkillRegistry): Promise<Skill | null> {
  const repoInfo = await getRepoInfo(entry.owner, entry.repo);

  const name = entry.name || repoInfo?.full_name.split('/')[1] || entry.repo;
  const description = entry.description || repoInfo?.description || '';

  const skill: Skill = {
    id: `${entry.owner}-${entry.repo}${entry.path ? `-${slugify(entry.path)}` : ''}`,
    name: formatSkillName(name),
    slug: slugify(name),
    description,
    author: entry.owner,
    githubUrl: entry.path
      ? `https://github.com/${entry.owner}/${entry.repo}/tree/main/${entry.path}`
      : `https://github.com/${entry.owner}/${entry.repo}`,
    stars: repoInfo?.stargazers_count,
    forks: repoInfo?.forks_count,
    watchers: repoInfo?.watchers_count,
    language: repoInfo?.language,
    license: repoInfo?.license?.spdx_id || repoInfo?.license?.name || null,
    category: entry.category,
    tags: entry.tags || [],
    installCommand: generateInstallCommand(entry.owner, entry.repo, entry.path),
    createdAt: repoInfo?.created_at || new Date().toISOString(),
    updatedAt: repoInfo?.updated_at,
    featured: entry.featured,
    skillPath: entry.path,
  };

  return skill;
}

function formatSkillName(name: string): string {
  return name
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function getSkillsSync(): Skill[] {
  // Prefer the unified skills-data.json if available
  const skillsData = loadSkillsData();
  if (skillsData.length > 0) {
    return skillsData;
  }

  // Fallback to legacy behavior: merge registry + cache
  const registry = skillsRegistry as SkillRegistry[];
  const cache = loadLegacyCache();

  return registry.map((entry) => {
    const name = entry.name || entry.repo;
    const slug = slugify(name);
    const cached = cache.get(slug);

    return {
      id: `${entry.owner}-${entry.repo}${entry.path ? `-${slugify(entry.path)}` : ''}`,
      name: formatSkillName(name),
      slug,
      description: entry.description || '',
      aiDescription: cached?.aiDescription,
      seoContent: cached?.seoContent,
      author: entry.owner,
      githubUrl: entry.path
        ? `https://github.com/${entry.owner}/${entry.repo}/tree/main/${entry.path}`
        : `https://github.com/${entry.owner}/${entry.repo}`,
      stars: cached?.stars,
      forks: cached?.forks,
      watchers: cached?.watchers,
      language: cached?.language,
      license: cached?.license,
      category: entry.category,
      tags: entry.tags || [],
      installCommand: generateInstallCommand(entry.owner, entry.repo, entry.path),
      createdAt: cached?.createdAt || new Date().toISOString(),
      updatedAt: cached?.updatedAt,
      featured: entry.featured,
      skillPath: entry.path,
      pros: entry.pros,
      cons: entry.cons,
    };
  });
}

export function getCategories(): Category[] {
  return categoriesData as Category[];
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return (categoriesData as Category[]).find((cat) => cat.slug === slug);
}

export function getSkillsByCategory(skills: Skill[], categorySlug: string): Skill[] {
  return skills.filter((skill) => skill.category === categorySlug);
}

export function getSkillBySlug(skills: Skill[], slug: string): Skill | undefined {
  // Use O(1) index lookup if available
  const index = loadSkillsIndex();
  if (index && index.slugIndex[slug] !== undefined) {
    return skills[index.slugIndex[slug]];
  }

  // Fallback to O(n) search
  return skills.find((skill) => skill.slug === slug);
}

export function getFeaturedSkills(skills: Skill[]): Skill[] {
  return skills.filter((skill) => skill.featured);
}

export function getLatestSkills(skills: Skill[], limit = 9): Skill[] {
  return [...skills]
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, limit);
}

export function searchSkills(skills: Skill[], query: string): Skill[] {
  const lowerQuery = query.toLowerCase();

  return skills.filter((skill) => {
    return (
      skill.name.toLowerCase().includes(lowerQuery) ||
      skill.description.toLowerCase().includes(lowerQuery) ||
      skill.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
      skill.author.toLowerCase().includes(lowerQuery)
    );
  });
}

export function getSkillCountByCategory(skills: Skill[]): Record<string, number> {
  // Use precomputed aggregates if available
  const index = loadSkillsIndex();
  if (index) {
    const counts: Record<string, number> = {};
    for (const [category, stats] of Object.entries(index.aggregates.categoryStats)) {
      counts[category] = stats.count;
    }
    return counts;
  }

  // Fallback to runtime computation
  const counts: Record<string, number> = {};
  for (const skill of skills) {
    counts[skill.category] = (counts[skill.category] || 0) + 1;
  }

  return counts;
}

export function getRelatedSkills(skills: Skill[], currentSkill: Skill, limit = 3): Skill[] {
  return skills
    .filter((skill) => skill.id !== currentSkill.id)
    .map((skill) => ({
      skill,
      score: calculateRelatedness(skill, currentSkill),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ skill }) => skill);
}

function calculateRelatedness(a: Skill, b: Skill): number {
  let score = 0;
  if (a.category === b.category) score += 10;
  const sharedTags = a.tags.filter((t) => b.tags.includes(t)).length;
  score += sharedTags * 3;
  if (a.author === b.author) score += 2;
  if (a.language && a.language === b.language) score += 1;
  return score;
}

/**
 * Get alternative skills that compete with or substitute the current skill.
 * Different from related skills: alternatives must be from different authors
 * and are not shown in the related skills section.
 */
export function getAlternativeSkills(
  skills: Skill[],
  currentSkill: Skill,
  relatedSkillIds: string[],
  limit = 3
): Skill[] {
  return skills
    .filter((skill) => {
      // Exclude the current skill
      if (skill.id === currentSkill.id) return false;
      // Must be same category (solving similar problem)
      if (skill.category !== currentSkill.category) return false;
      // Must be different author (competitor/alternative)
      if (skill.author === currentSkill.author) return false;
      // Exclude skills already shown in related section
      if (relatedSkillIds.includes(skill.id)) return false;
      return true;
    })
    // Sort by popularity (stars)
    .sort((a, b) => (b.stars || 0) - (a.stars || 0))
    .slice(0, limit);
}

export function getUniqueTags(skills: Skill[]): string[] {
  const tags = new Set<string>();
  skills.forEach((skill) => skill.tags.forEach((tag) => tags.add(tag)));
  return Array.from(tags).sort();
}

export function getUniqueLanguages(skills: Skill[]): string[] {
  const languages = new Set<string>();
  skills.forEach((skill) => {
    if (skill.language) languages.add(skill.language);
  });
  return Array.from(languages).sort();
}

export function getUniqueLicenses(skills: Skill[]): string[] {
  const licenses = new Set<string>();
  skills.forEach((skill) => {
    if (skill.license) licenses.add(skill.license);
  });
  return Array.from(licenses).sort();
}

export function getSkillsByTag(skills: Skill[], tag: string): Skill[] {
  return skills.filter((skill) => skill.tags.includes(tag));
}

export function getSkillsByLanguage(skills: Skill[], language: string): Skill[] {
  return skills.filter((skill) => skill.language === language);
}

export function getSkillsByLicense(skills: Skill[], license: string): Skill[] {
  return skills.filter((skill) => skill.license === license);
}

export function getTagsWithCounts(skills: Skill[]): { tag: string; count: number }[] {
  // Use precomputed aggregates if available
  const index = loadSkillsIndex();
  if (index) {
    return Object.entries(index.aggregates.tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  }

  // Fallback to runtime computation
  const counts = new Map<string, number>();
  skills.forEach((skill) => {
    skill.tags.forEach((tag) => {
      counts.set(tag, (counts.get(tag) || 0) + 1);
    });
  });
  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

export function getLanguagesWithCounts(skills: Skill[]): { language: string; count: number }[] {
  // Use precomputed aggregates if available
  const index = loadSkillsIndex();
  if (index) {
    return Object.entries(index.aggregates.languageCounts)
      .map(([language, count]) => ({ language, count }))
      .sort((a, b) => b.count - a.count);
  }

  // Fallback to runtime computation
  const counts = new Map<string, number>();
  skills.forEach((skill) => {
    if (skill.language) {
      counts.set(skill.language, (counts.get(skill.language) || 0) + 1);
    }
  });
  return Array.from(counts.entries())
    .map(([language, count]) => ({ language, count }))
    .sort((a, b) => b.count - a.count);
}

export function getLicensesWithCounts(skills: Skill[]): { license: string; count: number }[] {
  // Use precomputed aggregates if available
  const index = loadSkillsIndex();
  if (index) {
    return Object.entries(index.aggregates.licenseCounts)
      .map(([license, count]) => ({ license, count }))
      .sort((a, b) => b.count - a.count);
  }

  // Fallback to runtime computation
  const counts = new Map<string, number>();
  skills.forEach((skill) => {
    if (skill.license) {
      counts.set(skill.license, (counts.get(skill.license) || 0) + 1);
    }
  });
  return Array.from(counts.entries())
    .map(([license, count]) => ({ license, count }))
    .sort((a, b) => b.count - a.count);
}

// Export index utilities for advanced use cases
export function getSkillsIndex(): SkillsIndex | null {
  return loadSkillsIndex();
}

// Contributor-related utilities
export interface ContributorStats {
  author: string;
  skillCount: number;
  totalStars: number;
  languages: string[];
  categories: string[];
}

export function getContributorsWithStats(skills: Skill[]): ContributorStats[] {
  const contributorMap = new Map<string, ContributorStats>();

  for (const skill of skills) {
    const existing = contributorMap.get(skill.author);
    if (existing) {
      existing.skillCount++;
      existing.totalStars += skill.stars || 0;
      if (skill.language && !existing.languages.includes(skill.language)) {
        existing.languages.push(skill.language);
      }
      if (!existing.categories.includes(skill.category)) {
        existing.categories.push(skill.category);
      }
    } else {
      contributorMap.set(skill.author, {
        author: skill.author,
        skillCount: 1,
        totalStars: skill.stars || 0,
        languages: skill.language ? [skill.language] : [],
        categories: [skill.category],
      });
    }
  }

  return Array.from(contributorMap.values());
}

export function getSkillsByAuthor(skills: Skill[], author: string): Skill[] {
  return skills.filter((skill) => skill.author === author);
}

export function getContributorByAuthor(skills: Skill[], author: string): ContributorStats | undefined {
  const contributors = getContributorsWithStats(skills);
  return contributors.find((c) => c.author === author);
}
