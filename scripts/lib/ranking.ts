import type { Skill } from '../../types';

interface SkillHistory {
  [date: string]: {
    [slug: string]: { stars: number; forks: number };
  };
}

interface RankingResult {
  slug: string;
  score: number;
  velocity: number;
}

export function computeRankings(
  skills: Skill[],
  history: SkillHistory
): RankingResult[] {
  const maxStars = Math.max(...skills.map((s) => s.stars || 0), 1);
  const maxContributors = Math.max(...skills.map((s) => s.contributorsCount || 0), 1);

  // Get dates for velocity calculation
  const dates = Object.keys(history).sort();
  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

  // Find closest historical date to 30 days ago
  const oldDate = dates.find((d) => d >= thirtyDaysAgoStr) || dates[0];
  const oldSnapshot = history[oldDate] || {};
  const currentSnapshot = history[today] || history[dates[dates.length - 1]] || {};

  const results: RankingResult[] = skills.map((skill) => {
    // Stars component: log-normalized 0-1
    const starsScore = Math.log10((skill.stars || 0) + 1) / Math.log10(maxStars + 1);

    // Velocity: star gain over ~30 days
    const oldStars = oldSnapshot[skill.slug]?.stars || 0;
    const currentStars = currentSnapshot[skill.slug]?.stars || skill.stars || 0;
    const starGain = Math.max(0, currentStars - oldStars);
    // Normalize velocity - cap at reasonable max
    const maxVelocity = Math.max(...skills.map((s) => {
      const old = oldSnapshot[s.slug]?.stars || 0;
      const cur = currentSnapshot[s.slug]?.stars || s.stars || 0;
      return Math.max(0, cur - old);
    }), 1);
    const velocityScore = starGain / maxVelocity;

    // Recency: exponential decay based on last commit
    let recencyScore = 0.5; // default if no data
    if (skill.lastCommitDate) {
      const daysSinceCommit = Math.max(0,
        (Date.now() - new Date(skill.lastCommitDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      recencyScore = Math.exp(-daysSinceCommit / 180);
    } else if (skill.updatedAt) {
      const daysSinceUpdate = Math.max(0,
        (Date.now() - new Date(skill.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      recencyScore = Math.exp(-daysSinceUpdate / 180);
    }

    // Community: log-normalized contributors
    const communityScore = Math.log10((skill.contributorsCount || 0) + 1) / Math.log10(maxContributors + 1);

    // Health: binary checks
    let healthScore = 0;
    if (skill.description) healthScore += 0.2;
    if (skill.license) healthScore += 0.2;
    if (skill.codeSignals?.hasSkillMd) healthScore += 0.2;
    // Not archived (always true if it's in our data)
    healthScore += 0.2;
    if (skill.updatedAt) {
      const daysSinceUpdate = (Date.now() - new Date(skill.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceUpdate < 90) healthScore += 0.2; // has recent release/update
    }

    // Composite score
    const score =
      starsScore * 0.30 +
      velocityScore * 0.25 +
      recencyScore * 0.25 +
      communityScore * 0.10 +
      healthScore * 0.10;

    return {
      slug: skill.slug,
      score: Math.round(score * 100),
      velocity: starGain,
    };
  });

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  return results;
}
