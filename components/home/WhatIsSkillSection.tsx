export function WhatIsSkillSection() {
  const features = [
    {
      file: 'SKILL.md',
      desc: 'The core instruction file that defines behavior',
      type: 'required',
    },
    {
      file: 'tools/',
      desc: 'Helper scripts and executable utilities',
      type: 'optional',
    },
    {
      file: 'templates/',
      desc: 'Reusable output templates and patterns',
      type: 'optional',
    },
  ];

  return (
    <section className="py-24 bg-card/50 relative overflow-hidden">
      <div className="absolute inset-0 noise" />

      {/* Decorative corner brackets */}
      <div className="absolute top-8 left-8 font-mono text-terminal/20 text-6xl select-none hidden lg:block">{'['}</div>
      <div className="absolute bottom-8 right-8 font-mono text-terminal/20 text-6xl select-none hidden lg:block">{']'}</div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="font-mono text-terminal text-sm mb-2 opacity-0 fade-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
          // what_is_skill
        </div>
        <h2 className="text-4xl sm:text-5xl font-bold mb-4 opacity-0 fade-in-up" style={{ animationDelay: '0.15s', animationFillMode: 'forwards' }}>
          What&apos;s a <span className="text-terminal">Skill</span>?
        </h2>
        <p className="text-xl text-muted max-w-2xl mb-16 opacity-0 fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
          A portable instruction set that teaches Claude new capabilities—like plugins for your AI.
        </p>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Left: Skill anatomy */}
          <div className="opacity-0 fade-in-up" style={{ animationDelay: '0.25s', animationFillMode: 'forwards' }}>
            <div className="font-mono text-xs text-muted mb-6 uppercase tracking-wider">
              Skill Anatomy
            </div>

            <div className="space-y-4">
              {features.map((feature, index) => (
                <div
                  key={feature.file}
                  className="group relative pl-6 py-4 border-l-2 border-border hover:border-terminal transition-colors"
                >
                  {/* Line number */}
                  <div className="absolute left-0 -translate-x-1/2 w-8 h-8 rounded-full bg-background border-2 border-border group-hover:border-terminal group-hover:bg-terminal/10 flex items-center justify-center font-mono text-xs text-muted group-hover:text-terminal transition-all">
                    {String(index + 1).padStart(2, '0')}
                  </div>

                  <div className="flex items-start gap-4 ml-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <code className="font-mono text-lg font-semibold text-foreground group-hover:text-terminal transition-colors">
                          {feature.file}
                        </code>
                        <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                          feature.type === 'required'
                            ? 'bg-terminal/20 text-terminal'
                            : 'bg-muted/20 text-muted'
                        }`}>
                          {feature.type}
                        </span>
                      </div>
                      <p className="text-muted text-sm">{feature.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 rounded-lg bg-terminal/5 border border-terminal/20">
              <p className="text-sm text-muted">
                <span className="text-terminal font-mono">tip:</span> Once installed in{' '}
                <code className="font-mono text-xs bg-secondary px-1.5 py-0.5 rounded">~/.claude/skills/</code>,
                Claude automatically discovers and applies skills when relevant.
              </p>
            </div>
          </div>

          {/* Right: Terminal card with SKILL.md example */}
          <div className="opacity-0 fade-in-up" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
            <div className="relative">
              {/* Glow effect behind card */}
              <div className="absolute -inset-4 bg-terminal/5 rounded-2xl blur-2xl" />

              <div className="relative terminal-card rounded-xl overflow-hidden shadow-2xl shadow-terminal/10 border border-border hover:border-terminal/50 transition-colors">
                {/* Terminal header */}
                <div className="flex items-center gap-2 px-4 py-3 bg-secondary/80 border-b border-border">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 transition-colors" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-500 transition-colors" />
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-xs text-muted font-mono">pdf-converter/SKILL.md</span>
                  </div>
                  <div className="w-14" /> {/* Spacer for centering */}
                </div>

                {/* Code content with line numbers */}
                <div className="bg-card/95 font-mono text-sm overflow-hidden">
                  <div className="flex">
                    {/* Line numbers */}
                    <div className="py-4 px-3 bg-secondary/30 text-muted/50 text-right select-none border-r border-border">
                      {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => (
                        <div key={n} className="leading-6 text-xs">{n}</div>
                      ))}
                    </div>

                    {/* Code */}
                    <div className="py-4 px-4 overflow-x-auto flex-1">
                      <pre className="text-foreground/90">
                        <code>
                          <span className="text-terminal font-semibold"># PDF Converter</span>{'\n'}
                          {'\n'}
                          <span className="text-muted">Convert documents to PDF format</span>{'\n'}
                          <span className="text-muted">with automatic formatting.</span>{'\n'}
                          {'\n'}
                          <span className="text-terminal font-semibold">## Instructions</span>{'\n'}
                          {'\n'}
                          <span className="text-muted">When converting to PDF:</span>{'\n'}
                          <span className="text-accent">1.</span><span className="text-muted"> Detect input format</span>{'\n'}
                          <span className="text-accent">2.</span><span className="text-muted"> Apply converter script</span>{'\n'}
                          <span className="text-accent">3.</span><span className="text-muted"> Verify output quality</span>{'\n'}
                        </code>
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Status bar */}
                <div className="flex items-center justify-between px-4 py-2 bg-secondary/50 border-t border-border text-xs font-mono text-muted">
                  <span>markdown</span>
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-terminal animate-pulse" />
                    ready
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
