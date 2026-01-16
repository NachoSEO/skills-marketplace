import { promises as fs } from 'fs';
import path from 'path';

interface SkillRegistry {
  owner: string;
  repo: string;
  path?: string;
  category: string;
  name?: string;
  description?: string;
  tags?: string[];
  featured?: boolean;
  pros?: string[];
  cons?: string[];
  rating?: number;
}

// Category-based pros/cons templates
const categoryTemplates: Record<string, { defaultPros: string[]; defaultCons: string[] }> = {
  'document-processing': {
    defaultPros: ['File format support', 'Batch processing', 'Format preservation'],
    defaultCons: ['Large files may be slow', 'Format-specific limitations'],
  },
  'creative-design': {
    defaultPros: ['Creative flexibility', 'Visual output', 'Customizable styles'],
    defaultCons: ['Requires design context', 'Output quality varies'],
  },
  'development-tools': {
    defaultPros: ['Developer-focused', 'Workflow integration', 'Code quality'],
    defaultCons: ['Setup required', 'Learning curve'],
  },
  'ai-llm': {
    defaultPros: ['AI-powered automation', 'Intelligent processing', 'Adaptive behavior'],
    defaultCons: ['API costs may apply', 'Results may vary'],
  },
  'data-analysis': {
    defaultPros: ['Data insights', 'Visualization support', 'Analysis automation'],
    defaultCons: ['Data format requirements', 'Large datasets need tuning'],
  },
  'productivity': {
    defaultPros: ['Time-saving', 'Task automation', 'Workflow optimization'],
    defaultCons: ['Initial setup time', 'Workflow-specific'],
  },
  'security': {
    defaultPros: ['Security-focused', 'Best practices', 'Threat awareness'],
    defaultCons: ['Requires security knowledge', 'Context-dependent'],
  },
  'devops-cicd': {
    defaultPros: ['CI/CD integration', 'Automation support', 'Deployment ready'],
    defaultCons: ['Infrastructure knowledge needed', 'Platform-specific'],
  },
  'communication': {
    defaultPros: ['Clear communication', 'Template support', 'Professional output'],
    defaultCons: ['Style preferences vary', 'Context needed'],
  },
  'business-marketing': {
    defaultPros: ['Business-focused', 'Professional output', 'Brand consistency'],
    defaultCons: ['Industry-specific', 'Customization needed'],
  },
  'web-scraping': {
    defaultPros: ['Data extraction', 'Automation support', 'Multiple formats'],
    defaultCons: ['Site-specific tuning', 'Rate limiting considerations'],
  },
  'automation': {
    defaultPros: ['Task automation', 'Workflow integration', 'Time-saving'],
    defaultCons: ['Initial configuration', 'Platform dependencies'],
  },
  'seo-search': {
    defaultPros: ['SEO optimization', 'Search insights', 'Content improvement'],
    defaultCons: ['Algorithm changes', 'Results take time'],
  },
  'translation-localization': {
    defaultPros: ['Multi-language support', 'Consistent translations', 'Format preservation'],
    defaultCons: ['Context nuances', 'Review recommended'],
  },
};

// Generate skill-specific pros based on description and tags
function generatePros(skill: SkillRegistry): string[] {
  const pros: string[] = [];
  const desc = (skill.description || '').toLowerCase();
  const name = (skill.name || skill.repo).toLowerCase();
  const tags = skill.tags || [];

  // Check for official skills
  if (skill.owner === 'anthropics') {
    pros.push('Official Anthropic skill');
  }

  // Check for featured
  if (skill.featured) {
    pros.push('Community favorite');
  }

  // Check description for features
  if (desc.includes('automat')) pros.push('Automation support');
  if (desc.includes('integrat')) pros.push('Easy integration');
  if (desc.includes('template')) pros.push('Template support');
  if (desc.includes('comprehensive') || desc.includes('complete')) pros.push('Comprehensive feature set');
  if (desc.includes('real-time') || desc.includes('realtime')) pros.push('Real-time processing');
  if (desc.includes('ai') || desc.includes('intelligent')) pros.push('AI-powered');
  if (desc.includes('batch')) pros.push('Batch processing');
  if (desc.includes('api')) pros.push('API integration');
  if (desc.includes('visual')) pros.push('Visual output');
  if (desc.includes('multi') || desc.includes('multiple')) pros.push('Multi-format support');

  // Add from category defaults if needed
  const template = categoryTemplates[skill.category];
  if (template && pros.length < 2) {
    for (const p of template.defaultPros) {
      if (!pros.includes(p) && pros.length < 3) {
        pros.push(p);
      }
    }
  }

  // Ensure at least 2 pros
  if (pros.length < 2) {
    if (!pros.includes('Easy to use')) pros.push('Easy to use');
    if (pros.length < 2 && !pros.includes('Well documented')) pros.push('Well documented');
  }

  return pros.slice(0, 3);
}

// Generate skill-specific cons based on description and category
function generateCons(skill: SkillRegistry): string[] {
  const cons: string[] = [];
  const desc = (skill.description || '').toLowerCase();
  const tags = skill.tags || [];

  // Check for specific requirements
  if (desc.includes('python') || tags.includes('python')) cons.push('Python required');
  if (desc.includes('node') || desc.includes('npm') || tags.includes('nodejs')) cons.push('Node.js required');
  if (desc.includes('docker') || tags.includes('docker')) cons.push('Docker required');
  if (desc.includes('api key') || desc.includes('credentials')) cons.push('API credentials needed');
  if (desc.includes('rust') || tags.includes('rust')) cons.push('Rust toolchain required');
  if (desc.includes('go ') || tags.includes('go') || tags.includes('golang')) cons.push('Go runtime required');

  // Add from category defaults if needed
  const template = categoryTemplates[skill.category];
  if (template && cons.length < 2) {
    for (const c of template.defaultCons) {
      if (!cons.includes(c) && cons.length < 2) {
        cons.push(c);
      }
    }
  }

  // Ensure at least 2 cons
  if (cons.length < 2) {
    if (!cons.includes('Setup required')) cons.push('Setup required');
    if (cons.length < 2 && !cons.includes('Documentation could improve')) cons.push('Community maintained');
  }

  return cons.slice(0, 2);
}

async function main() {
  const registryPath = path.join(process.cwd(), 'data', 'skills-registry.json');
  const content = await fs.readFile(registryPath, 'utf-8');
  const registry: SkillRegistry[] = JSON.parse(content);

  let updated = 0;

  for (const skill of registry) {
    if (!skill.pros || skill.pros.length === 0) {
      skill.pros = generatePros(skill);
      updated++;
    }
    if (!skill.cons || skill.cons.length === 0) {
      skill.cons = generateCons(skill);
    }
  }

  await fs.writeFile(registryPath, JSON.stringify(registry, null, 2));
  console.log(`Updated ${updated} skills with pros/cons`);
}

main().catch(console.error);
