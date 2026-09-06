import type { Metadata } from 'next';
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
  const project = PROJECTS.find((p) => p.slug === slug);
  if (!project) notFound();

  return (
    <main className="page">
      <CaseStudy project={project} />
    </main>
  );
}
