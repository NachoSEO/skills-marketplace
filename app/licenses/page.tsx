import type { Metadata } from 'next';
import Link from 'next/link';
import { getSkillsSync, getLicensesWithCounts } from '@/lib/skills';

export const metadata: Metadata = {
  title: 'Licenses',
  description: 'Browse Claude Code skills by license type. Find MIT, Apache, GPL, and other open-source licensed skills.',
  alternates: {
    canonical: '/licenses',
  },
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const licenseDescriptions: Record<string, string> = {
  MIT: 'Permissive license with minimal restrictions',
  'Apache-2.0': 'Permissive license with patent protection',
  'GPL-3.0': 'Copyleft license requiring source disclosure',
  'BSD-3-Clause': 'Permissive license with attribution requirement',
  ISC: 'Simplified permissive license',
  'MPL-2.0': 'Weak copyleft license',
  'LGPL-3.0': 'Copyleft for libraries',
  Unlicense: 'Public domain dedication',
};

export default function LicensesPage() {
  const skills = getSkillsSync();
  const licensesWithCounts = getLicensesWithCounts(skills);

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-2 text-sm text-muted mb-8">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-foreground">Licenses</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Browse by License</h1>
          <p className="text-lg text-muted">
            Explore skills by their open-source license type
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {licensesWithCounts.map(({ license, count }) => (
            <Link
              key={license}
              href={`/licenses/${slugify(license)}`}
              className="p-4 rounded-lg bg-card border border-border hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{license}</span>
                <span className="text-sm text-muted">{count} skills</span>
              </div>
              {licenseDescriptions[license] && (
                <p className="text-sm text-muted">{licenseDescriptions[license]}</p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
