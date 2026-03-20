import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import type { Skill } from '../types';
import { computeRankings } from './lib/ranking';

const skillsDataPath = path.join(__dirname, '../data/skills-data.json');
const skillsHistoryPath = path.join(__dirname, '../data/skills-history.json');

function main() {
  console.log('Computing rankings...\n');

  if (!fs.existsSync(skillsDataPath)) {
    console.error('skills-data.json not found. Run generate:skills first.');
    process.exit(1);
  }

  const skills: Skill[] = JSON.parse(fs.readFileSync(skillsDataPath, 'utf-8'));

  let history: Record<string, Record<string, { stars: number; forks: number }>> = {};
  if (fs.existsSync(skillsHistoryPath)) {
    try {
      history = JSON.parse(fs.readFileSync(skillsHistoryPath, 'utf-8'));
    } catch {
      history = {};
    }
  }

  const rankings = computeRankings(skills, history);

  // Determine top 10% by velocity for "hot" status
  const velocitySorted = [...rankings].sort((a, b) => b.velocity - a.velocity);
  const hotThresholdIndex = Math.max(1, Math.floor(rankings.length * 0.1));
  const hotThreshold = velocitySorted[hotThresholdIndex - 1]?.velocity || 1;

  // Also compute trending rank (by velocity)
  const trendingMap = new Map<string, number>();
  velocitySorted.forEach((r, i) => trendingMap.set(r.slug, i + 1));

  // Apply rankings to skills
  for (const skill of skills) {
    const ranking = rankings.find((r) => r.slug === skill.slug);
    if (ranking) {
      skill.rank = rankings.indexOf(ranking) + 1;
      skill.rankScore = ranking.score;
      skill.trendingRank = trendingMap.get(skill.slug);
      skill.isHot = ranking.velocity >= hotThreshold && ranking.velocity > 0;
    }
  }

  // Write updated skills data
  fs.writeFileSync(skillsDataPath, JSON.stringify(skills, null, 2));

  console.log(`Rankings computed for ${skills.length} skills`);
  console.log(`Top 5:`);
  rankings.slice(0, 5).forEach((r, i) => {
    const skill = skills.find((s) => s.slug === r.slug);
    console.log(`  #${i + 1} ${skill?.name || r.slug} (score: ${r.score}, velocity: ${r.velocity})`);
  });

  const hotCount = skills.filter((s) => s.isHot).length;
  console.log(`\nHot skills: ${hotCount}`);
}

main();
