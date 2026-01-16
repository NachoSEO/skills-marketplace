import * as fs from 'fs';
import * as path from 'path';
import type { SkillRegistry, SkillCacheEntry, GitHubRepo, Skill, SkillsIndex } from '../types';
import { summarizeReadme } from './lib/summarize';

const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com';

const skillsRegistryPath = path.join(__dirname, '../data/skills-registry.json');
const cacheFilePath = path.join(__dirname, '../data/skills-cache.json');
const skillsDataPath = path.join(__dirname, '../data/skills-data.json');
const skillsIndexPath = path.join(__dirname, '../data/skills-index.json');

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

async function getRepoInfo(owner: string, repo: string): Promise<GitHubRepo | null> {
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

interface SkillDataWithReadme extends SkillCacheEntry {
  readme?: string;
  skillName: string;
}

async function processSkill(
  entry: SkillRegistry,
  existingCache: Map<string, SkillCacheEntry>
): Promise<SkillDataWithReadme | null> {
  const name = entry.name || entry.repo;
  const slug = slugify(name);

  const existing = existingCache.get(slug);
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

  if (existing && existing.aiDescription && new Date(existing.lastFetched).getTime() > oneDayAgo) {
    console.log(`  [CACHED] ${name}`);
    return { ...existing, skillName: formatSkillName(name) };
  }

  console.log(`  [FETCH] ${name}...`);

  const repoInfo = await getRepoInfo(entry.owner, entry.repo);
  if (!repoInfo) {
    console.log(`    [WARN] Could not fetch repo info for ${entry.owner}/${entry.repo}`);
    return existing ? { ...existing, skillName: formatSkillName(name) } : null;
  }

  const readme = await getReadmeContent(entry.owner, entry.repo, entry.path);
  console.log(`    [README] ${readme ? 'Found' : 'Not found'}`);

  const cacheEntry: SkillDataWithReadme = {
    slug,
    skillName: formatSkillName(name),
    aiDescription: existing?.aiDescription || '',
    readme: readme || undefined,
    stars: repoInfo.stargazers_count,
    forks: repoInfo.forks_count,
    watchers: repoInfo.watchers_count,
    language: repoInfo.language,
    license: repoInfo.license?.spdx_id || repoInfo.license?.name || null,
    createdAt: repoInfo.created_at,
    updatedAt: repoInfo.updated_at,
    lastFetched: new Date().toISOString(),
  };

  return cacheEntry;
}

function generateInstallCommand(owner: string, repo: string, skillPath?: string): string {
  if (skillPath) {
    return `git clone https://github.com/${owner}/${repo}.git && cd ${repo}/${skillPath}`;
  }
  return `git clone https://github.com/${owner}/${repo}.git`;
}

function generateFallbackSeoContent(name: string, description: string, tags: string[]): string {
  const tagList = tags.length > 0 ? tags.join(', ') : 'productivity';

  return `## What is ${name}?

${name} is a skill for Claude Code that helps you ${description ? description.toLowerCase() : 'enhance your development workflow'}. Install this skill to extend Claude's capabilities in your projects.

## Key Features

- Easy installation and setup
- Seamless integration with Claude Code
- Designed for developer productivity
- Community-maintained and open source

## Use Cases

- **Development Workflows**: Integrate ${name} into your daily coding tasks
- **Automation**: Automate repetitive tasks related to ${tagList}
- **Productivity**: Save time with AI-powered assistance

## How to Get Started

Install ${name} by cloning the repository and placing it in your Claude Code skills directory. The skill will be automatically available in your next Claude Code session.

## Why Use This Skill?

${name} extends Claude Code's capabilities, making it easier to work with ${tagList}. Whether you're a beginner or an experienced developer, this skill can help streamline your workflow.`;
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

  // Save raw data with READMEs for manual summarization
  const rawDataPath = path.join(__dirname, '../data/skills-raw.json');
  fs.writeFileSync(rawDataPath, JSON.stringify(results, null, 2));

  // Save cache without READMEs (for those that have aiDescription)
  const cacheResults: SkillCacheEntry[] = results.map(({ readme, skillName, ...rest }) => rest);
  fs.writeFileSync(cacheFilePath, JSON.stringify(cacheResults, null, 2));

  // Generate unified skills-data.json with full Skill objects
  const skillsData: Skill[] = registry.map((entry, index) => {
    const name = entry.name || entry.repo;
    const slug = slugify(name);
    const cached = results.find((r) => r.slug === slug);
    const formattedName = formatSkillName(name);
    const description = entry.description || '';

    // Generate fallback AI description if missing
    const aiDescription = cached?.aiDescription || (description
      ? `${formattedName} provides ${description.toLowerCase().replace(/^[a-z]/, c => c.toLowerCase())}`
      : `${formattedName} is a skill for Claude Code that enhances your development workflow.`
    );

    // Generate fallback SEO content if missing
    const seoContent = cached?.seoContent || generateFallbackSeoContent(formattedName, description, entry.tags || []);

    return {
      id: `${entry.owner}-${entry.repo}${entry.path ? `-${slugify(entry.path)}` : ''}`,
      name: formattedName,
      slug,
      description,
      aiDescription,
      seoContent,
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

  // Sort by stars (descending) for default display order
  skillsData.sort((a, b) => (b.stars || 0) - (a.stars || 0));

  fs.writeFileSync(skillsDataPath, JSON.stringify(skillsData, null, 2));

  // Generate skills-index.json for O(1) lookups
  const skillsIndex = buildSkillsIndex(skillsData);
  fs.writeFileSync(skillsIndexPath, JSON.stringify(skillsIndex, null, 2));

  console.log(`\nDone!`);
  console.log(`  Processed: ${processed}`);
  console.log(`  Failed: ${failed}`);
  console.log(`  Raw data (with READMEs): ${rawDataPath}`);
  console.log(`  Cache: ${cacheFilePath}`);
  console.log(`  Skills data: ${skillsDataPath} (${skillsData.length} skills)`);
  console.log(`  Skills index: ${skillsIndexPath}`);
  console.log(`\nIndex stats:`);
  console.log(`  Categories: ${Object.keys(skillsIndex.categoryIndex).length}`);
  console.log(`  Tags: ${Object.keys(skillsIndex.tagIndex).length}`);
  console.log(`  Languages: ${Object.keys(skillsIndex.languageIndex).length}`);
  console.log(`  Featured: ${skillsIndex.aggregates.totalFeatured}`);
}

main().catch(console.error);
