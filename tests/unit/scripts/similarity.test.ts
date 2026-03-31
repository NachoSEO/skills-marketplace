import { describe, it, expect } from 'vitest';
import {
  composeSkillText,
  computeAlternativeScore,
  computeRelatedScore,
} from '@/scripts/lib/similarity';
import type { Skill } from '@/types';

function makeSkill(overrides: Partial<Skill> = {}): Skill {
  return {
    id: 'test-id',
    slug: 'test-skill',
    name: 'Test Skill',
    description: 'A test skill',
    author: 'testuser',
    githubUrl: 'https://github.com/testuser/test-skill',
    stars: 100,
    forks: 10,
    category: 'testing',
    tags: ['test', 'qa'],
    language: 'TypeScript',
    license: 'MIT',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  } as Skill;
}

describe('composeSkillText', () => {
  it('includes skill name, description, category, and tags', () => {
    const skill = makeSkill();
    const text = composeSkillText(skill);
    expect(text).toContain('Test Skill');
    expect(text).toContain('A test skill');
    expect(text).toContain('testing');
    expect(text).toContain('test');
    expect(text).toContain('qa');
  });

  it('includes language when present', () => {
    const skill = makeSkill({ language: 'Python' });
    const text = composeSkillText(skill);
    expect(text).toContain('Python');
  });

  it('includes readme content when provided', () => {
    const skill = makeSkill();
    const text = composeSkillText(skill, 'This is the README content');
    expect(text).toContain('This is the README content');
  });

  it('strips HTML tags from readme', () => {
    const skill = makeSkill();
    const text = composeSkillText(skill, '<h1>Title</h1><p>content</p>');
    expect(text).not.toContain('<h1>');
    expect(text).toContain('Title');
    expect(text).toContain('content');
  });

  it('strips URLs from readme', () => {
    const skill = makeSkill();
    const text = composeSkillText(skill, 'Visit https://example.com for more info');
    expect(text).not.toContain('https://example.com');
    expect(text).toContain('Visit');
    expect(text).toContain('for more info');
  });

  it('works when tags array is empty', () => {
    const skill = makeSkill({ tags: [] });
    expect(() => composeSkillText(skill)).not.toThrow();
  });
});

describe('computeAlternativeScore', () => {
  it('returns score between 0 and 100', () => {
    const skillA = makeSkill({ slug: 'a', category: 'testing', tags: ['test'] });
    const skillB = makeSkill({ slug: 'b', category: 'testing', tags: ['test'] });
    const { score } = computeAlternativeScore(0.8, skillA, skillB);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('gives higher score for skills in the same category', () => {
    const base = makeSkill({ slug: 'a', category: 'automation', tags: [] });
    const sameCategory = makeSkill({ slug: 'b', category: 'automation', tags: [], stars: 50 });
    const diffCategory = makeSkill({ slug: 'c', category: 'productivity', tags: [], stars: 50 });
    const { score: sameCatScore } = computeAlternativeScore(0.5, base, sameCategory);
    const { score: diffCatScore } = computeAlternativeScore(0.5, base, diffCategory);
    expect(sameCatScore).toBeGreaterThan(diffCatScore);
  });

  it('includes a reason string', () => {
    const skillA = makeSkill({ tags: ['automation'] });
    const skillB = makeSkill({ tags: ['automation'] });
    const { reason } = computeAlternativeScore(0.6, skillA, skillB);
    expect(typeof reason).toBe('string');
    expect(reason.length).toBeGreaterThan(0);
  });
});

describe('computeRelatedScore', () => {
  it('returns score between 0 and 100', () => {
    const skillA = makeSkill({ slug: 'a' });
    const skillB = makeSkill({ slug: 'b' });
    const { score } = computeRelatedScore(0.5, skillA, skillB);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('boosts score for skills by the same author', () => {
    const base = makeSkill({ slug: 'a', author: 'alice', tags: [] });
    const sameAuthor = makeSkill({ slug: 'b', author: 'alice', tags: [] });
    const diffAuthor = makeSkill({ slug: 'c', author: 'bob', tags: [] });
    const { score: sameAuthorScore } = computeRelatedScore(0.5, base, sameAuthor);
    const { score: diffAuthorScore } = computeRelatedScore(0.5, base, diffAuthor);
    expect(sameAuthorScore).toBeGreaterThan(diffAuthorScore);
  });

  it('includes shared tags in the reason', () => {
    const skillA = makeSkill({ tags: ['git', 'workflow'] });
    const skillB = makeSkill({ tags: ['git', 'automation'] });
    const { reason } = computeRelatedScore(0.4, skillA, skillB);
    expect(reason).toContain('git');
  });
});
