// Client wrapper for the standalone case-study route: resolves the project
// by slug and renders it in the active language.
'use client';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import CaseStudy from '@/components/projects/CaseStudy';
import { PROJECTS } from '@/data/projects';
import { useDict } from '@/i18n/LanguageProvider';

export default function CaseStudyPage({ slug }: { slug: string }) {
  const t = useDict();
  const idx = PROJECTS.findIndex((p) => p.slug === slug);
  if (idx === -1) notFound();
  const project = PROJECTS[idx];
  const prev = PROJECTS[(idx - 1 + PROJECTS.length) % PROJECTS.length];
  const next = PROJECTS[(idx + 1) % PROJECTS.length];

  return (
    <main className="page">
      <CaseStudy project={project} t={t} />
      <nav className="case-nav" aria-label="More builds">
        <Link href={`/projects/${prev.slug}`}>← {prev.name}</Link>
        <Link href="/#projects">{t.projects.allBuilds}</Link>
        <Link href={`/projects/${next.slug}`}>{next.name} →</Link>
      </nav>
    </main>
  );
}
