import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import type { SkillRegistry } from '../types';
import { searchByTopic, searchForSkillMdFiles, type DiscoveredSkill } from '../lib/admin/github-search';
import { analyzeRepo } from '../lib/admin/category-detector';

const GITHUB_API_BASE = 'https://api.github.com';
const skillsRegistryPath = path.join(__dirname, '../data/skills-registry.json');

const MAX_NEW_SKILLS = parseInt(process.env.MAX_NEW_SKILLS || '50', 10);
const DRY_RUN = process.argv.includes('--dry-run');

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

// Additional GitHub search queries beyond existing functions
async function searchAdditionalQueries(): Promise<DiscoveredSkill[]> {
  if (!process.env.GITHUB_TOKEN) return [];

  const queries = [
    '"claude code" skill',
    'mcp-server claude',
    'CLAUDE.md filename:CLAUDE.md',
  ];

  const allResults = new Map<string, DiscoveredSkill>();

  for (const query of queries) {
    try {
      const response = await fetch(
        `${GITHUB_API_BASE}/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=30`,
        { headers: getHeaders() }
      );
      if (!response.ok) continue;

      const data = await response.json();
      for (const item of data.items || []) {
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

      // Rate limit between searches
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch {
      // Continue on error
    }
  }

  return Array.from(allResults.values());
}

// Crawl known monorepos for skill subdirectories
async function crawlMonorepos(): Promise<DiscoveredSkill[]> {
  if (!process.env.GITHUB_TOKEN) return [];

  const monorepos = [
    { owner: 'anthropics', repo: 'skills' },
  ];

  const results: DiscoveredSkill[] = [];

  for (const { owner, repo } of monorepos) {
    try {
      const response = await fetch(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees/main?recursive=1`,
        { headers: getHeaders() }
      );
      if (!response.ok) continue;

      const data = await response.json();
      const tree = data.tree || [];

      // Find directories containing SKILL.md
      const skillMdPaths = tree
        .filter((item: { path: string; type: string }) => item.path.endsWith('SKILL.md') && item.type === 'blob')
        .map((item: { path: string }) => {
          const parts = item.path.split('/');
          parts.pop(); // Remove SKILL.md
          return parts.join('/');
        })
        .filter((p: string) => p.length > 0);

      // Get repo info for metadata
      const repoResponse = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, {
        headers: getHeaders(),
      });
      const repoInfo = repoResponse.ok ? await repoResponse.json() : null;

      for (const skillPath of skillMdPaths) {
        const skillName = skillPath.split('/').pop() || skillPath;
        results.push({
          owner,
          repo,
          name: skillName,
          description: `Skill from ${owner}/${repo}`,
          stars: repoInfo?.stargazers_count || 0,
          language: repoInfo?.language || null,
          topics: repoInfo?.topics || [],
          updatedAt: repoInfo?.updated_at || new Date().toISOString(),
          license: repoInfo?.license?.spdx_id || null,
          url: `https://github.com/${owner}/${repo}/tree/main/${skillPath}`,
          hasSkillMd: true,
          skillPaths: [skillPath],
        });
      }
    } catch {
      // Continue on error
    }
  }

  return results;
}

// Parse awesome-list style markdown for GitHub links
async function parseAwesomeLists(): Promise<DiscoveredSkill[]> {
  if (!process.env.GITHUB_TOKEN) return [];

  const awesomeLists = [
    { owner: 'anthropics', repo: 'awesome-claude-code', path: 'README.md' },
  ];

  const results: DiscoveredSkill[] = [];

  for (const { owner, repo, path: filePath } of awesomeLists) {
    try {
      for (const branch of ['main', 'master']) {
        const response = await fetch(
          `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`,
          { headers: getHeaders() }
        );
        if (!response.ok) continue;

        const content = await response.text();

        // Extract GitHub repo links
        const linkRegex = /https?:\/\/github\.com\/([\w.-]+)\/([\w.-]+)/g;
        let match;
        const seen = new Set<string>();

        while ((match = linkRegex.exec(content)) !== null) {
          const repoOwner = match[1];
          const repoName = match[2];
          const key = `${repoOwner}/${repoName}`.toLowerCase();

          if (seen.has(key)) continue;
          seen.add(key);

          // Skip the list itself and non-repo links
          if (repoOwner === owner && repoName === repo) continue;
          if (['issues', 'pull', 'blob', 'tree', 'releases'].includes(repoName)) continue;

          results.push({
            owner: repoOwner,
            repo: repoName,
            name: repoName,
            description: null,
            stars: 0,
            language: null,
            topics: [],
            updatedAt: new Date().toISOString(),
            license: null,
            url: `https://github.com/${repoOwner}/${repoName}`,
          });
        }

        break; // Found on this branch
      }
    } catch {
      // Continue on error
    }
  }

  return results;
}

interface RejectionReason {
  skill: string;
  reason: string;
}

async function main() {
  console.log(`Discovering new skills...${DRY_RUN ? ' (DRY RUN)' : ''}\n`);

  if (!process.env.GITHUB_TOKEN) {
    console.error('GITHUB_TOKEN is required for discovery');
    process.exit(1);
  }

  // Load existing registry
  const registry: SkillRegistry[] = JSON.parse(
    fs.readFileSync(skillsRegistryPath, 'utf-8')
  );

  // Build set of known skills
  const knownKeys = new Set<string>();
  for (const entry of registry) {
    const key = entry.path
      ? `${entry.owner}/${entry.repo}/${entry.path}`.toLowerCase()
      : `${entry.owner}/${entry.repo}`.toLowerCase();
    knownKeys.add(key);
  }

  console.log(`Existing skills in registry: ${registry.length}\n`);

  // Aggregate from all sources
  console.log('Searching by topic...');
  const topicResults = await searchByTopic();
  console.log(`  Found ${topicResults.length} repos`);

  console.log('Searching for SKILL.md files...');
  const skillMdResults = await searchForSkillMdFiles();
  console.log(`  Found ${skillMdResults.length} repos`);

  console.log('Running additional queries...');
  const additionalResults = await searchAdditionalQueries();
  console.log(`  Found ${additionalResults.length} repos`);

  console.log('Crawling monorepos...');
  const monorepoResults = await crawlMonorepos();
  console.log(`  Found ${monorepoResults.length} skills`);

  console.log('Parsing awesome lists...');
  const awesomeListResults = await parseAwesomeLists();
  console.log(`  Found ${awesomeListResults.length} repos`);

  // Merge all results
  const allDiscovered = new Map<string, DiscoveredSkill>();

  const addResults = (skills: DiscoveredSkill[]) => {
    for (const skill of skills) {
      // Handle monorepo skills with paths
      if (skill.skillPaths && skill.skillPaths.length > 0) {
        for (const skillPath of skill.skillPaths) {
          const key = `${skill.owner}/${skill.repo}/${skillPath}`.toLowerCase();
          if (!allDiscovered.has(key)) {
            allDiscovered.set(key, { ...skill, skillPaths: [skillPath] });
          }
        }
      } else {
        const key = `${skill.owner}/${skill.repo}`.toLowerCase();
        if (!allDiscovered.has(key)) {
          allDiscovered.set(key, skill);
        }
      }
    }
  };

  addResults(topicResults);
  addResults(skillMdResults);
  addResults(additionalResults);
  addResults(monorepoResults);
  addResults(awesomeListResults);

  console.log(`\nTotal unique discovered: ${allDiscovered.size}`);

  // Filter and process
  const newSkills: SkillRegistry[] = [];
  const rejected: RejectionReason[] = [];

  for (const [key, skill] of allDiscovered) {
    // Skip already known
    if (knownKeys.has(key)) {
      continue;
    }

    // Fetch full repo info for quality filters
    let repoInfo: { archived: boolean; fork: boolean; description: string | null; stargazers_count: number; updated_at: string } | null = null;
    try {
      const response = await fetch(`${GITHUB_API_BASE}/repos/${skill.owner}/${skill.repo}`, {
        headers: getHeaders(),
      });
      if (response.ok) {
        repoInfo = await response.json();
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch {
      // Continue without repo info
    }

    // Quality filters
    if (repoInfo?.archived) {
      rejected.push({ skill: key, reason: 'archived' });
      continue;
    }

    if (repoInfo?.fork) {
      rejected.push({ skill: key, reason: 'fork' });
      continue;
    }

    // Check repo type - must be skill or mcp-server
    const detection = analyzeRepo(
      skill.name,
      skill.description || repoInfo?.description || null,
      skill.topics || [],
      skill.hasSkillMd || false
    );

    if (detection.repoType !== 'skill' && detection.repoType !== 'mcp-server') {
      if (detection.typeConfidence < 0.5) {
        rejected.push({ skill: key, reason: `low confidence type: ${detection.repoType} (${detection.typeConfidence})` });
        continue;
      }
    }

    // Must have description (from discovery or repo)
    const description = skill.description || repoInfo?.description;
    if (!description) {
      rejected.push({ skill: key, reason: 'no description' });
      continue;
    }

    // Updated within last 12 months
    const updatedAt = repoInfo?.updated_at || skill.updatedAt;
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    if (new Date(updatedAt) < twelveMonthsAgo) {
      rejected.push({ skill: key, reason: 'not updated in 12 months' });
      continue;
    }

    // Auto-categorize
    const category = detection.category || 'development-tools';

    const skillPath = skill.skillPaths?.[0];

    const newEntry: SkillRegistry = {
      owner: skill.owner,
      repo: skill.repo,
      ...(skillPath ? { path: skillPath } : {}),
      category,
      name: skill.name,
      description: description,
      tags: skill.topics?.slice(0, 5) || [],
    };

    newSkills.push(newEntry);

    if (newSkills.length >= MAX_NEW_SKILLS) {
      console.log(`\nReached max new skills limit (${MAX_NEW_SKILLS})`);
      break;
    }
  }

  // Summary
  console.log(`\n--- Discovery Summary ---`);
  console.log(`Total discovered: ${allDiscovered.size}`);
  console.log(`Already known: ${allDiscovered.size - newSkills.length - rejected.length}`);
  console.log(`Accepted: ${newSkills.length}`);
  console.log(`Rejected: ${rejected.length}`);

  if (rejected.length > 0) {
    console.log(`\nRejection reasons:`);
    const reasons = new Map<string, number>();
    for (const r of rejected) {
      const reason = r.reason;
      reasons.set(reason, (reasons.get(reason) || 0) + 1);
    }
    for (const [reason, count] of reasons) {
      console.log(`  ${reason}: ${count}`);
    }
  }

  if (newSkills.length > 0) {
    console.log(`\nNew skills to add:`);
    for (const skill of newSkills) {
      console.log(`  ${skill.owner}/${skill.repo}${skill.path ? `/${skill.path}` : ''} [${skill.category}]`);
    }
  }

  if (!DRY_RUN && newSkills.length > 0) {
    const updatedRegistry = [...registry, ...newSkills];
    fs.writeFileSync(skillsRegistryPath, JSON.stringify(updatedRegistry, null, 2));
    console.log(`\nRegistry updated: ${registry.length} -> ${updatedRegistry.length} skills`);
  } else if (DRY_RUN) {
    console.log(`\n(Dry run - no changes written)`);
  }
}

main().catch(console.error);
