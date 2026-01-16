import { analyzeRepo, type RepoType } from './category-detector';

const GITHUB_API_BASE = 'https://api.github.com';

interface GitHubSearchResult {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubSearchItem[];
}

interface GitHubSearchItem {
  full_name: string;
  name: string;
  owner: {
    login: string;
  };
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  topics: string[];
  updated_at: string;
  license: { spdx_id: string } | null;
}

export interface DiscoveredSkill {
  owner: string;
  repo: string;
  name: string;
  description: string | null;
  stars: number;
  language: string | null;
  topics: string[];
  updatedAt: string;
  license: string | null;
  url: string;
  hasSkillMd?: boolean;
  skillPaths?: string[];
  // Detection fields
  detectedCategory?: string | null;
  categoryConfidence?: number;
  suggestedCategories?: string[];
  repoType?: RepoType;
  typeConfidence?: number;
  signals?: string[];
}

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  return headers;
}

function hasGitHubToken(): boolean {
  return !!process.env.GITHUB_TOKEN;
}

export async function searchGitHubForSkills(query: string): Promise<DiscoveredSkill[]> {
  // GitHub search requires authentication
  if (!hasGitHubToken()) {
    return [];
  }

  const searchQueries = [
    `${query} filename:SKILL.md`,
    `${query} topic:claude-code`,
    `${query} topic:claude-skill`,
    `${query} topic:claude-code-skill`,
  ];

  const allResults = new Map<string, DiscoveredSkill>();

  for (const searchQuery of searchQueries) {
    try {
      const response = await fetch(
        `${GITHUB_API_BASE}/search/repositories?q=${encodeURIComponent(searchQuery)}&sort=stars&order=desc&per_page=30`,
        { headers: getHeaders() }
      );

      if (!response.ok) {
        continue;
      }

      const data: GitHubSearchResult = await response.json();

      for (const item of data.items) {
        const key = item.full_name.toLowerCase();
        if (!allResults.has(key)) {
          allResults.set(key, {
            owner: item.owner.login,
            repo: item.name,
            name: item.name,
            description: item.description,
            stars: item.stargazers_count,
            language: item.language,
            topics: item.topics || [],
            updatedAt: item.updated_at,
            license: item.license?.spdx_id || null,
            url: item.html_url,
          });
        }
      }
    } catch {
      // Silently continue on error
    }
  }

  return Array.from(allResults.values()).sort((a, b) => b.stars - a.stars);
}

export async function searchByTopic(): Promise<DiscoveredSkill[]> {
  // GitHub search requires authentication
  if (!hasGitHubToken()) {
    return [];
  }

  const topics = ['claude-code', 'claude-skill', 'claude-code-skill', 'anthropic-skill'];
  const allResults = new Map<string, DiscoveredSkill>();

  for (const topic of topics) {
    try {
      const response = await fetch(
        `${GITHUB_API_BASE}/search/repositories?q=topic:${topic}&sort=stars&order=desc&per_page=50`,
        { headers: getHeaders() }
      );

      if (!response.ok) {
        continue;
      }

      const data: GitHubSearchResult = await response.json();

      for (const item of data.items) {
        const key = item.full_name.toLowerCase();
        if (!allResults.has(key)) {
          allResults.set(key, {
            owner: item.owner.login,
            repo: item.name,
            name: item.name,
            description: item.description,
            stars: item.stargazers_count,
            language: item.language,
            topics: item.topics || [],
            updatedAt: item.updated_at,
            license: item.license?.spdx_id || null,
            url: item.html_url,
          });
        }
      }
    } catch {
      // Silently continue on error
    }
  }

  return Array.from(allResults.values()).sort((a, b) => b.stars - a.stars);
}

export async function searchForSkillMdFiles(): Promise<DiscoveredSkill[]> {
  // GitHub code search requires authentication
  if (!hasGitHubToken()) {
    return [];
  }

  try {
    const response = await fetch(
      `${GITHUB_API_BASE}/search/code?q=filename:SKILL.md+path:/&per_page=100`,
      { headers: getHeaders() }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const repoMap = new Map<string, { paths: string[]; item: any }>();

    for (const item of data.items || []) {
      const repoFullName = item.repository.full_name;
      const existing = repoMap.get(repoFullName);

      // Extract path (remove SKILL.md from the end)
      const pathParts = item.path.split('/');
      pathParts.pop(); // Remove SKILL.md
      const skillPath = pathParts.join('/') || undefined;

      if (existing) {
        if (skillPath) {
          existing.paths.push(skillPath);
        }
      } else {
        repoMap.set(repoFullName, {
          paths: skillPath ? [skillPath] : [],
          item: item.repository,
        });
      }
    }

    const results: DiscoveredSkill[] = [];

    for (const [, { paths, item }] of repoMap) {
      results.push({
        owner: item.owner.login,
        repo: item.name,
        name: item.name,
        description: item.description,
        stars: item.stargazers_count || 0,
        language: item.language,
        topics: [],
        updatedAt: item.updated_at || new Date().toISOString(),
        license: item.license?.spdx_id || null,
        url: item.html_url,
        hasSkillMd: true,
        skillPaths: paths.length > 0 ? paths : undefined,
      });
    }

    return results.sort((a, b) => b.stars - a.stars);
  } catch {
    return [];
  }
}

export async function checkRepoForSkillMd(
  owner: string,
  repo: string
): Promise<{ hasSkillMd: boolean; paths: string[] }> {
  // GitHub code search requires authentication
  if (!hasGitHubToken()) {
    return { hasSkillMd: false, paths: [] };
  }

  try {
    const response = await fetch(
      `${GITHUB_API_BASE}/search/code?q=filename:SKILL.md+repo:${owner}/${repo}`,
      { headers: getHeaders() }
    );

    if (!response.ok) {
      return { hasSkillMd: false, paths: [] };
    }

    const data = await response.json();
    const paths: string[] = [];

    for (const item of data.items || []) {
      const pathParts = item.path.split('/');
      pathParts.pop();
      const skillPath = pathParts.join('/');
      if (skillPath) {
        paths.push(skillPath);
      } else {
        paths.push(''); // Root level SKILL.md
      }
    }

    return { hasSkillMd: paths.length > 0, paths };
  } catch (error) {
    return { hasSkillMd: false, paths: [] };
  }
}

export async function discoverAllSkills(): Promise<DiscoveredSkill[]> {
  const [topicResults, codeResults] = await Promise.all([
    searchByTopic(),
    searchForSkillMdFiles(),
  ]);

  // Merge results, preferring code search results (they have SKILL.md info)
  const merged = new Map<string, DiscoveredSkill>();

  for (const skill of topicResults) {
    merged.set(`${skill.owner}/${skill.repo}`.toLowerCase(), skill);
  }

  for (const skill of codeResults) {
    const key = `${skill.owner}/${skill.repo}`.toLowerCase();
    const existing = merged.get(key);
    if (existing) {
      existing.hasSkillMd = skill.hasSkillMd;
      existing.skillPaths = skill.skillPaths;
    } else {
      merged.set(key, skill);
    }
  }

  // Add detection to all skills
  const results = Array.from(merged.values());
  for (const skill of results) {
    const detection = analyzeRepo(
      skill.name,
      skill.description,
      skill.topics,
      skill.hasSkillMd || false
    );
    skill.detectedCategory = detection.category;
    skill.categoryConfidence = detection.categoryConfidence;
    skill.suggestedCategories = detection.suggestedCategories;
    skill.repoType = detection.repoType;
    skill.typeConfidence = detection.typeConfidence;
    skill.signals = detection.signals;
  }

  // Sort by: skills first, then by type confidence, then by stars
  return results.sort((a, b) => {
    // Skills with SKILL.md first
    if (a.hasSkillMd && !b.hasSkillMd) return -1;
    if (!a.hasSkillMd && b.hasSkillMd) return 1;
    // Then by repo type (skill > mcp-server > claude-tool > prompt-library > related-repo)
    const typeOrder: Record<RepoType, number> = {
      'skill': 0,
      'mcp-server': 1,
      'claude-tool': 2,
      'prompt-library': 3,
      'related-repo': 4,
    };
    const typeA = typeOrder[a.repoType || 'related-repo'];
    const typeB = typeOrder[b.repoType || 'related-repo'];
    if (typeA !== typeB) return typeA - typeB;
    // Finally by stars
    return b.stars - a.stars;
  });
}
