import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import type { Skill } from '../types';
import { tokenize, buildVocabulary, computeIDF, computeTFIDFVector, cosineSimilarity } from './lib/tfidf';
import { composeSkillText, computeAlternativeScore, computeRelatedScore } from './lib/similarity';

const skillsDataPath = path.join(__dirname, '../data/skills-data.json');
const readmesDir = path.join(__dirname, '../public/readmes');
const outputPath = path.join(__dirname, '../data/skills-similarities.json');

function main() {
  const startTime = Date.now();
  console.log('Computing skill similarities...\n');

  if (!fs.existsSync(skillsDataPath)) {
    console.error('skills-data.json not found. Run generate:skills first.');
    process.exit(1);
  }

  const skills: Skill[] = JSON.parse(fs.readFileSync(skillsDataPath, 'utf-8'));
  console.log(`Loaded ${skills.length} skills`);

  // Load README content for each skill
  const readmeMap = new Map<string, string>();
  for (const skill of skills) {
    const readmePath = path.join(readmesDir, `${skill.slug}.md`);
    if (fs.existsSync(readmePath)) {
      readmeMap.set(skill.slug, fs.readFileSync(readmePath, 'utf-8'));
    }
  }
  console.log(`Loaded ${readmeMap.size} READMEs`);

  // Compose text and tokenize
  const documents: string[][] = [];
  for (const skill of skills) {
    const text = composeSkillText(skill, readmeMap.get(skill.slug));
    documents.push(tokenize(text));
  }

  // Build TF-IDF
  const vocabulary = buildVocabulary(documents);
  console.log(`Vocabulary size: ${vocabulary.size} terms`);

  const idf = computeIDF(documents, vocabulary);

  // Compute TF-IDF vectors
  const vectors = documents.map((tokens) => computeTFIDFVector(tokens, idf, vocabulary));

  // Compute pairwise similarities
  const totalPairs = (skills.length * (skills.length - 1)) / 2;
  console.log(`Computing ${totalPairs.toLocaleString()} pairwise similarities...`);

  const similarities: Record<string, {
    alternatives: Array<{ slug: string; score: number; semanticScore: number; reason: string }>;
    related: Array<{ slug: string; score: number; semanticScore: number; reason: string }>;
  }> = {};

  for (let i = 0; i < skills.length; i++) {
    const altCandidates: Array<{ slug: string; score: number; semanticScore: number; reason: string }> = [];
    const relCandidates: Array<{ slug: string; score: number; semanticScore: number; reason: string }> = [];

    for (let j = 0; j < skills.length; j++) {
      if (i === j) continue;

      const cosine = cosineSimilarity(vectors[i], vectors[j]);

      // Alternatives: different author
      if (skills[i].author !== skills[j].author) {
        const { score, reason } = computeAlternativeScore(cosine, skills[i], skills[j]);
        altCandidates.push({ slug: skills[j].slug, score, semanticScore: Math.round(cosine * 1000) / 1000, reason });
      }

      // Related: any skill
      const { score, reason } = computeRelatedScore(cosine, skills[i], skills[j]);
      relCandidates.push({ slug: skills[j].slug, score, semanticScore: Math.round(cosine * 1000) / 1000, reason });
    }

    // Sort and take top 8
    altCandidates.sort((a, b) => b.score - a.score);
    relCandidates.sort((a, b) => b.score - a.score);

    similarities[skills[i].slug] = {
      alternatives: altCandidates.slice(0, 8),
      related: relCandidates.slice(0, 8),
    };
  }

  const output = {
    version: '1.0',
    generatedAt: new Date().toISOString(),
    algorithm: 'tfidf-cosine',
    similarities,
  };

  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\nDone! Wrote similarities for ${Object.keys(similarities).length} skills in ${elapsed}s`);
  console.log(`Output: ${outputPath}`);
}

main();
