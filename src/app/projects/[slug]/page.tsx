import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import CaseStudy from '@/components/projects/CaseStudy';
import { PROJECTS } from '@/data/projects';

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = PROJECTS.find((p) => p.slug === slug);
  if (!project) return { title: 'Not found — Tristan Edgina' };
  return {
    title: `${project.name} — Tristan Edgina`,
    description: project.description,
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const idx = PROJECTS.findIndex((p) => p.slug === slug);
  if (idx === -1) notFound();
  const project = PROJECTS[idx];
  const prev = PROJECTS[(idx - 1 + PROJECTS.length) % PROJECTS.length];
  const next = PROJECTS[(idx + 1) % PROJECTS.length];

  return (
    <main className="page">
      <CaseStudy project={project} />
      <nav className="case-nav" aria-label="More builds">
        <Link href={`/projects/${prev.slug}`}>← {prev.name}</Link>
        <Link href="/#projects">all builds</Link>
        <Link href={`/projects/${next.slug}`}>{next.name} →</Link>
      </nav>
    </main>
  );
}
