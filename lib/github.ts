import type { GitHubRepo } from '@/types';

const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com';

interface GitHubOptions {
  token?: string;
}

function getHeaders(options?: GitHubOptions): HeadersInit {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
  };

  const token = options?.token || process.env.GITHUB_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

export async function getRepoInfo(
  owner: string,
  repo: string,
  options?: GitHubOptions
): Promise<GitHubRepo | null> {
  try {
    const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, {
      headers: getHeaders(options),
      next: { revalidate: 3600 },
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

export async function getSkillMdContent(
  owner: string,
  repo: string,
  path?: string,
  options?: GitHubOptions
): Promise<string | null> {
  const skillPath = path ? `${path}/SKILL.md` : 'SKILL.md';
  const url = `${GITHUB_RAW_BASE}/${owner}/${repo}/main/${skillPath}`;

  try {
    const response = await fetch(url, {
      headers: getHeaders(options),
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      const masterUrl = `${GITHUB_RAW_BASE}/${owner}/${repo}/master/${skillPath}`;
      const masterResponse = await fetch(masterUrl, {
        headers: getHeaders(options),
        next: { revalidate: 3600 },
      });

      if (!masterResponse.ok) {
        return null;
      }

      return masterResponse.text();
    }

    return response.text();
  } catch (error) {
    console.error(`Error fetching SKILL.md from ${owner}/${repo}:`, error);
    return null;
  }
}

export async function getReadmeContent(
  owner: string,
  repo: string,
  path?: string,
  options?: GitHubOptions
): Promise<string | null> {
  const readmePath = path ? `${path}/README.md` : 'README.md';
  const url = `${GITHUB_RAW_BASE}/${owner}/${repo}/main/${readmePath}`;

  try {
    const response = await fetch(url, {
      headers: getHeaders(options),
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      const masterUrl = `${GITHUB_RAW_BASE}/${owner}/${repo}/master/${readmePath}`;
      const masterResponse = await fetch(masterUrl, {
        headers: getHeaders(options),
        next: { revalidate: 3600 },
      });

      if (!masterResponse.ok) {
        return null;
      }

      return masterResponse.text();
    }

    return response.text();
  } catch (error) {
    console.error(`Error fetching README from ${owner}/${repo}/${path || ''}:`, error);
    return null;
  }
}

export function parseSkillMd(content: string): {
  name?: string;
  description?: string;
  instructions?: string;
} {
  const result: { name?: string; description?: string; instructions?: string } = {};

  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (frontmatterMatch) {
    const frontmatter = frontmatterMatch[1];

    const nameMatch = frontmatter.match(/^name:\s*(.+)$/m);
    if (nameMatch) {
      result.name = nameMatch[1].trim().replace(/^["']|["']$/g, '');
    }

    const descMatch = frontmatter.match(/^description:\s*(.+)$/m);
    if (descMatch) {
      result.description = descMatch[1].trim().replace(/^["']|["']$/g, '');
    }

    result.instructions = content.slice(frontmatterMatch[0].length).trim();
  } else {
    const titleMatch = content.match(/^#\s+(.+)$/m);
    if (titleMatch) {
      result.name = titleMatch[1].trim();
    }

    const lines = content.split('\n');
    for (const line of lines) {
      if (line.trim() && !line.startsWith('#')) {
        result.description = line.trim();
        break;
      }
    }

    result.instructions = content;
  }

  return result;
}

export function generateInstallCommand(owner: string, repo: string, path?: string): string {
  const fullPath = path ? `${owner}/${repo}/${path}` : `${owner}/${repo}`;
  return `git clone https://github.com/${owner}/${repo}.git ~/.claude/skills/${repo}`;
}
