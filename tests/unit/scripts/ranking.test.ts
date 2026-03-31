import { describe, it, expect } from 'vitest';
import { computeRankings } from '@/scripts/lib/ranking';
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
    contributorsCount: 5,
    category: 'testing',
    tags: ['test'],
    language: 'TypeScript',
    license: 'MIT',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastCommitDate: new Date().toISOString(),
    codeSignals: {
      hasSkillMd: true,
      hasTests: false,
      hasCI: false,
      hasDocker: false,
      hasTypes: false,
    },
    rank: 0,
    rankScore: 0,
    ...overrides,
  } as Skill;
}

describe('computeRankings', () => {
  it('returns a ranking result for each skill', () => {
    const skills = [makeSkill({ slug: 'a' }), makeSkill({ slug: 'b' })];
    const results = computeRankings(skills, {});
    expect(results).toHaveLength(2);
  });

  it('ranks higher-starred skills above lower-starred ones (no velocity)', () => {
    const skills = [
      makeSkill({ slug: 'low', stars: 10, lastCommitDate: undefined, updatedAt: undefined }),
      makeSkill({ slug: 'high', stars: 1000, lastCommitDate: undefined, updatedAt: undefined }),
    ];
    const results = computeRankings(skills, {});
    expect(results[0].slug).toBe('high');
  });

  it('score is between 0 and 100', () => {
    const skills = [makeSkill({ slug: 'a', stars: 50 })];
    const results = computeRankings(skills, {});
    expect(results[0].score).toBeGreaterThanOrEqual(0);
    expect(results[0].score).toBeLessThanOrEqual(100);
  });

  it('handles skills with zero stars', () => {
    const skills = [makeSkill({ slug: 'zero', stars: 0 })];
    const results = computeRankings(skills, {});
    expect(results).toHaveLength(1);
    expect(results[0].score).toBeGreaterThanOrEqual(0);
  });

  it('computes positive velocity when star count increased', () => {
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const pastDate = thirtyDaysAgo.toISOString().split('T')[0];

    const skills = [makeSkill({ slug: 'growing', stars: 200 })];
    const history = {
      [pastDate]: { growing: { stars: 100, forks: 5 } },
      [today]: { growing: { stars: 200, forks: 10 } },
    };
    const results = computeRankings(skills, history);
    expect(results[0].velocity).toBe(100);
  });

  it('returns sorted results (highest score first)', () => {
    const skills = [
      makeSkill({ slug: 'low', stars: 1, description: undefined }),
      makeSkill({ slug: 'mid', stars: 500 }),
      makeSkill({ slug: 'high', stars: 10000 }),
    ];
    const results = computeRankings(skills, {});
    expect(results[0].score).toBeGreaterThanOrEqual(results[1].score);
    expect(results[1].score).toBeGreaterThanOrEqual(results[2].score);
  });
});
