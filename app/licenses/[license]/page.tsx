import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SkillGrid } from '@/components/skills/SkillGrid';
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd';
import { getSkillsSync, getUniqueLicenses, getSkillsByLicense } from '@/lib/skills';

const BASE_URL = 'https://skills.claudecode.dev';

interface Props {
  params: Promise<{ license: string }>;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const licenseDescriptions: Record<string, string> = {
  MIT: 'The MIT License is a permissive free software license with minimal restrictions on reuse.',
  'Apache-2.0': 'The Apache License 2.0 is a permissive license that includes patent rights.',
  'GPL-3.0': 'The GNU General Public License v3.0 is a copyleft license requiring source code disclosure.',
  'BSD-3-Clause': 'The BSD 3-Clause License is a permissive license requiring attribution.',
  ISC: 'The ISC License is a simplified permissive license similar to MIT.',
  'MPL-2.0': 'The Mozilla Public License 2.0 is a weak copyleft license.',
  'LGPL-3.0': 'The GNU Lesser General Public License v3.0 is designed for libraries.',
  Unlicense: 'The Unlicense is a public domain dedication.',
};

export async function generateStaticParams() {
  const skills = getSkillsSync();
  const licenses = getUniqueLicenses(skills);
  return licenses.map((license) => ({ license: slugify(license) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { license: licenseSlug } = await params;
  const skills = getSkillsSync();
  const licenses = getUniqueLicenses(skills);
  const license = licenses.find((l) => slugify(l) === licenseSlug);

  if (!license) {
    return { title: 'License Not Found' };
  }

  const matchingSkills = getSkillsByLicense(skills, license);

  return {
    title: `${license} Licensed Skills`,
    description: `Discover ${matchingSkills.length} Claude Code skills with ${license} license. ${licenseDescriptions[license] || ''}`,
    alternates: {
      canonical: `/licenses/${licenseSlug}`,
    },
    openGraph: {
      title: `${license} Licensed Skills - Claude Skills Marketplace`,
      description: `Discover ${matchingSkills.length} Claude Code skills with ${license} license.`,
    },
  };
}

export default async function LicensePage({ params }: Props) {
  const { license: licenseSlug } = await params;
  const skills = getSkillsSync();
  const licenses = getUniqueLicenses(skills);
  const license = licenses.find((l) => slugify(l) === licenseSlug);

  if (!license) {
    notFound();
  }

  const licenseSkills = getSkillsByLicense(skills, license);

  const breadcrumbItems = [
    { name: 'Home', url: BASE_URL },
    { name: 'Licenses', url: `${BASE_URL}/licenses` },
    { name: license, url: `${BASE_URL}/licenses/${licenseSlug}` },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <div className="min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-muted mb-8">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/licenses" className="hover:text-foreground transition-colors">
              Licenses
            </Link>
            <span>/</span>
            <span className="text-foreground">{license}</span>
          </nav>

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-6 h-6 text-muted"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <h1 className="text-3xl sm:text-4xl font-bold">{license}</h1>
            </div>
            {licenseDescriptions[license] && (
              <p className="text-muted mb-4">{licenseDescriptions[license]}</p>
            )}
            <p className="text-lg text-muted">
              {licenseSkills.length} skill{licenseSkills.length !== 1 ? 's' : ''} with {license} license
            </p>
          </div>

          <SkillGrid skills={licenseSkills} />
        </div>
      </div>
    </>
  );
}
