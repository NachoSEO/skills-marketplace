import { ImageResponse } from 'next/og';
import { getSkillsSync, getSkillBySlug, getCategoryBySlug } from '@/lib/skills';

export const runtime = 'edge';
export const alt = 'Skill Preview';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: { slug: string } }) {
  const skills = getSkillsSync();
  const skill = getSkillBySlug(skills, params.slug);
  const category = skill ? getCategoryBySlug(skill.category) : null;

  if (!skill) {
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0a0a0a',
            color: '#fafafa',
          }}
        >
          <span style={{ fontSize: 48 }}>Skill Not Found</span>
        </div>
      ),
      { ...size }
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0a0a0a',
          padding: 60,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 24,
          }}
        >
          {category && (
            <div
              style={{
                backgroundColor: category.color || '#6366f1',
                color: '#fafafa',
                padding: '8px 16px',
                borderRadius: 9999,
                fontSize: 20,
                fontWeight: 500,
              }}
            >
              {category.name}
            </div>
          )}
          {skill.featured && (
            <div
              style={{
                backgroundColor: '#fbbf24',
                color: '#0a0a0a',
                padding: '8px 16px',
                borderRadius: 9999,
                fontSize: 20,
                fontWeight: 500,
              }}
            >
              Featured
            </div>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
          }}
        >
          <h1
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: '#fafafa',
              marginBottom: 24,
              lineHeight: 1.1,
            }}
          >
            {skill.name}
          </h1>
          <p
            style={{
              fontSize: 32,
              color: '#a1a1aa',
              lineHeight: 1.4,
              maxWidth: 900,
            }}
          >
            {skill.description.slice(0, 150)}
            {skill.description.length > 150 ? '...' : ''}
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 'auto',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            {skill.stars && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  color: '#fafafa',
                  fontSize: 24,
                }}
              >
                <span style={{ color: '#fbbf24' }}>★</span>
                <span>{skill.stars.toLocaleString()}</span>
              </div>
            )}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                color: '#a1a1aa',
                fontSize: 24,
              }}
            >
              by {skill.author}
            </div>
          </div>
          <div
            style={{
              color: '#6366f1',
              fontSize: 28,
              fontWeight: 600,
            }}
          >
            Claude Skills Marketplace
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
