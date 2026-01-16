const fs = require("fs");
const skills = require("../data/skills-data.json");

// Knowledge base for generating quality content
const categoryKnowledge = {
  "ai-llm": {
    domain: "AI and language model integration",
    useCases: [
      "Enhance AI coding assistance with specialized capabilities",
      "Integrate multiple LLM providers and models",
      "Build intelligent automation workflows"
    ],
    benefits: ["Improved AI responses", "Extended capabilities", "Better context handling"],
    considerations: ["Token usage optimization", "Model compatibility", "API configuration"]
  },
  "development-tools": {
    domain: "software development tooling",
    useCases: [
      "Streamline development workflows and reduce friction",
      "Automate repetitive coding tasks",
      "Improve code quality and maintainability"
    ],
    benefits: ["Faster development cycles", "Reduced manual work", "Consistent code patterns"],
    considerations: ["Tool integration complexity", "Learning curve for new patterns", "Project-specific customization"]
  },
  "productivity": {
    domain: "developer productivity enhancement",
    useCases: [
      "Accelerate common development tasks",
      "Reduce context switching and interruptions",
      "Automate administrative overhead"
    ],
    benefits: ["Time savings", "Focus on high-value work", "Reduced cognitive load"],
    considerations: ["Workflow adaptation", "Personal preference alignment", "Setup investment"]
  },
  "document-processing": {
    domain: "document creation and transformation",
    useCases: [
      "Generate and edit documents programmatically",
      "Convert between document formats",
      "Extract and process document content"
    ],
    benefits: ["Automated document workflows", "Format consistency", "Batch processing"],
    considerations: ["Format-specific limitations", "Complex layout handling", "Output quality review"]
  },
  "creative-design": {
    domain: "visual design and creative content",
    useCases: [
      "Generate visual assets and designs",
      "Create diagrams and visualizations",
      "Produce creative content with AI assistance"
    ],
    benefits: ["Rapid visual prototyping", "Consistent design output", "Creative exploration"],
    considerations: ["Design skill requirements", "Brand guideline adherence", "Output refinement"]
  },
  "data-analysis": {
    domain: "data processing and analytics",
    useCases: [
      "Analyze datasets and extract insights",
      "Generate reports and visualizations",
      "Process and transform data efficiently"
    ],
    benefits: ["Data-driven insights", "Automated analysis", "Visual data presentation"],
    considerations: ["Data format requirements", "Analysis accuracy validation", "Large dataset handling"]
  },
  "devops-cicd": {
    domain: "DevOps and continuous integration",
    useCases: [
      "Automate deployment and infrastructure tasks",
      "Manage CI/CD pipelines",
      "Monitor and maintain systems"
    ],
    benefits: ["Deployment automation", "Infrastructure as code", "Operational efficiency"],
    considerations: ["Infrastructure access requirements", "Security configuration", "Environment-specific setup"]
  },
  "business-marketing": {
    domain: "business and marketing operations",
    useCases: [
      "Create marketing content and campaigns",
      "Analyze business metrics and performance",
      "Automate business workflows"
    ],
    benefits: ["Marketing efficiency", "Content scalability", "Data-driven decisions"],
    considerations: ["Brand voice customization", "Market-specific adaptation", "Compliance requirements"]
  },
  "automation": {
    domain: "workflow and task automation",
    useCases: [
      "Automate repetitive processes",
      "Build intelligent automation pipelines",
      "Reduce manual intervention in workflows"
    ],
    benefits: ["Process efficiency", "Consistent execution", "Time savings"],
    considerations: ["Automation scope definition", "Error handling setup", "Monitoring requirements"]
  },
  "communication": {
    domain: "team and project communication",
    useCases: [
      "Draft professional communications",
      "Manage team notifications and updates",
      "Automate communication workflows"
    ],
    benefits: ["Consistent messaging", "Time-efficient communication", "Professional output"],
    considerations: ["Tone customization", "Audience appropriateness", "Context accuracy"]
  },
  "security": {
    domain: "security analysis and testing",
    useCases: [
      "Identify security vulnerabilities",
      "Perform security audits and assessments",
      "Implement security best practices"
    ],
    benefits: ["Proactive security", "Vulnerability detection", "Compliance support"],
    considerations: ["Security expertise requirements", "False positive handling", "Authorized testing only"]
  },
  "web-scraping": {
    domain: "web data extraction and processing",
    useCases: [
      "Extract content from websites",
      "Monitor web changes and updates",
      "Build data collection pipelines"
    ],
    benefits: ["Automated data collection", "Content aggregation", "Research efficiency"],
    considerations: ["Website terms of service", "Rate limiting", "Data accuracy verification"]
  },
  "seo-search": {
    domain: "search engine optimization",
    useCases: [
      "Analyze and improve search rankings",
      "Optimize content for search engines",
      "Track SEO performance metrics"
    ],
    benefits: ["Improved visibility", "Data-driven optimization", "Competitive analysis"],
    considerations: ["SEO knowledge requirements", "Algorithm changes", "Long-term strategy"]
  },
  "translation-localization": {
    domain: "translation and internationalization",
    useCases: [
      "Translate content across languages",
      "Manage localization workflows",
      "Maintain translation consistency"
    ],
    benefits: ["Multi-language support", "Consistent translations", "Localization efficiency"],
    considerations: ["Translation accuracy review", "Cultural context", "Format preservation"]
  }
};

// Skill-specific enrichments based on name patterns - these ALWAYS take priority
function getSkillSpecificContent(skill) {
  const name = skill.name.toLowerCase();
  const tags = (skill.tags || []).join(' ').toLowerCase();
  const desc = (skill.description || '').toLowerCase();
  const combined = `${name} ${tags} ${desc}`;

  // Memory/context skills - HIGH PRIORITY
  if (combined.includes('memory') || combined.includes('context') || name.includes('beads') || name.includes('mem')) {
    return {
      focus: "persistent memory and context management",
      domain: "AI context and memory management",
      keyFeature: "Maintains conversation context and coding decisions across sessions, enabling Claude to build on previous work without repeated explanations",
      useCases: [
        "Maintain context across long-running projects",
        "Remember coding patterns and preferences",
        "Build cumulative knowledge over time"
      ],
      specificPros: ["Cross-session context retention", "Intelligent pattern learning", "Reduced repetitive explanations"],
      specificCons: ["Token usage increases with memory size", "Periodic memory curation recommended"]
    };
  }

  // MCP/integration skills
  if (combined.includes('mcp') && !name.includes('skill')) {
    return {
      focus: "Model Context Protocol integration",
      domain: "MCP server integration",
      keyFeature: "Extends Claude Code through the Model Context Protocol, enabling integration with external tools, APIs, and services",
      useCases: [
        "Connect Claude to external services and APIs",
        "Build custom tool integrations",
        "Extend capabilities beyond built-in features"
      ],
      specificPros: ["Standardized integration protocol", "External service connectivity", "Extensible architecture"],
      specificCons: ["MCP server setup required", "Protocol understanding helpful"]
    };
  }

  // N8n/workflow automation skills - CHECK BEFORE flow/orchestration since "workflow" contains "flow"
  if (combined.includes('n8n')) {
    return {
      focus: "n8n workflow automation",
      domain: "n8n workflow development",
      keyFeature: "Build and manage n8n automation workflows with AI assistance, leveraging n8n's visual workflow designer and 500+ integrations",
      useCases: [
        "Design complex automation workflows",
        "Integrate with hundreds of services",
        "Automate business processes"
      ],
      specificPros: ["Visual workflow design", "500+ integrations available", "No-code/low-code approach"],
      specificCons: ["n8n platform setup required", "Workflow debugging skills helpful"]
    };
  }

  // Flow/orchestration skills
  if (name.includes('flow') || name.includes('orchestrat') || combined.includes('multi-agent') || combined.includes('swarm')) {
    return {
      focus: "agent orchestration and workflow coordination",
      domain: "multi-agent coordination",
      keyFeature: "Orchestrates multiple AI agents working in coordination, managing task distribution, communication, and result aggregation",
      useCases: [
        "Coordinate multiple agents on complex tasks",
        "Build autonomous development workflows",
        "Manage parallel agent execution"
      ],
      specificPros: ["Multi-agent coordination", "Parallel task execution", "Workflow automation"],
      specificCons: ["Orchestration complexity", "Resource management needed"]
    };
  }

  // Git/version control skills
  if (name.includes('git') || tags.includes('git') || combined.includes('version control')) {
    return {
      focus: "Git and version control automation",
      domain: "version control management",
      keyFeature: "Automates Git operations from commits to complex branching strategies, ensuring consistent version control practices",
      useCases: [
        "Automate commit and branch workflows",
        "Manage complex merge operations",
        "Enforce commit conventions"
      ],
      specificPros: ["Git workflow automation", "Consistent commit practices", "Branch management"],
      specificCons: ["Git knowledge recommended", "Repository access required"]
    };
  }

  // Testing skills
  if (name.includes('test') || tags.includes('testing') || tags.includes('tdd') || combined.includes('test-driven')) {
    return {
      focus: "automated testing and quality assurance",
      domain: "testing and QA",
      keyFeature: "Enhances testing workflows with AI-assisted test generation, failure analysis, and coverage optimization",
      useCases: [
        "Generate comprehensive test suites",
        "Analyze and fix failing tests",
        "Improve test coverage systematically"
      ],
      specificPros: ["Automated test generation", "Failure root cause analysis", "Coverage improvement"],
      specificCons: ["Test framework knowledge helpful", "Edge case review recommended"]
    };
  }

  // Documentation skills
  if (combined.includes('doc') && (combined.includes('generat') || combined.includes('maintain') || combined.includes('auto'))) {
    return {
      focus: "documentation generation and maintenance",
      domain: "documentation automation",
      keyFeature: "Automatically generates and maintains project documentation, keeping it synchronized with code changes",
      useCases: [
        "Generate API documentation",
        "Maintain README and guides",
        "Document code changes automatically"
      ],
      specificPros: ["Auto-generated documentation", "Code-doc synchronization", "Multiple format support"],
      specificCons: ["Documentation style customization needed", "Accuracy verification recommended"]
    };
  }

  // React/frontend skills
  if (combined.includes('react') || (combined.includes('frontend') && combined.includes('component'))) {
    return {
      focus: "React and frontend development",
      domain: "React development",
      keyFeature: "Accelerates React development with component generation, hook patterns, and state management best practices",
      useCases: [
        "Generate React components quickly",
        "Implement modern hook patterns",
        "Build responsive user interfaces"
      ],
      specificPros: ["Component scaffolding", "Hook pattern guidance", "TypeScript support"],
      specificCons: ["React version compatibility", "Project structure assumptions"]
    };
  }

  // TypeScript skills
  if (combined.includes('typescript') && (combined.includes('master') || combined.includes('type') || combined.includes('generic'))) {
    return {
      focus: "TypeScript development and type safety",
      domain: "TypeScript development",
      keyFeature: "Enhances TypeScript development with advanced type patterns, generics, and type-safe code generation",
      useCases: [
        "Generate type-safe code",
        "Implement complex type patterns",
        "Migrate JavaScript to TypeScript"
      ],
      specificPros: ["Advanced type pattern support", "Type inference optimization", "Generic implementation"],
      specificCons: ["TypeScript project required", "Strict mode considerations"]
    };
  }

  // AWS/cloud skills
  if (combined.includes('aws') || (combined.includes('cloud') && combined.includes('deploy'))) {
    return {
      focus: "AWS cloud infrastructure and services",
      domain: "AWS cloud development",
      keyFeature: "Simplifies AWS development with service integration patterns, infrastructure as code, and deployment automation",
      useCases: [
        "Configure AWS services",
        "Write infrastructure as code",
        "Automate cloud deployments"
      ],
      specificPros: ["AWS service expertise", "IaC pattern guidance", "Cost optimization tips"],
      specificCons: ["AWS account required", "IAM permissions needed"]
    };
  }

  // Security/audit skills
  if (combined.includes('security') || combined.includes('audit') || combined.includes('vulnerab')) {
    return {
      focus: "security analysis and vulnerability detection",
      domain: "security assessment",
      keyFeature: "Identifies security vulnerabilities, performs code audits, and provides remediation guidance",
      useCases: [
        "Scan code for security issues",
        "Perform security audits",
        "Generate remediation plans"
      ],
      specificPros: ["Automated vulnerability detection", "Security best practices", "Remediation guidance"],
      specificCons: ["Security expertise helpful for triage", "Manual validation recommended"]
    };
  }

  // SEO skills
  if (combined.includes('seo') || combined.includes('search engine')) {
    return {
      focus: "search engine optimization",
      domain: "SEO optimization",
      keyFeature: "Analyzes and optimizes content for search engines with actionable recommendations and performance tracking",
      useCases: [
        "Audit pages for SEO issues",
        "Optimize content for keywords",
        "Track search performance"
      ],
      specificPros: ["Comprehensive SEO audits", "Keyword optimization", "Competitor analysis"],
      specificCons: ["SEO fundamentals helpful", "Results require time to materialize"]
    };
  }

  // Prompt engineering skills
  if (combined.includes('prompt') && (combined.includes('engineer') || combined.includes('optim') || combined.includes('coach'))) {
    return {
      focus: "prompt engineering and optimization",
      domain: "prompt optimization",
      keyFeature: "Improves AI interactions through systematic prompt construction, testing, and refinement techniques",
      useCases: [
        "Craft more effective prompts",
        "Optimize for specific outputs",
        "Reduce token usage"
      ],
      specificPros: ["Prompt quality improvement", "Response consistency", "Token efficiency"],
      specificCons: ["Experimentation required", "Model-specific tuning needed"]
    };
  }

  // Agent/multi-agent skills
  if (combined.includes('agent') && (combined.includes('team') || combined.includes('multi') || combined.includes('squad'))) {
    return {
      focus: "AI agent team coordination",
      domain: "multi-agent systems",
      keyFeature: "Coordinates teams of specialized AI agents with defined roles, enabling complex tasks through division of labor",
      useCases: [
        "Assign specialized agent roles",
        "Coordinate parallel work",
        "Aggregate results from multiple agents"
      ],
      specificPros: ["Specialized agent roles", "Task parallelization", "Coordinated execution"],
      specificCons: ["Resource intensive", "Coordination overhead"]
    };
  }

  // Database skills
  if (combined.includes('postgres') || combined.includes('mysql') || combined.includes('mongodb') || combined.includes('database')) {
    return {
      focus: "database operations and optimization",
      domain: "database development",
      keyFeature: "Assists with database queries, schema design, migrations, and performance optimization",
      useCases: [
        "Generate optimized queries",
        "Design database schemas",
        "Manage migrations safely"
      ],
      specificPros: ["Query optimization", "Schema assistance", "Migration support"],
      specificCons: ["Database access required", "Query review recommended for production"]
    };
  }

  // Image/media skills
  if (combined.includes('image') || combined.includes('video') || combined.includes('gif') || combined.includes('media')) {
    return {
      focus: "media creation and processing",
      domain: "media processing",
      keyFeature: "Generates, transforms, and optimizes images, videos, and other media assets for various platforms",
      useCases: [
        "Generate visual content",
        "Optimize media for web",
        "Convert between formats"
      ],
      specificPros: ["Automated media processing", "Format optimization", "Platform-specific output"],
      specificCons: ["Processing time for large files", "Quality vs size trade-offs"]
    };
  }

  // Browser/playwright skills
  if (combined.includes('playwright') || combined.includes('browser') || combined.includes('puppeteer')) {
    return {
      focus: "browser automation and testing",
      domain: "browser automation",
      keyFeature: "Automates browser interactions for testing, scraping, and workflow automation across Chromium, Firefox, and WebKit",
      useCases: [
        "Automate UI testing",
        "Scrape dynamic content",
        "Automate web workflows"
      ],
      specificPros: ["Cross-browser support", "Screenshot capture", "Network interception"],
      specificCons: ["Browser installation required", "Test stability considerations"]
    };
  }

  // CLI/statusline skills
  if (combined.includes('statusline') || combined.includes('status line') || (combined.includes('cli') && combined.includes('tool'))) {
    return {
      focus: "CLI customization and status display",
      domain: "terminal customization",
      keyFeature: "Enhances terminal experience with real-time status information, usage tracking, and visual indicators",
      useCases: [
        "Display context at a glance",
        "Track usage and costs",
        "Monitor agent activity"
      ],
      specificPros: ["Real-time status display", "Usage tracking", "Customizable format"],
      specificCons: ["Terminal emulator dependent", "Configuration setup needed"]
    };
  }

  // Skill management/marketplace skills
  if (combined.includes('skill') && (combined.includes('market') || combined.includes('hub') || combined.includes('collect') || combined.includes('awesome'))) {
    return {
      focus: "Claude Code skill discovery and management",
      domain: "skill ecosystem",
      keyFeature: "Curates and organizes Claude Code skills, helping you discover and manage extensions for your workflow",
      useCases: [
        "Discover new skills",
        "Organize installed skills",
        "Find alternatives for specific needs"
      ],
      specificPros: ["Skill discovery", "Organized collection", "Community curation"],
      specificCons: ["Quality varies across skills", "Regular updates needed"]
    };
  }

  // Workflow/planning skills
  if (combined.includes('plan') && (combined.includes('workflow') || combined.includes('spec') || combined.includes('driven'))) {
    return {
      focus: "structured planning and specification",
      domain: "development planning",
      keyFeature: "Transforms requirements into structured plans with clear specifications, enabling systematic development",
      useCases: [
        "Create detailed specifications",
        "Plan implementation steps",
        "Track development progress"
      ],
      specificPros: ["Structured planning", "Clear specifications", "Progress tracking"],
      specificCons: ["Upfront planning investment", "Methodology adoption needed"]
    };
  }

  // PDF/document format skills
  if (name.includes('pdf') || name.includes('docx') || name.includes('pptx') || name.includes('xlsx')) {
    const format = name.toLowerCase();
    return {
      focus: `${format.toUpperCase()} document processing`,
      domain: "document processing",
      keyFeature: `Creates, reads, and modifies ${format.toUpperCase()} documents programmatically with full formatting support`,
      useCases: [
        `Generate ${format.toUpperCase()} documents`,
        "Extract content from documents",
        "Batch process document files"
      ],
      specificPros: ["Full format support", "Programmatic creation", "Batch processing"],
      specificCons: ["Complex layouts may need refinement", "Large file handling considerations"]
    };
  }

  // Default - return null to use category
  return null;
}

function enrichSkill(skill) {
  const specific = getSkillSpecificContent(skill);
  const categoryInfo = categoryKnowledge[skill.category] || categoryKnowledge["development-tools"];

  // Use specific content if available, otherwise use category
  const effectiveCategory = specific ? {
    domain: specific.domain || categoryInfo.domain,
    useCases: specific.useCases || categoryInfo.useCases,
    benefits: categoryInfo.benefits,
    considerations: categoryInfo.considerations
  } : categoryInfo;

  const name = skill.name;
  const language = skill.language;
  const stars = skill.stars || 0;

  // Generate rich description - prioritize specific, then existing good description, then generate
  let description;
  if (specific && specific.keyFeature) {
    description = specific.keyFeature.split('.')[0]; // First sentence only for description
    if (description.length > 140) {
      description = description.substring(0, 137) + "...";
    }
  } else if (skill.description && skill.description.length >= 50 && skill.description.length <= 150) {
    description = skill.description; // Keep good existing descriptions
  } else {
    description = `${name} provides specialized ${effectiveCategory.domain} capabilities for Claude Code developers`;
    if (description.length > 140) {
      description = description.substring(0, 137) + "...";
    }
  }

  // Generate detailed AI description
  let aiDescription;
  if (specific && specific.keyFeature) {
    aiDescription = `${specific.keyFeature}. Use it to ${effectiveCategory.useCases[0].toLowerCase()}.`;
    if (language && stars > 50) {
      aiDescription += ` Built with ${language} and trusted by ${stars > 1000 ? 'thousands' : 'hundreds'} of developers.`;
    }
  } else {
    aiDescription = `${name} enhances Claude Code with ${effectiveCategory.domain} capabilities. ${effectiveCategory.useCases[0]}.`;
    if (language) {
      aiDescription += ` Written in ${language} for reliable integration.`;
    }
  }

  // Ensure good length
  if (aiDescription.length < 120) {
    aiDescription += ` Integrates seamlessly with your development workflow.`;
  }
  if (aiDescription.length > 380) {
    aiDescription = aiDescription.substring(0, 377) + "...";
  }

  // Generate pros - prioritize specific
  let pros;
  if (specific && specific.specificPros) {
    pros = specific.specificPros;
  } else {
    pros = [
      `${effectiveCategory.domain.split(' ')[0].charAt(0).toUpperCase() + effectiveCategory.domain.split(' ')[0].slice(1)} expertise`,
      "Seamless Claude Code integration",
      effectiveCategory.benefits[0]
    ];
  }

  // Generate cons - prioritize specific
  let cons;
  if (specific && specific.specificCons) {
    cons = specific.specificCons;
  } else {
    cons = effectiveCategory.considerations.slice(0, 2);
  }

  // Generate rich SEO content
  const seoContent = generateRichSeoContent(skill, effectiveCategory, specific, description, aiDescription, pros, cons);

  return {
    ...skill,
    description,
    aiDescription,
    pros,
    cons,
    seoContent
  };
}

function generateRichSeoContent(skill, category, specific, description, aiDescription, pros, cons) {
  const name = skill.name;
  const tags = skill.tags || [];
  const language = skill.language;
  const stars = skill.stars || 0;
  const license = skill.license;
  const author = skill.author;

  const tagSection = tags.length > 0
    ? `\n\n## Related Topics\n\nThis skill works with: ${tags.slice(0, 6).map(t => `**${t}**`).join(', ')}.`
    : '';

  let technicalSection = '';
  if (language || license || stars > 0) {
    technicalSection = `\n\n## Technical Information\n\n`;
    if (language) technicalSection += `- **Implementation**: ${language}\n`;
    if (license) technicalSection += `- **License**: ${license}\n`;
    if (stars > 0) technicalSection += `- **GitHub Stars**: ${stars.toLocaleString()}\n`;
    if (author) technicalSection += `- **Maintainer**: ${author}\n`;
  }

  const specificSection = specific
    ? `\n\n## Why Choose ${name}?\n\n${name} specializes in ${specific.focus}, making it ideal when you need dedicated support in this area. It provides targeted functionality rather than generic capabilities, resulting in better outcomes for ${specific.domain} tasks.`
    : '';

  return `## What is ${name}?

${aiDescription}

## Key Capabilities

${pros.map(p => `- **${p}**: Built-in support to help you work more effectively`).join('\n')}

## Typical Use Cases

${category.useCases.map((uc, i) => `${i + 1}. ${uc}`).join('\n')}
${specificSection}

## Getting Started

Install ${name} with the command below, then restart Claude Code. The skill activates automatically and enhances relevant interactions without additional configuration.

\`\`\`bash
${skill.installCommand || `git clone ${skill.githubUrl}`}
\`\`\`

## Considerations

Before installing, keep in mind:

${cons.map(c => `- **${c}**`).join('\n')}
${tagSection}${technicalSection}

## How It Works

${name} integrates directly with Claude Code as a skill, extending capabilities through predefined instructions and knowledge. Once installed, Claude automatically applies the skill's expertise when relevant to your tasks.`;
}

// Process all skills
console.log("Enriching", skills.length, "skills with quality content...\n");

const enrichedSkills = skills.map((skill, index) => {
  const enriched = enrichSkill(skill);
  if ((index + 1) % 50 === 0) {
    console.log(`Processed ${index + 1}/${skills.length} skills`);
  }
  return enriched;
});

// Write enriched data
fs.writeFileSync("./data/skills-data.json", JSON.stringify(enrichedSkills, null, 2));
console.log("\nDone! Enriched all", enrichedSkills.length, "skills with expanded content");

// Show samples
console.log("\n--- Sample: beads (memory skill) ---");
const beads = enrichedSkills.find(s => s.slug === "beads");
console.log("Description:", beads.description);
console.log("AI Description:", beads.aiDescription);
console.log("Pros:", beads.pros);
console.log("Cons:", beads.cons);

console.log("\n--- Sample: n8n-v2-workflow-skill ---");
const n8n = enrichedSkills.find(s => s.slug === "n8n-v2-workflow-skill");
console.log("Description:", n8n.description);
console.log("AI Description:", n8n.aiDescription);
console.log("Pros:", n8n.pros);
console.log("Cons:", n8n.cons);

console.log("\n--- Sample: claude-flow ---");
const flow = enrichedSkills.find(s => s.slug === "claude-flow");
console.log("Description:", flow.description);
console.log("AI Description:", flow.aiDescription);
console.log("Pros:", flow.pros);
console.log("Cons:", flow.cons);
