import type { MetadataRoute } from 'next';
import { PROJECTS } from '@/data/projects';

const SITE_URL = 'https://tristanedgina-portofolio.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, changeFrequency: 'weekly', priority: 1 },
    ...PROJECTS.map((p) => ({
      url: `${SITE_URL}/projects/${p.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}
