export function HowSkillsWorkSection() {
  const steps = [
    {
      number: '01',
      title: 'Find',
      subtitle: 'discover',
      description: 'Browse the marketplace or search for skills that match your workflow.',
      command: null,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
    {
      number: '02',
      title: 'Install',
      subtitle: 'clone',
      description: 'One command to add any skill to your local environment.',
      command: 'git clone <repo> ~/.claude/skills/',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      ),
    },
    {
      number: '03',
      title: 'Use',
      subtitle: 'execute',
      description: 'Just ask Claude naturally. Skills are applied automatically.',
      command: null,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-30" />

      {/* Decorative gradient orbs */}
      <div className="absolute top-1/4 -left-32 w-64 h-64 bg-terminal/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="font-mono text-terminal text-sm mb-2 opacity-0 fade-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
            // how_it_works
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 opacity-0 fade-in-up" style={{ animationDelay: '0.15s', animationFillMode: 'forwards' }}>
            Three Steps to <span className="text-terminal">Power</span>
          </h2>
          <p className="text-lg text-muted max-w-xl mx-auto opacity-0 fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
            From discovery to deployment in under a minute
          </p>
        </div>

        {/* Steps with connecting line */}
        <div className="relative">
          {/* Connecting line - desktop only */}
          <div className="hidden md:block absolute top-24 left-[16.67%] right-[16.67%] h-0.5">
            <div className="absolute inset-0 bg-gradient-to-r from-terminal/50 via-accent/50 to-terminal/50" />
            {/* Animated pulse on the line */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-terminal to-transparent animate-[shimmer_3s_ease-in-out_infinite]" style={{ backgroundSize: '200% 100%' }} />
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-6">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className="opacity-0 fade-in-up"
                style={{ animationDelay: `${0.2 + 0.15 * index}s`, animationFillMode: 'forwards' }}
              >
                <div className="relative group">
                  {/* Large background number */}
                  <div className="absolute -top-8 -left-2 font-mono text-8xl font-bold text-border/50 dark:text-border/30 select-none group-hover:text-terminal/20 transition-colors duration-500">
                    {step.number}
                  </div>

                  {/* Card */}
                  <div className="relative h-full pt-12">
                    {/* Icon circle - sits on the connecting line */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-background border-2 border-border group-hover:border-terminal flex items-center justify-center text-muted group-hover:text-terminal transition-all duration-300 z-10 group-hover:shadow-lg group-hover:shadow-terminal/20">
                      {step.icon}
                    </div>

                    <div className="h-full p-6 pt-10 rounded-xl border border-border bg-card/50 backdrop-blur-sm group-hover:border-terminal/50 group-hover:bg-card/80 transition-all duration-300">
                      {/* Subtitle */}
                      <div className="font-mono text-xs text-terminal/70 uppercase tracking-widest mb-2">
                        {step.subtitle}
                      </div>

                      {/* Title */}
                      <h3 className="text-2xl font-bold mb-3 group-hover:text-terminal transition-colors">
                        {step.title}
                      </h3>

                      {/* Description */}
                      <p className="text-muted text-sm leading-relaxed mb-4">
                        {step.description}
                      </p>

                      {/* Command (if present) */}
                      {step.command && (
                        <div className="relative mt-auto">
                          <div className="font-mono text-xs bg-secondary/80 rounded-lg px-4 py-3 text-muted border border-border overflow-x-auto group-hover:border-terminal/30 transition-colors">
                            <span className="text-terminal">$</span>{' '}
                            <span className="text-foreground/80">{step.command}</span>
                          </div>
                        </div>
                      )}

                      {/* Arrow indicator for non-last items - mobile */}
                      {index < steps.length - 1 && (
                        <div className="md:hidden flex justify-center mt-6 text-border">
                          <svg className="w-6 h-6 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA hint */}
        <div className="text-center mt-16 opacity-0 fade-in-up" style={{ animationDelay: '0.7s', animationFillMode: 'forwards' }}>
          <p className="text-sm text-muted font-mono">
            <span className="text-terminal">{'>'}</span> Ready to start?{' '}
            <a href="/skills" className="text-terminal hover:underline underline-offset-4">
              Browse skills now
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
