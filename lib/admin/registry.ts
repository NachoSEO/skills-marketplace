import { promises as fs } from 'fs';
import path from 'path';
import type { SkillRegistry } from '@/types';

const REGISTRY_PATH = path.join(process.cwd(), 'data', 'skills-registry.json');

export async function getRegistry(): Promise<SkillRegistry[]> {
  const content = await fs.readFile(REGISTRY_PATH, 'utf-8');
  return JSON.parse(content);
}

export async function writeRegistry(skills: SkillRegistry[]): Promise<void> {
  const content = JSON.stringify(skills, null, 2) + '\n';
  await fs.writeFile(REGISTRY_PATH, content, 'utf-8');
}

export function generateSkillId(skill: SkillRegistry): string {
  const pathPart = skill.path ? `-${skill.path.replace(/\//g, '-')}` : '';
  return `${skill.owner}-${skill.repo}${pathPart}`.toLowerCase();
}

export async function getSkillById(id: string): Promise<SkillRegistry | null> {
  const skills = await getRegistry();
  return skills.find((s) => generateSkillId(s) === id) || null;
}

export async function addSkill(skill: SkillRegistry): Promise<SkillRegistry> {
  const skills = await getRegistry();
  skills.push(skill);
  await writeRegistry(skills);
  return skill;
}

export async function updateSkill(id: string, updates: Partial<SkillRegistry>): Promise<SkillRegistry | null> {
  const skills = await getRegistry();
  const index = skills.findIndex((s) => generateSkillId(s) === id);

  if (index === -1) {
    return null;
  }

  skills[index] = { ...skills[index], ...updates };
  await writeRegistry(skills);
  return skills[index];
}

export async function deleteSkill(id: string): Promise<boolean> {
  const skills = await getRegistry();
  const index = skills.findIndex((s) => generateSkillId(s) === id);

  if (index === -1) {
    return false;
  }

  skills.splice(index, 1);
  await writeRegistry(skills);
  return true;
}

export async function toggleFeatured(id: string): Promise<SkillRegistry | null> {
  const skills = await getRegistry();
  const index = skills.findIndex((s) => generateSkillId(s) === id);

  if (index === -1) {
    return null;
  }

  skills[index].featured = !skills[index].featured;
  await writeRegistry(skills);
  return skills[index];
}

export interface SkillFilters {
  search?: string;
  category?: string;
  featured?: boolean;
}

export async function getFilteredSkills(filters: SkillFilters = {}): Promise<SkillRegistry[]> {
  let skills = await getRegistry();

  if (filters.search) {
    const search = filters.search.toLowerCase();
    skills = skills.filter(
      (s) =>
        s.name?.toLowerCase().includes(search) ||
        s.owner.toLowerCase().includes(search) ||
        s.repo.toLowerCase().includes(search) ||
        s.description?.toLowerCase().includes(search) ||
        s.tags?.some((t) => t.toLowerCase().includes(search))
    );
  }

  if (filters.category) {
    skills = skills.filter((s) => s.category === filters.category);
  }

  if (filters.featured !== undefined) {
    skills = skills.filter((s) => !!s.featured === filters.featured);
  }

  return skills;
}
