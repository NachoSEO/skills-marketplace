import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import type { SkillRegistry, SkillCacheEntry, GitHubRepo, Skill, SkillsIndex, FileNode } from '../types';

const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com';

const skillsRegistryPath = path.join(__dirname, '../data/skills-registry.json');
const cacheFilePath = path.join(__dirname, '../data/skills-cache.json');
const skillsDataPath = path.join(__dirname, '../data/skills-data.json');
const skillsIndexPath = path.join(__dirname, '../data/skills-index.json');
const skillsHistoryPath = path.join(__dirname, '../data/skills-history.json');

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
  };

  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

async function getRepoInfo(owner: string, repo: string): Promise<(GitHubRepo & { open_issues_count?: number; has_wiki?: boolean; has_discussions?: boolean }) | null> {
  try {
    const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      console.error(`Failed to fetch repo ${owner}/${repo}: ${response.status}`);
      return null;
    }

    return response.json();
  } catch (error) {
    console.error(`Error fetching repo ${owner}/${repo}:`, error);
    return null;
  }
}

async function getReadmeContent(
  owner: string,
  repo: string,
  skillPath?: string
): Promise<string | null> {
  const readmePath = skillPath ? `${skillPath}/README.md` : 'README.md';

  for (const branch of ['main', 'master']) {
    const url = `${GITHUB_RAW_BASE}/${owner}/${repo}/${branch}/${readmePath}`;
    try {
      const response = await fetch(url, { headers: getHeaders() });
      if (response.ok) {
        return response.text();
      }
    } catch {
      continue;
    }
  }

  if (skillPath) {
    for (const branch of ['main', 'master']) {
      const url = `${GITHUB_RAW_BASE}/${owner}/${repo}/${branch}/README.md`;
      try {
        const response = await fetch(url, { headers: getHeaders() });
        if (response.ok) {
          return response.text();
        }
      } catch {
        continue;
      }
    }
  }

  return null;
}

async function getLastCommitDate(owner: string, repo: string): Promise<string | null> {
  try {
    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits?per_page=1`,
      { headers: getHeaders() }
    );
    if (!response.ok) return null;
    const commits = await response.json();
    if (commits.length > 0) {
      return commits[0].commit?.committer?.date || commits[0].commit?.author?.date || null;
    }
    return null;
  } catch {
    return null;
  }
}

async function getContributors(
  owner: string,
  repo: string
): Promise<{ count: number; top: { login: string; avatarUrl: string; contributions: number }[] }> {
  try {
    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/contributors?per_page=5`,
      { headers: getHeaders() }
    );
    if (!response.ok) return { count: 0, top: [] };
    const contributors = await response.json();
    if (!Array.isArray(contributors)) return { count: 0, top: [] };

    // Get total count from Link header
    const linkHeader = response.headers.get('Link');
    let totalCount = contributors.length;
    if (linkHeader) {
      const lastMatch = linkHeader.match(/page=(\d+)>; rel="last"/);
      if (lastMatch) {
        totalCount = parseInt(lastMatch[1], 10) * 5; // approximate
      }
    }

    return {
      count: totalCount,
      top: contributors.slice(0, 5).map((c: { login: string; avatar_url: string; contributions: number }) => ({
        login: c.login,
        avatarUrl: c.avatar_url,
        contributions: c.contributions,
      })),
    };
  } catch {
    return { count: 0, top: [] };
  }
}

interface GitHubTreeItem {
  path: string;
  type: 'blob' | 'tree';
  sha: string;
}

async function getFileStructure(
  owner: string,
  repo: string,
  skillPath?: string
): Promise<FileNode[] | null> {
  const MAX_DEPTH = 3;
  const MAX_FILES = 50;

  for (const branch of ['main', 'master']) {
    try {
      const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
      const response = await fetch(url, { headers: getHeaders(), redirect: 'follow' });

      if (!response.ok) continue;

      const data = await response.json();
      const tree: GitHubTreeItem[] = data.tree || [];

      // Filter by skillPath if provided
      let filteredTree = tree;
      if (skillPath) {
        const prefix = skillPath.endsWith('/') ? skillPath : `${skillPath}/`;
        filteredTree = tree
          .filter((item) => item.path.startsWith(prefix))
          .map((item) => ({
            ...item,
            path: item.path.slice(prefix.length),
          }));
      }

      // Filter by depth and limit count
      const validItems = filteredTree.filter((item) => {
        const depth = item.path.split('/').length;
        return depth <= MAX_DEPTH && item.path.length > 0;
      });

      // Sort: directories first, then alphabetically
      validItems.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'tree' ? -1 : 1;
        }
        return a.path.localeCompare(b.path);
      });

      // Limit total items
      const limitedItems = validItems.slice(0, MAX_FILES);

      // Build hierarchical structure
      const root: FileNode[] = [];
      const nodeMap = new Map<string, FileNode>();

      for (const item of limitedItems) {
        const parts = item.path.split('/');
        const name = parts[parts.length - 1];
        const node: FileNode = {
          name,
          type: item.type === 'tree' ? 'dir' : 'file',
          path: item.path,
          children: item.type === 'tree' ? [] : undefined,
        };

        nodeMap.set(item.path, node);

        if (parts.length === 1) {
          root.push(node);
        } else {
          const parentPath = parts.slice(0, -1).join('/');
          const parent = nodeMap.get(parentPath);
          if (parent && parent.children) {
            parent.children.push(node);
          } else {
            // Parent doesn't exist yet, add to root
            root.push(node);
          }
        }
      }

      // Sort children within each directory
      const sortChildren = (nodes: FileNode[]) => {
        nodes.sort((a, b) => {
          if (a.type !== b.type) {
            return a.type === 'dir' ? -1 : 1;
          }
          return a.name.localeCompare(b.name);
        });
        for (const node of nodes) {
          if (node.children) {
            sortChildren(node.children);
          }
        }
      };

      sortChildren(root);

      return root.length > 0 ? root : null;
    } catch {
      continue;
    }
  }

  return null;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function formatSkillName(name: string): string {
  return name
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function extractDescriptionFromReadme(readme: string): string | null {
  const lines = readme.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    // Skip empty lines, headings, badges, images, HTML tags
    if (!trimmed) continue;
    if (trimmed.startsWith('#')) continue;
    if (trimmed.startsWith('![')) continue;
    if (trimmed.startsWith('[![')) continue;
    if (trimmed.startsWith('<')) continue;
    if (trimmed.startsWith('---')) continue;
    if (trimmed.match(/^\[!\[/)) continue;
    // Found a paragraph
    if (trimmed.length > 20) {
      // Clean up markdown links
      return trimmed.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').slice(0, 300);
    }
  }
  return null;
}

function deriveCodeSignals(fileStructure: FileNode[] | null): {
  hasTests: boolean;
  hasCI: boolean;
  hasDocker: boolean;
  hasTypes: boolean;
  hasSkillMd: boolean;
} {
  if (!fileStructure) {
    return { hasTests: false, hasCI: false, hasDocker: false, hasTypes: false, hasSkillMd: false };
  }

  const allPaths: string[] = [];
  const collectPaths = (nodes: FileNode[]) => {
    for (const node of nodes) {
      allPaths.push(node.path.toLowerCase());
      if (node.name) allPaths.push(node.name.toLowerCase());
      if (node.children) collectPaths(node.children);
    }
  };
  collectPaths(fileStructure);

  return {
    hasTests: allPaths.some(p =>
      p.includes('test/') || p.includes('__tests__/') || p.includes('tests/') ||
      p.includes('.test.') || p.includes('.spec.') || p.includes('_test.')
    ),
    hasCI: allPaths.some(p =>
      p.includes('.github/workflows') || p.includes('.circleci') ||
      p.includes('.travis') || p.includes('jenkinsfile')
    ),
    hasDocker: allPaths.some(p =>
      p.includes('dockerfile') || p.includes('docker-compose')
    ),
    hasTypes: allPaths.some(p =>
      p.includes('tsconfig') || p.includes('.d.ts') || p.includes('.ts') ||
      p.includes('types.') || p.includes('py.typed')
    ),
    hasSkillMd: allPaths.some(p => p === 'skill.md'),
  };
}

interface SkillDataWithReadme extends SkillCacheEntry {
  readme?: string;
  skillName: string;
  fileStructure?: FileNode[];
  lastCommitDate?: string;
  openIssuesCount?: number;
  hasWiki?: boolean;
  hasDiscussions?: boolean;
  contributorsCount?: number;
  topContributors?: { login: string; avatarUrl: string; contributions: number }[];
}

async function processSkill(
  entry: SkillRegistry,
  existingCache: Map<string, SkillCacheEntry>
): Promise<SkillDataWithReadme | null> {
  const name = entry.name || entry.repo;
  const slug = slugify(name);

  const existing = existingCache.get(slug);
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

  const isCached = existing && existing.aiDescription && new Date(existing.lastFetched).getTime() > oneDayAgo;

  // Always fetch file structure, even for cached skills
  const fileStructure = await getFileStructure(entry.owner, entry.repo, entry.path);

  if (isCached) {
    console.log(`  [CACHED] ${name} (files: ${fileStructure ? countFiles(fileStructure) : 0})`);
    return { ...existing, skillName: formatSkillName(name), fileStructure: fileStructure || undefined };
  }

  console.log(`  [FETCH] ${name}...`);

  const repoInfo = await getRepoInfo(entry.owner, entry.repo);
  if (!repoInfo) {
    console.log(`    [WARN] Could not fetch repo info for ${entry.owner}/${entry.repo}`);
    return existing ? { ...existing, skillName: formatSkillName(name), fileStructure: fileStructure || undefined } : null;
  }

  // Fetch README, last commit, and contributors in parallel
  const [readme, lastCommitDate, contributors] = await Promise.all([
    getReadmeContent(entry.owner, entry.repo, entry.path),
    getLastCommitDate(entry.owner, entry.repo),
    getContributors(entry.owner, entry.repo),
  ]);

  console.log(`    [README] ${readme ? 'Found' : 'Not found'}`);
  console.log(`    [FILES] ${fileStructure ? `${countFiles(fileStructure)} items` : 'Not found'}`);
  console.log(`    [CONTRIBUTORS] ${contributors.count}`);

  const cacheEntry: SkillDataWithReadme = {
    slug,
    skillName: formatSkillName(name),
    aiDescription: existing?.aiDescription || '',
    readme: readme || undefined,
    fileStructure: fileStructure || undefined,
    stars: repoInfo.stargazers_count,
    forks: repoInfo.forks_count,
    watchers: (repoInfo as unknown as Record<string, number>).subscribers_count || 0,
    language: repoInfo.language,
    license: repoInfo.license?.spdx_id || repoInfo.license?.name || null,
    createdAt: repoInfo.created_at,
    updatedAt: repoInfo.updated_at,
    lastFetched: new Date().toISOString(),
    lastCommitDate: lastCommitDate || undefined,
    openIssuesCount: repoInfo.open_issues_count,
    hasWiki: repoInfo.has_wiki,
    hasDiscussions: repoInfo.has_discussions,
    contributorsCount: contributors.count,
    topContributors: contributors.top.length > 0 ? contributors.top : undefined,
  };

  return cacheEntry;
}

function countFiles(nodes: FileNode[]): number {
  let count = nodes.length;
  for (const node of nodes) {
    if (node.children) {
      count += countFiles(node.children);
    }
  }
  return count;
}

function generateInstallCommand(owner: string, repo: string, skillPath?: string): string {
  if (skillPath) {
    return `git clone https://github.com/${owner}/${repo}.git && cd ${repo}/${skillPath}`;
  }
  return `git clone https://github.com/${owner}/${repo}.git`;
}

function buildSkillsIndex(skills: Skill[]): SkillsIndex {
  const slugIndex: Record<string, number> = {};
  const categoryIndex: Record<string, string[]> = {};
  const tagIndex: Record<string, string[]> = {};
  const languageIndex: Record<string, string[]> = {};
  const tagCounts: Record<string, number> = {};
  const languageCounts: Record<string, number> = {};
  const licenseCounts: Record<string, number> = {};
  const categoryStats: Record<string, { count: number; featured: number }> = {};

  let totalFeatured = 0;

  skills.forEach((skill, index) => {
    slugIndex[skill.slug] = index;

    if (!categoryIndex[skill.category]) {
      categoryIndex[skill.category] = [];
    }
    categoryIndex[skill.category].push(skill.slug);

    if (!categoryStats[skill.category]) {
      categoryStats[skill.category] = { count: 0, featured: 0 };
    }
    categoryStats[skill.category].count++;
    if (skill.featured) {
      categoryStats[skill.category].featured++;
      totalFeatured++;
    }

    skill.tags.forEach((tag) => {
      if (!tagIndex[tag]) {
        tagIndex[tag] = [];
      }
      tagIndex[tag].push(skill.slug);
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });

    if (skill.language) {
      if (!languageIndex[skill.language]) {
        languageIndex[skill.language] = [];
      }
      languageIndex[skill.language].push(skill.slug);
      languageCounts[skill.language] = (languageCounts[skill.language] || 0) + 1;
    }

    if (skill.license) {
      licenseCounts[skill.license] = (licenseCounts[skill.license] || 0) + 1;
    }
  });

  return {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    slugIndex,
    categoryIndex,
    tagIndex,
    languageIndex,
    aggregates: {
      tagCounts,
      languageCounts,
      licenseCounts,
      categoryStats,
      totalSkills: skills.length,
      totalFeatured,
    },
  };
}

function updateHistory(skills: Skill[]): void {
  const today = new Date().toISOString().split('T')[0];

  let history: Record<string, Record<string, { stars: number; forks: number }>> = {};
  if (fs.existsSync(skillsHistoryPath)) {
    try {
      history = JSON.parse(fs.readFileSync(skillsHistoryPath, 'utf-8'));
    } catch {
      history = {};
    }
  }

  // Add today's snapshot
  const todaySnapshot: Record<string, { stars: number; forks: number }> = {};
  for (const skill of skills) {
    if (skill.stars !== undefined) {
      todaySnapshot[skill.slug] = { stars: skill.stars, forks: skill.forks || 0 };
    }
  }
  history[today] = todaySnapshot;

  // Prune entries older than 90 days
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);
  const cutoffStr = cutoff.toISOString().split('T')[0];
  for (const date of Object.keys(history)) {
    if (date < cutoffStr) {
      delete history[date];
    }
  }

  fs.writeFileSync(skillsHistoryPath, JSON.stringify(history, null, 2));
}

async function main() {
  console.log('Starting skill data generation...\n');

  const registry: SkillRegistry[] = JSON.parse(
    fs.readFileSync(skillsRegistryPath, 'utf-8')
  );

  let existingCache: Map<string, SkillCacheEntry> = new Map();
  if (fs.existsSync(cacheFilePath)) {
    const cacheData: SkillCacheEntry[] = JSON.parse(
      fs.readFileSync(cacheFilePath, 'utf-8')
    );
    existingCache = new Map(cacheData.map((entry) => [entry.slug, entry]));
    console.log(`Loaded ${existingCache.size} cached entries\n`);
  }

  const results: SkillDataWithReadme[] = [];
  let processed = 0;
  let failed = 0;

  for (const entry of registry) {
    const result = await processSkill(entry, existingCache);
    if (result) {
      results.push(result);
      processed++;
    } else {
      failed++;
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  // Save cache without READMEs and fileStructure (for those that have aiDescription)
  const cacheResults: SkillCacheEntry[] = results.map(({ readme, skillName, fileStructure, lastCommitDate, openIssuesCount, hasWiki, hasDiscussions, contributorsCount, topContributors, ...rest }) => rest);
  fs.writeFileSync(cacheFilePath, JSON.stringify(cacheResults, null, 2));

  // Generate unified skills-data.json with full Skill objects
  const skillsData: Skill[] = registry.map((entry) => {
    const name = entry.name || entry.repo;
    const slug = slugify(name);
    const cached = results.find((r) => r.slug === slug);
    const formattedName = formatSkillName(name);
    const description = entry.description || '';

    // Extract description from README instead of using AI
    const readmeDescription = cached?.readme ? extractDescriptionFromReadme(cached.readme) : null;
    const aiDescription = cached?.aiDescription || readmeDescription || (description
      ? `${formattedName} provides ${description.toLowerCase().replace(/^[a-z]/, c => c.toLowerCase())}`
      : `${formattedName} is a skill for Claude Code that enhances your development workflow.`
    );

    // Derive code signals from file structure
    const codeSignals = deriveCodeSignals(cached?.fileStructure || null);

    // Calculate a default rating based on stars if not provided in registry
    const calculateDefaultRating = (stars: number | undefined): number => {
      if (!stars || stars <= 0) return 3.5;
      const logStars = Math.log10(stars);
      const rating = 3.0 + (logStars - 1) * 0.5;
      return Math.min(5.0, Math.max(3.0, Math.round(rating * 10) / 10));
    };

    const rating = entry.rating ?? calculateDefaultRating(cached?.stars);

    return {
      id: `${entry.owner}-${entry.repo}${entry.path ? `-${slugify(entry.path)}` : ''}`,
      name: formattedName,
      slug,
      description,
      aiDescription,
      // README fetched on-demand client-side to keep bundle small
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
      rating,
      fileStructure: cached?.fileStructure,
      openIssuesCount: cached?.openIssuesCount,
      lastCommitDate: cached?.lastCommitDate,
      hasWiki: cached?.hasWiki,
      hasDiscussions: cached?.hasDiscussions,
      codeSignals,
      contributorsCount: cached?.contributorsCount,
      topContributors: cached?.topContributors,
    };
  });

  // Sort by stars (descending) for default display order
  skillsData.sort((a, b) => (b.stars || 0) - (a.stars || 0));

  fs.writeFileSync(skillsDataPath, JSON.stringify(skillsData, null, 2));

  // Write individual README files to public/readmes/ for CDN serving
  const readmesDir = path.join(__dirname, '../public/readmes');
  if (!fs.existsSync(readmesDir)) {
    fs.mkdirSync(readmesDir, { recursive: true });
  }
  let readmeCount = 0;
  for (const result of results) {
    if (result.readme) {
      fs.writeFileSync(path.join(readmesDir, `${result.slug}.md`), result.readme);
      readmeCount++;
    }
  }
  console.log(`  READMEs written: ${readmeCount} files to public/readmes/`);

  // Generate skills-index.json for O(1) lookups
  const skillsIndex = buildSkillsIndex(skillsData);
  fs.writeFileSync(skillsIndexPath, JSON.stringify(skillsIndex, null, 2));

  // Update history for ranking
  updateHistory(skillsData);

  console.log(`\nDone!`);
  console.log(`  Processed: ${processed}`);
  console.log(`  Failed: ${failed}`);
  console.log(`  Cache: ${cacheFilePath}`);
  console.log(`  Skills data: ${skillsDataPath} (${skillsData.length} skills)`);
  console.log(`  Skills index: ${skillsIndexPath}`);
  console.log(`  Skills history: ${skillsHistoryPath}`);
  console.log(`\nIndex stats:`);
  console.log(`  Categories: ${Object.keys(skillsIndex.categoryIndex).length}`);
  console.log(`  Tags: ${Object.keys(skillsIndex.tagIndex).length}`);
  console.log(`  Languages: ${Object.keys(skillsIndex.languageIndex).length}`);
  console.log(`  Featured: ${skillsIndex.aggregates.totalFeatured}`);
}

main().catch(console.error);
