// Shared case-study body: used by the overlay and the standalone [slug] page (spec §4).
import Link from 'next/link';
import type { Project } from '@/data/projects';

export default function CaseStudy({ project }: { project: Project }) {
  return (
    <article className="case-body">
      <p className="page-kicker">
        <Link href="/projects" style={{ color: 'inherit' }}>← projects</Link>
        {' / '}
        {project.category}
        {' · '}
        {project.year}
      </p>
      <h1 className="page-title">{project.name}</h1>
      <p className="page-lede">{project.description}</p>
      <div className="case-meta">
        {project.tech.map((t) => (
          <span key={t} className="tag tag--amber">{t}</span>
        ))}
      </div>

      <h2>Problem</h2>
      <p>{project.problem}</p>

      <h2>Engineering approach</h2>
      <p>{project.approach}</p>

      <h2>Hardware breakdown</h2>
      <ul>
        {project.hardware.map((h) => (
          <li key={h}>{h}</li>
        ))}
      </ul>
    </article>
  );
}
