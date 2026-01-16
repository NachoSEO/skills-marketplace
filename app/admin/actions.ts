'use server';

import { revalidatePath } from 'next/cache';
import { exec } from 'child_process';
import { promisify } from 'util';
import {
  getFilteredSkills,
  addSkill,
  updateSkill,
  deleteSkill,
  toggleFeatured,
  generateSkillId,
  getSkillById,
} from '@/lib/admin/registry';
import { validateSkillInput, parseGitHubUrl, type SkillRegistryInput } from '@/lib/admin/validation';
import { getRepoInfo, getReadmeContent } from '@/lib/github';
import type { SkillRegistry, Category } from '@/types';
import { promises as fs } from 'fs';
import path from 'path';

const execAsync = promisify(exec);

export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string>;
}

export async function getSkillsAction(filters: {
  search?: string;
  category?: string;
  featured?: boolean;
}): Promise<ActionResult<(SkillRegistry & { id: string })[]>> {
  try {
    const skills = await getFilteredSkills(filters);
    const skillsWithIds = skills.map((s) => ({
      ...s,
      id: generateSkillId(s),
    }));
    return { success: true, data: skillsWithIds };
  } catch (error) {
    return { success: false, error: 'Failed to fetch skills' };
  }
}

export async function getSkillAction(id: string): Promise<ActionResult<SkillRegistry & { id: string }>> {
  try {
    const skill = await getSkillById(id);
    if (!skill) {
      return { success: false, error: 'Skill not found' };
    }
    return { success: true, data: { ...skill, id } };
  } catch (error) {
    return { success: false, error: 'Failed to fetch skill' };
  }
}

export async function addSkillAction(data: SkillRegistryInput): Promise<ActionResult<SkillRegistry & { id: string }>> {
  const validation = validateSkillInput(data);
  if (!validation.success) {
    return { success: false, errors: validation.errors };
  }

  try {
    const skill = await addSkill(validation.data);
    revalidatePath('/admin');
    return { success: true, data: { ...skill, id: generateSkillId(skill) } };
  } catch (error) {
    return { success: false, error: 'Failed to add skill' };
  }
}

export async function updateSkillAction(
  id: string,
  data: Partial<SkillRegistryInput>
): Promise<ActionResult<SkillRegistry & { id: string }>> {
  try {
    const skill = await updateSkill(id, data);
    if (!skill) {
      return { success: false, error: 'Skill not found' };
    }
    revalidatePath('/admin');
    revalidatePath(`/admin/skills/${id}/edit`);
    return { success: true, data: { ...skill, id: generateSkillId(skill) } };
  } catch (error) {
    return { success: false, error: 'Failed to update skill' };
  }
}

export async function deleteSkillAction(id: string): Promise<ActionResult> {
  try {
    const deleted = await deleteSkill(id);
    if (!deleted) {
      return { success: false, error: 'Skill not found' };
    }
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to delete skill' };
  }
}

export async function toggleFeaturedAction(id: string): Promise<ActionResult<SkillRegistry & { id: string }>> {
  try {
    const skill = await toggleFeatured(id);
    if (!skill) {
      return { success: false, error: 'Skill not found' };
    }
    revalidatePath('/admin');
    return { success: true, data: { ...skill, id: generateSkillId(skill) } };
  } catch (error) {
    return { success: false, error: 'Failed to toggle featured' };
  }
}

export async function fetchGitHubDataAction(url: string): Promise<
  ActionResult<{
    owner: string;
    repo: string;
    path?: string;
    name?: string;
    description?: string;
    language?: string;
    license?: string;
    stars?: number;
  }>
> {
  const parsed = parseGitHubUrl(url);
  if (!parsed) {
    return { success: false, error: 'Invalid GitHub URL' };
  }

  try {
    const repoInfo = await getRepoInfo(parsed.owner, parsed.repo);
    if (!repoInfo) {
      return { success: false, error: 'Failed to fetch repository info' };
    }

    return {
      success: true,
      data: {
        owner: parsed.owner,
        repo: parsed.repo,
        path: parsed.path,
        name: repoInfo.full_name.split('/')[1],
        description: repoInfo.description || undefined,
        language: repoInfo.language || undefined,
        license: repoInfo.license?.spdx_id || undefined,
        stars: repoInfo.stargazers_count,
      },
    };
  } catch (error) {
    return { success: false, error: 'Failed to fetch GitHub data' };
  }
}

export async function generateDescriptionAction(id: string): Promise<ActionResult<string>> {
  try {
    const skill = await getSkillById(id);
    if (!skill) {
      return { success: false, error: 'Skill not found' };
    }

    const readme = await getReadmeContent(skill.owner, skill.repo, skill.path);
    if (!readme) {
      return { success: false, error: 'Failed to fetch README' };
    }

    // Dynamic import to avoid loading Anthropic SDK in client
    const { summarizeReadme } = await import('@/scripts/lib/summarize');
    const summary = await summarizeReadme(readme, skill.name || skill.repo);

    await updateSkill(id, { description: summary });
    revalidatePath('/admin');

    return { success: true, data: summary };
  } catch (error) {
    console.error('Error generating description:', error);
    return { success: false, error: 'Failed to generate description' };
  }
}

export async function regenerateDataAction(): Promise<ActionResult> {
  try {
    const { stdout, stderr } = await execAsync('npm run generate:skills', {
      cwd: process.cwd(),
    });
    console.log('Generate output:', stdout);
    if (stderr) console.error('Generate stderr:', stderr);

    revalidatePath('/');
    revalidatePath('/skills');
    revalidatePath('/admin');

    return { success: true };
  } catch (error) {
    console.error('Error regenerating data:', error);
    return { success: false, error: 'Failed to regenerate data' };
  }
}

export async function getCategoriesAction(): Promise<ActionResult<Category[]>> {
  try {
    const categoriesPath = path.join(process.cwd(), 'data', 'categories.json');
    const content = await fs.readFile(categoriesPath, 'utf-8');
    const categories = JSON.parse(content) as Category[];
    return { success: true, data: categories };
  } catch (error) {
    return { success: false, error: 'Failed to fetch categories' };
  }
}

// ============== Discover Actions ==============

import {
  discoverAllSkills,
  searchGitHubForSkills,
  type DiscoveredSkill,
} from '@/lib/admin/github-search';
import { getRegistry } from '@/lib/admin/registry';

export async function discoverSkillsAction(query?: string): Promise<ActionResult<DiscoveredSkill[]>> {
  try {
    const discovered = query
      ? await searchGitHubForSkills(query)
      : await discoverAllSkills();

    // Filter out skills already in registry
    const registry = await getRegistry();
    const existingKeys = new Set(
      registry.map((s) => `${s.owner}/${s.repo}`.toLowerCase())
    );

    const newSkills = discovered.filter(
      (s) => !existingKeys.has(`${s.owner}/${s.repo}`.toLowerCase())
    );

    return { success: true, data: newSkills };
  } catch (error) {
    console.error('Error discovering skills:', error);
    return { success: false, error: 'Failed to discover skills' };
  }
}

export async function addDiscoveredSkillAction(
  skill: DiscoveredSkill,
  category: string,
  skillPath?: string
): Promise<ActionResult<SkillRegistry & { id: string }>> {
  try {
    const data: SkillRegistryInput = {
      owner: skill.owner,
      repo: skill.repo,
      path: skillPath || undefined,
      category,
      name: skill.name,
      description: skill.description || undefined,
      tags: skill.topics?.slice(0, 5),
    };

    const newSkill = await addSkill(data);
    revalidatePath('/admin');
    revalidatePath('/admin/discover');

    return { success: true, data: { ...newSkill, id: generateSkillId(newSkill) } };
  } catch (error) {
    console.error('Error adding discovered skill:', error);
    return { success: false, error: 'Failed to add skill' };
  }
}

export async function bulkAddSkillsAction(
  skills: Array<{ skill: DiscoveredSkill; category: string; path?: string }>
): Promise<ActionResult<{ added: number; failed: number }>> {
  let added = 0;
  let failed = 0;

  for (const { skill, category, path } of skills) {
    const result = await addDiscoveredSkillAction(skill, category, path);
    if (result.success) {
      added++;
    } else {
      failed++;
    }
  }

  revalidatePath('/admin');
  revalidatePath('/admin/discover');

  return { success: true, data: { added, failed } };
}
