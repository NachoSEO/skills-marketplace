import type { Skill, Category, SkillRegistry, SkillCacheEntry, SkillsIndex, SkillSimilarities } from '@/types';
import type { UseCase, Role, Collection, ComparePair } from '@/types/programmatic-seo';
import { getRepoInfo, getSkillMdContent, parseSkillMd, generateInstallCommand } from './github';
import skillsRegistry from '@/data/skills-registry.json';
import categoriesData from '@/data/categories.json';
import useCasesData from '@/data/use-cases.json';
import rolesData from '@/data/roles.json';
import collectionsData from '@/data/collections.json';
import comparePairsData from '@/data/compare-pairs.json';
import Fuse from 'fuse.js';

let skillsDataCache: Skill[] | null = null;
let skillsIndexCache: SkillsIndex | null = null;
let legacyCache: Map<string, SkillCacheEntry> = new Map();
let similaritiesCache: SkillSimilarities | null = null;

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

function loadSimilarities(): SkillSimilarities | null {
  if (similaritiesCache) return similaritiesCache;

  try {
    similaritiesCache = require('@/data/skills-similarities.json') as SkillSimilarities;
  } catch {
    similaritiesCache = null;
  }

  return similaritiesCache;
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

export interface ScoredSkill {
  skill: Skill;
  score: number;
}

const MAX_STARS = 5000;

/**
 * Fuzzy search with weighted ranking.
 * Signals: exact title match (0.4), fuzzy match score (0.4), normalised star count (0.2).
 * Returns skills sorted by combined score, highest first.
 */
export function fuzzySearchSkills(skills: Skill[], query: string): Skill[] {
  if (!query.trim()) return skills;

  const lowerQuery = query.toLowerCase();

  const fuse = new Fuse(skills, {
    keys: [
      { name: 'name', weight: 0.5 },
      { name: 'description', weight: 0.25 },
      { name: 'tags', weight: 0.15 },
      { name: 'author', weight: 0.1 },
    ],
    threshold: 0.4,
    includeScore: true,
    ignoreLocation: true,
    minMatchCharLength: 2,
  });

  const fuseResults = fuse.search(query);

  // Build a score map: fuse score is 0 (perfect) → 1 (no match), invert it
  const scoreMap = new Map<string, number>();
  for (const result of fuseResults) {
    // fuseScore: 0 = perfect match, 1 = no match — invert to get relevance 0→1
    const fuseRelevance = 1 - (result.score ?? 1);
    const skill = result.item;

    const exactTitleBonus = skill.name.toLowerCase().includes(lowerQuery) ? 1 : 0;
    const normalizedStars = Math.min((skill.stars || 0) / MAX_STARS, 1);

    const combined = exactTitleBonus * 0.35 + fuseRelevance * 0.45 + normalizedStars * 0.2;
    scoreMap.set(skill.id, combined);
  }

  return fuseResults
    .map((r) => r.item)
    .sort((a, b) => (scoreMap.get(b.id) ?? 0) - (scoreMap.get(a.id) ?? 0));
}

export function getSkillCountByCategory(skills: Skill[]): Record<string, number> {
  // Use precomputed aggregates if available
  const index = loadSkillsIndex();
  if (index?.aggregates?.categoryStats) {
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

export function getRelatedSkills(
  skills: Skill[],
  currentSkill: Skill,
  limit = 3
): { skill: Skill; score: number; reason: string }[] {
  const sims = loadSimilarities();
  const entry = sims?.similarities[currentSkill.slug];

  if (entry) {
    const results: { skill: Skill; score: number; reason: string }[] = [];
    for (const item of entry.related) {
      if (results.length >= limit) break;
      if (item.slug === currentSkill.slug) continue;
      const skill = getSkillBySlug(skills, item.slug);
      if (skill) {
        results.push({ skill, score: item.score, reason: item.reason });
      }
    }
    return results;
  }

  // Fallback: legacy scoring
  return skills
    .filter((skill) => skill.id !== currentSkill.id)
    .map((skill) => ({
      skill,
      score: calculateRelatedness(skill, currentSkill),
      reason: skill.category === currentSkill.category ? 'Same category' : 'Related skill',
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
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
): { skill: Skill; score: number; reason: string }[] {
  const sims = loadSimilarities();
  const entry = sims?.similarities[currentSkill.slug];

  if (entry) {
    const results: { skill: Skill; score: number; reason: string }[] = [];
    for (const item of entry.alternatives) {
      if (results.length >= limit) break;
      if (item.slug === currentSkill.slug) continue;
      const skill = getSkillBySlug(skills, item.slug);
      if (skill && !relatedSkillIds.includes(skill.id)) {
        results.push({ skill, score: item.score, reason: item.reason });
      }
    }
    return results;
  }

  // Fallback: legacy category + stars logic
  return skills
    .filter((skill) => {
      if (skill.id === currentSkill.id) return false;
      if (skill.category !== currentSkill.category) return false;
      if (skill.author === currentSkill.author) return false;
      if (relatedSkillIds.includes(skill.id)) return false;
      return true;
    })
    .sort((a, b) => (b.stars || 0) - (a.stars || 0))
    .slice(0, limit)
    .map((skill) => ({ skill, score: 50, reason: 'Same category' }));
}

// --- Programmatic SEO helpers ---

export function getUseCases(): UseCase[] {
  return useCasesData as UseCase[];
}

export function getUseCaseBySlug(slug: string): UseCase | undefined {
  return (useCasesData as UseCase[]).find((uc) => uc.slug === slug);
}

export function getSkillsByUseCase(skills: Skill[], useCase: UseCase): Skill[] {
  const index = loadSkillsIndex();
  const matchedSlugs = new Set<string>();

  // Match by tags
  for (const tag of useCase.tags) {
    if (index?.tagIndex[tag]) {
      for (const slug of index.tagIndex[tag]) matchedSlugs.add(slug);
    } else {
      for (const skill of skills) {
        if (skill.tags.includes(tag)) matchedSlugs.add(skill.slug);
      }
    }
  }

  // Match by categories
  for (const cat of useCase.categories) {
    if (index?.categoryIndex[cat]) {
      for (const slug of index.categoryIndex[cat]) matchedSlugs.add(slug);
    } else {
      for (const skill of skills) {
        if (skill.category === cat) matchedSlugs.add(skill.slug);
      }
    }
  }

  return skills
    .filter((s) => matchedSlugs.has(s.slug))
    .sort((a, b) => (b.stars || 0) - (a.stars || 0));
}

export function getRoles(): Role[] {
  return rolesData as Role[];
}

export function getRoleBySlug(slug: string): Role | undefined {
  return (rolesData as Role[]).find((r) => r.slug === slug);
}

export function getSkillsByRole(skills: Skill[], role: Role): Skill[] {
  const index = loadSkillsIndex();
  const matchedSlugs = new Set<string>();

  for (const tag of role.tags) {
    if (index?.tagIndex[tag]) {
      for (const slug of index.tagIndex[tag]) matchedSlugs.add(slug);
    } else {
      for (const skill of skills) {
        if (skill.tags.includes(tag)) matchedSlugs.add(skill.slug);
      }
    }
  }

  for (const cat of role.categories) {
    if (index?.categoryIndex[cat]) {
      for (const slug of index.categoryIndex[cat]) matchedSlugs.add(slug);
    } else {
      for (const skill of skills) {
        if (skill.category === cat) matchedSlugs.add(skill.slug);
      }
    }
  }

  return skills
    .filter((s) => matchedSlugs.has(s.slug))
    .sort((a, b) => (b.stars || 0) - (a.stars || 0));
}

export function getCollections(): Collection[] {
  return collectionsData as Collection[];
}

export function getCollectionBySlug(slug: string): Collection | undefined {
  return (collectionsData as Collection[]).find((c) => c.slug === slug);
}

export function getSkillsByCollection(skills: Skill[], collection: Collection): Skill[] {
  if (collection.slug === 'community-favorites') {
    return [...skills]
      .filter((s) => (s.stars || 0) > 0)
      .sort((a, b) => (b.stars || 0) - (a.stars || 0))
      .slice(0, 30);
  }

  const index = loadSkillsIndex();
  const matchedSlugs = new Set<string>();

  for (const tag of collection.tags) {
    if (index?.tagIndex[tag]) {
      for (const slug of index.tagIndex[tag]) matchedSlugs.add(slug);
    } else {
      for (const skill of skills) {
        if (skill.tags.includes(tag)) matchedSlugs.add(skill.slug);
      }
    }
  }

  for (const cat of collection.categories) {
    if (index?.categoryIndex[cat]) {
      for (const slug of index.categoryIndex[cat]) matchedSlugs.add(slug);
    } else {
      for (const skill of skills) {
        if (skill.category === cat) matchedSlugs.add(skill.slug);
      }
    }
  }

  return skills
    .filter((s) => matchedSlugs.has(s.slug))
    .sort((a, b) => (b.rankScore || 0) - (a.rankScore || 0))
    .slice(0, 30);
}

export function getComparePairs(): ComparePair[] {
  return comparePairsData as ComparePair[];
}

export function getComparePairBySlug(slug: string): { pair: ComparePair; skillA: Skill; skillB: Skill } | null {
  const skills = getSkillsSync();
  const pairs = comparePairsData as ComparePair[];

  for (const pair of pairs) {
    const expectedSlug = `${pair.slugA}-vs-${pair.slugB}`;
    if (expectedSlug === slug) {
      const skillA = getSkillBySlug(skills, pair.slugA);
      const skillB = getSkillBySlug(skills, pair.slugB);
      if (skillA && skillB) return { pair, skillA, skillB };
    }
  }
  return null;
}

// --- End programmatic SEO helpers ---

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
  if (index?.aggregates?.tagCounts) {
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
  if (index?.aggregates?.languageCounts) {
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
  if (index?.aggregates?.licenseCounts) {
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
