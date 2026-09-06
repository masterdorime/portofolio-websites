// Grid card with layout morph (spec §8: staggered entrances, shared-element feel).
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Project } from '@/data/projects';
import { springBase } from '@/lib/motion';

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <motion.article
      layout
      transition={springBase}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="card project-card media-aberration"
    >
      <span className={`tag tag--${project.category === 'ai' ? 'lavender' : project.category === 'iot' ? 'amber' : 'rose'}`}>
        {project.category}
      </span>
      <h3>
        <Link href={`/projects/${project.slug}`} className="stretch">
          {project.name}
        </Link>
      </h3>
      <p>{project.tagline}</p>
      <div className="case-meta">
        <span className="tag">{project.year}</span>
        {project.tech.slice(0, 3).map((t) => (
          <span key={t} className="tag">{t}</span>
        ))}
      </div>
    </motion.article>
  );
}
