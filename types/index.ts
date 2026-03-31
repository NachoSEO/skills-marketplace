export interface FileNode {
  name: string;
  type: 'file' | 'dir';
  path: string;
  children?: FileNode[];
}

export interface Skill {
  id: string;
  name: string;
  slug: string;
  description: string;
  aiDescription?: string;
  readmeContent?: string;
  author: string;
  githubUrl: string;
  stars?: number;
  forks?: number;
  watchers?: number;
  language?: string | null;
  license?: string | null;
  category: string;
  tags: string[];
  installCommand?: string;
  createdAt: string;
  updatedAt?: string;
  featured?: boolean;
  skillPath?: string;
  pros?: string[];
  cons?: string[];
  rating?: number;
  fileStructure?: FileNode[];
  // Repo health
  openIssuesCount?: number;
  lastCommitDate?: string;
  hasWiki?: boolean;
  hasDiscussions?: boolean;
  // Code quality signals
  codeSignals?: {
    hasTests: boolean;
    hasCI: boolean;
    hasDocker: boolean;
    hasTypes: boolean;
    hasSkillMd: boolean;
  };
  // Contributors
  contributorsCount?: number;
  topContributors?: { login: string; avatarUrl: string; contributions: number }[];
  // Ranking
  rank?: number;
  rankScore?: number;
  trendingRank?: number;
  isHot?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
}

export interface GitHubRepo {
  full_name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  language: string | null;
  license: { name: string; spdx_id: string } | null;
  html_url: string;
  updated_at: string;
  created_at: string;
  owner: {
    login: string;
    html_url: string;
  };
}

export interface SkillCacheEntry {
  slug: string;
  aiDescription: string;
  stars: number;
  forks: number;
  watchers: number;
  language: string | null;
  license: string | null;
  createdAt: string;
  updatedAt: string;
  lastFetched: string;
}

export interface SkillRegistry {
  owner: string;
  repo: string;
  path?: string;
  category: string;
  tags?: string[];
  featured?: boolean;
  name?: string;
  description?: string;
  pros?: string[];
  cons?: string[];
  rating?: number;
}

export interface SkillSimilarityEntry {
  slug: string;
  score: number;
  semanticScore: number;
  reason: string;
}

export interface SkillSimilarities {
  version: string;
  generatedAt: string;
  algorithm: string;
  similarities: Record<string, {
    alternatives: SkillSimilarityEntry[];
    related: SkillSimilarityEntry[];
  }>;
}

export interface SkillsIndex {
  version: string;
  generatedAt: string;
  slugIndex: Record<string, number>;
  categoryIndex: Record<string, string[]>;
  tagIndex: Record<string, string[]>;
  languageIndex: Record<string, string[]>;
  aggregates: {
    tagCounts: Record<string, number>;
    languageCounts: Record<string, number>;
    licenseCounts: Record<string, number>;
    categoryStats: Record<string, { count: number; featured: number }>;
    totalSkills: number;
    totalFeatured: number;
  };
}

export * from './programmatic-seo';
