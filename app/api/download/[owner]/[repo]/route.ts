import { NextRequest, NextResponse } from 'next/server';
import { getSkillsSync } from '@/lib/skills';

interface RouteParams {
  params: Promise<{ owner: string; repo: string }>;
}

// Validate GitHub username/repo format (alphanumeric, hyphens, underscores)
const VALID_GITHUB_PATTERN = /^[a-zA-Z0-9][-a-zA-Z0-9_]*$/;

function isValidGitHubName(name: string): boolean {
  return VALID_GITHUB_PATTERN.test(name) && name.length <= 100;
}

function isAllowedRepo(owner: string, repo: string): boolean {
  const skills = getSkillsSync();
  return skills.some(
    (skill) =>
      skill.githubUrl.toLowerCase().includes(`github.com/${owner.toLowerCase()}/${repo.toLowerCase()}`)
  );
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { owner, repo } = await params;

  // Validate parameter format
  if (!isValidGitHubName(owner) || !isValidGitHubName(repo)) {
    return NextResponse.json(
      { error: 'Invalid parameters' },
      { status: 400 }
    );
  }

  // Whitelist check - only allow downloads from registered skills
  if (!isAllowedRepo(owner, repo)) {
    return NextResponse.json(
      { error: 'Repository not in skills registry' },
      { status: 403 }
    );
  }

  const branches = ['main', 'master'];

  for (const branch of branches) {
    const zipUrl = `https://github.com/${owner}/${repo}/archive/refs/heads/${branch}.zip`;

    try {
      const response = await fetch(zipUrl, {
        headers: {
          'User-Agent': 'skills-marketplace',
        },
      });

      if (response.ok && response.body) {
        return new NextResponse(response.body, {
          headers: {
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename="${repo}.zip"`,
            'X-Content-Type-Options': 'nosniff',
            'Cache-Control': 'private, no-cache',
          },
        });
      }
    } catch {
      continue;
    }
  }

  return NextResponse.json(
    { error: 'Repository not found or not accessible' },
    { status: 404 }
  );
}
