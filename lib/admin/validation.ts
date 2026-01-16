import { z } from 'zod';

export const skillRegistrySchema = z.object({
  owner: z.string().min(1, 'Owner is required'),
  repo: z.string().min(1, 'Repository is required'),
  path: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  pros: z.array(z.string()).optional(),
  cons: z.array(z.string()).optional(),
});

export type SkillRegistryInput = z.infer<typeof skillRegistrySchema>;

export const githubUrlSchema = z.string().url().refine(
  (url) => {
    try {
      const parsed = new URL(url);
      return parsed.hostname === 'github.com';
    } catch {
      return false;
    }
  },
  { message: 'Must be a valid GitHub URL' }
);

export function parseGitHubUrl(url: string): { owner: string; repo: string; path?: string } | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== 'github.com') {
      return null;
    }

    const parts = parsed.pathname.split('/').filter(Boolean);
    if (parts.length < 2) {
      return null;
    }

    const owner = parts[0];
    const repo = parts[1];

    // Handle paths like /owner/repo/tree/main/path/to/skill
    if (parts.length > 4 && parts[2] === 'tree') {
      const skillPath = parts.slice(4).join('/');
      return { owner, repo, path: skillPath };
    }

    return { owner, repo };
  } catch {
    return null;
  }
}

export function validateSkillInput(data: unknown): { success: true; data: SkillRegistryInput } | { success: false; errors: Record<string, string> } {
  const result = skillRegistrySchema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const path = issue.path.join('.');
    errors[path] = issue.message;
  }

  return { success: false, errors };
}
