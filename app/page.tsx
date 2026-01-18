import Link from 'next/link';
import { SearchBar } from '@/components/search/SearchBar';
import { SkillCard } from '@/components/skills/SkillCard';
import { CategoryCard } from '@/components/categories/CategoryCard';
import { HeroSection } from '@/components/home/HeroSection';
import { TerminalDemo } from '@/components/home/TerminalDemo';
import { WhatIsSkillSection } from '@/components/home/WhatIsSkillSection';
import { HowSkillsWorkSection } from '@/components/home/HowSkillsWorkSection';
import { FAQSection } from '@/components/home/FAQSection';
import {
  getSkillsSync,
  getCategories,
  getFeaturedSkills,
  getLatestSkills,
  getSkillCountByCategory,
} from '@/lib/skills';

export default function HomePage() {
  const skills = getSkillsSync();
  const categories = getCategories();
  const featuredSkills = getFeaturedSkills(skills);
  const latestSkills = getLatestSkills(skills, 9);
  const skillCounts = getSkillCountByCategory(skills);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection skillCount={skills.length} categoryCount={categories.length} />

      {/* Terminal Demo Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="opacity-0 fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-terminal/10 text-terminal text-sm font-mono mb-6">
                <span className="w-2 h-2 rounded-full bg-terminal animate-pulse" />
                Quick Install
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                One command.{' '}
                <span className="text-terminal">Instant power.</span>
              </h2>
              <p className="text-lg text-muted mb-8">
                Install skills directly from GitHub into your Claude Code environment.
                No configuration needed. Just clone and go.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/skills"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-terminal text-primary-foreground font-medium hover:bg-terminal/90 transition-all hover:shadow-lg hover:shadow-terminal/20"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Browse Skills
                </Link>
                <a
                  href="https://github.com/anthropics/skills"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border hover:border-terminal/50 font-medium transition-all"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  View Docs
                </a>
              </div>
            </div>
            <div className="opacity-0 fade-in-up" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
              <TerminalDemo />
            </div>
          </div>
        </div>
      </section>

      {/* What's a Skill */}
      <WhatIsSkillSection />

      {/* Featured Skills */}
      <section className="py-20 bg-card/50 relative">
        <div className="absolute inset-0 noise" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="font-mono text-terminal text-sm mb-2">// featured</div>
              <h2 className="text-3xl font-bold">Top Skills</h2>
            </div>
            <Link
              href="/skills?featured=true"
              className="group flex items-center gap-2 text-sm font-medium text-muted hover:text-terminal transition-colors"
            >
              View all
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredSkills.slice(0, 6).map((skill, index) => (
              <div
                key={skill.id}
                className="opacity-0 fade-in-up"
                style={{ animationDelay: `${0.1 * (index + 1)}s`, animationFillMode: 'forwards' }}
              >
                <SkillCard skill={skill} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How Skills Work */}
      <HowSkillsWorkSection />

      {/* Categories */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="font-mono text-terminal text-sm mb-2">// categories</div>
              <h2 className="text-3xl font-bold">Browse by Type</h2>
            </div>
            <Link
              href="/categories"
              className="group flex items-center gap-2 text-sm font-medium text-muted hover:text-terminal transition-colors"
            >
              All categories
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.slice(0, 12).map((category, index) => (
              <div
                key={category.id}
                className="opacity-0 fade-in-up"
                style={{ animationDelay: `${0.05 * (index + 1)}s`, animationFillMode: 'forwards' }}
              >
                <CategoryCard
                  category={category}
                  skillCount={skillCounts[category.slug] || 0}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All Skills Preview */}
      <section className="py-20 bg-card/50 relative">
        <div className="absolute inset-0 noise" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="font-mono text-terminal text-sm mb-2">// all_skills</div>
              <h2 className="text-3xl font-bold">Latest Additions</h2>
            </div>
            <Link
              href="/skills"
              className="group flex items-center gap-2 text-sm font-medium text-muted hover:text-terminal transition-colors"
            >
              Browse all {skills.length}
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestSkills.map((skill, index) => (
              <div
                key={skill.id}
                className="opacity-0 fade-in-up"
                style={{ animationDelay: `${0.05 * (index + 1)}s`, animationFillMode: 'forwards' }}
              >
                <SkillCard skill={skill} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQSection />

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-terminal/5 via-transparent to-accent/5" />
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="font-mono text-terminal text-sm mb-4">// get_started</div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Ready to{' '}
            <span className="text-terminal glow-text">supercharge</span>
            <br />your workflow?
          </h2>
          <p className="text-lg text-muted mb-10 max-w-2xl mx-auto">
            Join thousands of developers using Claude Skills to automate tasks,
            enhance productivity, and build faster.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/skills"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg bg-terminal text-primary-foreground font-medium text-lg hover:bg-terminal/90 transition-all hover:shadow-lg hover:shadow-terminal/20 glow-pulse"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Explore Skills
            </Link>
            <a
              href="https://github.com/anthropics/skills"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg border-2 border-border hover:border-terminal font-medium text-lg transition-all"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              Star on GitHub
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
