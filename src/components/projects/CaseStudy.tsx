// Shared case-study body: used by the overlay and the standalone [slug] page (spec §4).
import Link from 'next/link';
import type { Project } from '@/data/projects';
import type { Dict } from '@/i18n/dict';

export default function CaseStudy({ project, t }: { project: Project; t: Dict }) {
  const text = t.projectText[project.slug] ?? {
    tagline: project.tagline,
    description: project.description,
    problem: project.problem,
    approach: project.approach,
  };
  return (
    <article className="case-body">
      <p className="page-kicker">
        <Link href="/#projects" style={{ color: 'inherit' }}>{t.projects.back}</Link>
        {' / '}
        {project.category}
        {' · '}
        {project.year}
      </p>
      <h1 className="page-title">{project.name}</h1>
      <p className="page-lede">{text.description}</p>
      <div className="case-meta">
        {project.tech.map((tech) => (
          <span key={tech} className="tag tag--amber">{tech}</span>
        ))}
      </div>

      <h2>{t.projects.problem}</h2>
      <p>{text.problem}</p>

      <h2>{t.projects.approach}</h2>
      <p>{text.approach}</p>

      <h2>{t.projects.hardware}</h2>
      <ul>
        {project.hardware.map((h) => (
          <li key={h}>{h}</li>
        ))}
      </ul>
    </article>
  );
}
