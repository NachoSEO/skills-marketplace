import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{ owner: string; repo: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { owner, repo } = await params;

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
