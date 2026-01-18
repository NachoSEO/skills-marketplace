'use client';

import { useState } from 'react';

const faqs = [
  {
    id: 'safety',
    question: 'Are skills safe to use?',
    answer:
      'Skills are open source and you can review the code before installing. Each skill runs within Claude Code\'s security sandbox. Always review a skill\'s SKILL.md and any scripts before installation, especially if they require elevated permissions.',
  },
  {
    id: 'uninstall',
    question: 'How do I uninstall a skill?',
    answer:
      'Simply delete the skill folder from your ~/.claude/skills/ directory. For example: rm -rf ~/.claude/skills/skill-name. Claude will no longer have access to that skill.',
    code: 'rm -rf ~/.claude/skills/<skill-name>',
  },
  {
    id: 'create',
    question: 'Can I create my own skills?',
    answer:
      'Yes! Skills are just folders with a SKILL.md file and optional tools/templates. Check out our documentation on GitHub for a guide on creating and publishing your own skills.',
  },
  {
    id: 'offline',
    question: 'Do skills work offline?',
    answer:
      'Once installed, skills are stored locally and Claude can read them offline. However, some skills may require internet access for their functionality (like API calls or web fetching).',
  },
  {
    id: 'updates',
    question: 'How do I update a skill?',
    answer:
      'Skills are maintained by their authors. Pull the latest changes from the skill\'s Git repository to update.',
    code: 'cd ~/.claude/skills/<skill> && git pull',
  },
  {
    id: 'cost',
    question: 'Is there a cost to use skills?',
    answer:
      'All skills in this marketplace are free and open source. The only costs are your regular Claude Code usage, which depends on your Anthropic subscription.',
  },
  {
    id: 'permissions',
    question: 'Can skills access my files?',
    answer:
      'Skills provide instructions to Claude, which operates within your existing Claude Code permissions. Claude will ask for confirmation before accessing sensitive files or running potentially destructive commands.',
  },
];

export function FAQSection() {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleFAQ = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-30" />

      {/* Decorative elements */}
      <div className="absolute top-20 right-10 font-mono text-terminal/10 text-9xl select-none hidden xl:block">?</div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="font-mono text-terminal text-sm mb-2 opacity-0 fade-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
            // faq
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 opacity-0 fade-in-up" style={{ animationDelay: '0.15s', animationFillMode: 'forwards' }}>
            Common <span className="text-terminal">Questions</span>
          </h2>
          <p className="text-lg text-muted opacity-0 fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
            Everything you need to know about skills
          </p>
        </div>

        {/* FAQ list styled as terminal output */}
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={faq.id}
              className="opacity-0 fade-in-up"
              style={{ animationDelay: `${0.1 + 0.05 * index}s`, animationFillMode: 'forwards' }}
            >
              <div
                className={`group rounded-lg border transition-all duration-300 ${
                  openId === faq.id
                    ? 'border-terminal/50 bg-card/80 shadow-lg shadow-terminal/5'
                    : 'border-border bg-card/30 hover:border-terminal/30 hover:bg-card/50'
                }`}
              >
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full flex items-center gap-4 px-5 py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-terminal/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg"
                >
                  {/* Line number / index */}
                  <span className={`font-mono text-xs transition-colors ${
                    openId === faq.id ? 'text-terminal' : 'text-muted/50'
                  }`}>
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  {/* Question */}
                  <span className={`flex-1 font-medium transition-colors ${
                    openId === faq.id ? 'text-terminal' : 'text-foreground group-hover:text-terminal/80'
                  }`}>
                    {faq.question}
                  </span>

                  {/* Toggle indicator */}
                  <span className={`font-mono text-sm transition-all duration-300 ${
                    openId === faq.id ? 'text-terminal rotate-0' : 'text-muted -rotate-90'
                  }`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>

                {/* Answer */}
                <div
                  className={`overflow-hidden transition-all duration-300 ease-out ${
                    openId === faq.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-5 pb-5 pl-14">
                    <p className="text-muted text-sm leading-relaxed mb-3">
                      {faq.answer}
                    </p>

                    {/* Code snippet if present */}
                    {faq.code && (
                      <div className="font-mono text-xs bg-secondary/80 rounded-lg px-4 py-3 border border-border inline-flex items-center gap-2 group/code hover:border-terminal/30 transition-colors">
                        <span className="text-terminal">$</span>
                        <code className="text-foreground/80">{faq.code}</code>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom help link */}
        <div className="text-center mt-12 opacity-0 fade-in-up" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>
          <p className="text-sm text-muted">
            Still have questions?{' '}
            <a
              href="https://github.com/anthropics/skills/discussions"
              target="_blank"
              rel="noopener noreferrer"
              className="text-terminal hover:underline underline-offset-4 inline-flex items-center gap-1"
            >
              Ask on GitHub
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
