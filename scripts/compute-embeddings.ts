import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import type { Skill } from '../types';
import { buildSafeSkillText } from '../lib/guardrails';

const OPENAI_API_URL = 'https://api.openai.com/v1/embeddings';
const MODEL = 'text-embedding-3-small';
const BATCH_SIZE = 100;
const RATE_LIMIT_DELAY_MS = 200;

const skillsDataPath = path.join(__dirname, '../data/skills-data.json');
const outputPath = path.join(__dirname, '../data/embeddings.json');

interface EmbeddingsOutput {
  version: string;
  generatedAt: string;
  model: string;
  dimensions: number;
  embeddings: Record<string, number[]>;
}

async function fetchEmbeddingsBatch(texts: string[], apiKey: string): Promise<number[][]> {
  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      input: texts,
      encoding_format: 'float',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error ${response.status}: ${error}`);
  }

  const data = await response.json() as { data: { embedding: number[]; index: number }[] };
  // Sort by index to preserve order
  return data.data
    .sort((a, b) => a.index - b.index)
    .map((d) => d.embedding);
}

async function main() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('OPENAI_API_KEY environment variable is required');
    process.exit(1);
  }

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
    dimensions: 1536,
    embeddings: {},
  };

  if (fs.existsSync(outputPath)) {
    try {
      existing = JSON.parse(fs.readFileSync(outputPath, 'utf-8')) as EmbeddingsOutput;
      console.log(`Found ${Object.keys(existing.embeddings).length} existing embeddings (incremental mode)`);
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

  const startTime = Date.now();
  let processed = 0;

  for (let i = 0; i < pending.length; i += BATCH_SIZE) {
    const batch = pending.slice(i, i + BATCH_SIZE);
    const texts = batch.map(buildSafeSkillText);

    try {
      const batchEmbeddings = await fetchEmbeddingsBatch(texts, apiKey);
      for (let j = 0; j < batch.length; j++) {
        existing.embeddings[batch[j].slug] = batchEmbeddings[j];
      }
      processed += batch.length;
      console.log(`Progress: ${processed}/${pending.length} (batch ${Math.ceil((i + 1) / BATCH_SIZE)}/${Math.ceil(pending.length / BATCH_SIZE)})`);
    } catch (err) {
      console.error(`Batch ${i / BATCH_SIZE + 1} failed:`, err);
      // Save progress before exiting
      existing.generatedAt = new Date().toISOString();
      fs.writeFileSync(outputPath, JSON.stringify(existing, null, 2));
      console.log(`Saved partial progress (${processed} embeddings) to ${outputPath}`);
      process.exit(1);
    }

    if (i + BATCH_SIZE < pending.length) {
      await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_DELAY_MS));
    }
  }

  existing.generatedAt = new Date().toISOString();
  existing.model = MODEL;
  existing.dimensions = 1536;

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
