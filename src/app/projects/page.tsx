// Projects: filterable grid over an ambient drifting wall (spec §4/§6).
'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import FilterBar from '@/components/projects/FilterBar';
import ProjectCard from '@/components/projects/ProjectCard';
import { PROJECTS, filterProjects, type ProjectFilter } from '@/data/projects';

const DriftWall = dynamic(() => import('@/components/ui/DriftWall'), { ssr: false });

export default function ProjectsPage() {
  const [filter, setFilter] = useState<ProjectFilter>('all');
  const visible = useMemo(() => filterProjects(PROJECTS, filter), [filter]);

  return (
    <main className="page">
      <p className="page-kicker">projects & labs</p>
      <h1 className="page-title">Physical builds, IoT systems, custom silicon-adjacent tinkering.</h1>
      <p className="page-lede">
        Every entry below is a real device: sensed, soldered, and shipped as far as a student lab allows —
        then wrapped in an interface worth touching.
      </p>

      <div className="projects-ambient" aria-hidden>
        <DriftWall
          items={PROJECTS.map((p) => ({
            image: `https://picsum.photos/seed/${p.slug}/400/264`,
            title: p.name,
          }))}
          columns={4}
          overlayColor="#070709"
        />
      </div>

      <FilterBar value={filter} onChange={setFilter} />

      <div className="project-grid">
        <AnimatePresence mode="popLayout">
          {visible.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </AnimatePresence>
      </div>
    </main>
  );
}
