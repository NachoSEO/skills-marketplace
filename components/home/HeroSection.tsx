'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { SearchBar } from '@/components/search/SearchBar';

interface HeroSectionProps {
  skillCount: number;
  categoryCount: number;
}

// Pre-defined particle positions to avoid hydration mismatch
const particlePositions = [
  { left: 15, top: 20, duration: 4.5, delay: 0.3 },
  { left: 85, top: 15, duration: 5.2, delay: 1.1 },
  { left: 25, top: 75, duration: 3.8, delay: 0.7 },
  { left: 70, top: 30, duration: 6.1, delay: 1.5 },
  { left: 45, top: 85, duration: 4.2, delay: 0.2 },
  { left: 90, top: 60, duration: 5.5, delay: 1.8 },
  { left: 10, top: 45, duration: 3.5, delay: 0.9 },
  { left: 55, top: 10, duration: 4.8, delay: 1.3 },
  { left: 35, top: 55, duration: 5.8, delay: 0.5 },
  { left: 80, top: 80, duration: 4.0, delay: 1.6 },
  { left: 5, top: 90, duration: 5.3, delay: 0.1 },
  { left: 60, top: 40, duration: 3.9, delay: 1.9 },
  { left: 40, top: 25, duration: 6.0, delay: 0.4 },
  { left: 95, top: 35, duration: 4.3, delay: 1.2 },
  { left: 20, top: 65, duration: 5.0, delay: 0.8 },
  { left: 75, top: 95, duration: 3.7, delay: 1.4 },
  { left: 50, top: 50, duration: 4.6, delay: 0.6 },
  { left: 30, top: 5, duration: 5.7, delay: 1.7 },
  { left: 65, top: 70, duration: 4.1, delay: 1.0 },
  { left: 12, top: 35, duration: 5.4, delay: 0.0 },
];

export function HeroSection({ skillCount, categoryCount }: HeroSectionProps) {
  const [typedText, setTypedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const fullText = 'claude skills install';

  useEffect(() => {
    let index = 0;
    const typeInterval = setInterval(() => {
      if (index <= fullText.length) {
        setTypedText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(typeInterval);
      }
    }, 100);

    return () => clearInterval(typeInterval);
  }, []);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);

    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 grid-bg opacity-40" />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />

      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particlePositions.map((particle, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-terminal/30"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animation: `float ${particle.duration}s ease-in-out infinite`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pb-24">
        {/* Terminal-style badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-terminal/30 bg-terminal/5 mb-8 opacity-0 fade-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
          <span className="w-2 h-2 rounded-full bg-terminal animate-pulse" />
          <span className="font-mono text-sm text-terminal">v1.0 • {skillCount} skills available</span>
        </div>

        {/* Main heading with typing effect */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 opacity-0 fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
          <span className="text-terminal glow-text">SkillsForge</span>
          <span className="block mt-2">for Claude Code</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-muted max-w-2xl mx-auto mb-8 opacity-0 fade-in-up" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
          Discover, install, and manage skills that extend Claude's capabilities.
          From document processing to DevOps automation.
        </p>

        {/* Terminal command preview */}
        <div className="max-w-lg mx-auto mb-10 opacity-0 fade-in-up" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
          <div className="terminal-card rounded-lg overflow-hidden shadow-2xl shadow-terminal/10">
            <div className="flex items-center gap-2 px-4 py-3 bg-secondary/80 border-b border-border">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="ml-2 text-xs text-muted font-mono">terminal</span>
            </div>
            <div className="p-4 bg-card/95 font-mono text-sm">
              <div className="flex items-center gap-2">
                <span className="text-terminal">$</span>
                <span className="text-foreground">{typedText}</span>
                <span className={`text-terminal ${showCursor ? 'opacity-100' : 'opacity-0'}`}>█</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="max-w-xl mx-auto mb-10 opacity-0 fade-in-up" style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>
          <SearchBar
            placeholder="Search skills... (e.g., 'pdf converter', 'git')"
            className="shadow-lg shadow-terminal/5"
          />
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center opacity-0 fade-in-up" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>
          <Link
            href="/skills"
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-terminal text-primary-foreground font-medium hover:bg-terminal/90 transition-all hover:shadow-lg hover:shadow-terminal/20 glow-pulse"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Browse All Skills
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border hover:border-terminal/50 font-medium transition-all hover:bg-terminal/5"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            {categoryCount} Categories
          </Link>
        </div>

        {/* Stats row */}
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto opacity-0 fade-in-up" style={{ animationDelay: '0.7s', animationFillMode: 'forwards' }}>
          <div className="text-center">
            <div className="text-3xl font-bold text-terminal font-mono">{skillCount}+</div>
            <div className="text-sm text-muted">Skills</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-accent font-mono">{categoryCount}</div>
            <div className="text-sm text-muted">Categories</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-foreground font-mono">MIT</div>
            <div className="text-sm text-muted">Licensed</div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-0 fade-in-up" style={{ animationDelay: '1s', animationFillMode: 'forwards' }}>
        <div className="flex flex-col items-center gap-2 text-muted">
          <span className="text-xs font-mono">scroll</span>
          <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </section>
  );
}
