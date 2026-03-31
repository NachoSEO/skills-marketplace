import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
// @ts-ignore - @xenova/transformers types are not bundled
import { pipeline } from '@xenova/transformers';
import type { Skill } from '../types';
import { buildSafeSkillText } from '../lib/guardrails';

const MODEL = 'Xenova/all-MiniLM-L6-v2';
const DIMENSIONS = 384;
const BATCH_SIZE = 32;

const skillsDataPath = path.join(__dirname, '../data/skills-data.json');
const outputPath = path.join(__dirname, '../data/embeddings.json');

interface EmbeddingsOutput {
  version: string;
  generatedAt: string;
  model: string;
  dimensions: number;
  embeddings: Record<string, number[]>;
}

async function main() {
  if (!fs.existsSync(skillsDataPath)) {
    console.error('skills-data.json not found. Run generate:skills first.');
    process.exit(1);
  }

  const skills: Skill[] = JSON.parse(fs.readFileSync(skillsDataPath, 'utf-8'));
  console.log(`Loaded ${skills.length} skills`);

  // Load existing embeddings to support incremental updates
  let existing: EmbeddingsOutput = {
    version: '1.0',
    generatedAt: new Date().toISOString(),
    model: MODEL,
    dimensions: DIMENSIONS,
    embeddings: {},
  };

  if (fs.existsSync(outputPath)) {
    try {
      existing = JSON.parse(fs.readFileSync(outputPath, 'utf-8')) as EmbeddingsOutput;
      // Reset if model changed (e.g. migrating from OpenAI 1536-dim to MiniLM 384-dim)
      if (existing.model !== MODEL) {
        console.log(`Model changed from ${existing.model} to ${MODEL}, regenerating all embeddings`);
        existing.embeddings = {};
      } else {
        console.log(`Found ${Object.keys(existing.embeddings).length} existing embeddings (incremental mode)`);
      }
    } catch {
      console.warn('Could not parse existing embeddings.json, starting fresh');
    }
  }

  const pending = skills.filter((s) => !existing.embeddings[s.slug]);
  console.log(`${pending.length} skills need embeddings`);

  if (pending.length === 0) {
    console.log('All embeddings are up to date.');
    return;
  }

  console.log('Loading Transformers.js model (may download ~90MB on first run)...');
  const extractor = await pipeline('feature-extraction', MODEL);

  const startTime = Date.now();
  let processed = 0;

  for (let i = 0; i < pending.length; i += BATCH_SIZE) {
    const batch = pending.slice(i, i + BATCH_SIZE);
    const texts = batch.map(buildSafeSkillText);

    const output = await extractor(texts, { pooling: 'mean', normalize: true });
    const data = output.data as Float32Array;

    for (let j = 0; j < batch.length; j++) {
      existing.embeddings[batch[j].slug] = Array.from(
        data.slice(j * DIMENSIONS, (j + 1) * DIMENSIONS)
      );
    }

    processed += batch.length;
    console.log(`Progress: ${processed}/${pending.length}`);
  }

  existing.generatedAt = new Date().toISOString();
  existing.model = MODEL;
  existing.dimensions = DIMENSIONS;

  // Remove embeddings for skills no longer in the registry
  const validSlugs = new Set(skills.map((s) => s.slug));
  for (const slug of Object.keys(existing.embeddings)) {
    if (!validSlugs.has(slug)) {
      delete existing.embeddings[slug];
    }
  }

  fs.writeFileSync(outputPath, JSON.stringify(existing));

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\nDone! Wrote ${Object.keys(existing.embeddings).length} embeddings in ${elapsed}s`);
  console.log(`Output: ${outputPath}`);
}

main();
