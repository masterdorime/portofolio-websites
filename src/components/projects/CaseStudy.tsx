// Shared case-study body: used by the overlay and the standalone [slug] page (spec §4).
import Link from 'next/link';
import Image from 'next/image';
import type { Project } from '@/data/projects';
import type { Dict } from '@/i18n/dict';

export default function CaseStudy({ project, t }: { project: Project; t: Dict }) {
  const text = t.projectText[project.slug] ?? {
    tagline: project.tagline,
    description: project.description,
    problem: project.problem,
    approach: project.approach,
    relic: '',
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
      <p className="relic-line">{text.relic}</p>
      <p className="page-lede">{text.description}</p>
      <figure className="case-figure">
        <Image
          src={project.image}
          alt={`${project.name} render`}
          width={1400}
          height={900}
          sizes="(max-width: 900px) 100vw, 880px"
          priority={false}
        />
      </figure>
      {project.gallery?.length ? (
        <div className="case-gallery">
          {project.gallery.map((src) => (
            <figure key={src} className="case-figure">
              <Image
                src={src}
                alt={`${project.name} detail render`}
                width={1400}
                height={900}
                sizes="(max-width: 900px) 100vw, 880px"
              />
            </figure>
          ))}
        </div>
      ) : null}
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
