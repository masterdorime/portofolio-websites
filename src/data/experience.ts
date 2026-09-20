// Experience showcase: competition/archive folders. Language-neutral shell
// (slugs + vendored photos); titles and descriptions live in dict.ts.
// Each slide shows ONE folder; its first three extras fan out as papers,
// click any paper to browse the full set in the viewer.

export interface ExperienceSlide {
  slug: string;
  /** Full-bleed slide backdrop (the "(main thumbnail)" from the list). */
  main: string;
  /** Folder contents, papers first. */
  extras: string[];
}

export const EXPERIENCE: ExperienceSlide[] = [
  {
    slug: 'gentar',
    main: '/images/experience/gentar/gentar-main.jpg',
    extras: [
      '/images/experience/gentar/gentar-01.png',
      '/images/experience/gentar/gentar-02.png',
      '/images/experience/gentar/gentar-03.jpg',
      '/images/experience/gentar/gentar-04.jpg',
      '/images/experience/gentar/gentar-05.png',
    ],
  },
  {
    slug: 'jisf',
    main: '/images/experience/jisf/jisf-main.jpg',
    extras: [
      '/images/experience/jisf/jisf-01.jpg',
      '/images/experience/jisf/jisf-02.jpg',
      '/images/experience/jisf/jisf-03.jpg',
      '/images/experience/jisf/jisf-04.jpg',
    ],
  },
  {
    slug: 'sic6',
    main: '/images/experience/sic6/sic6-main.png',
    extras: [
      '/images/projects/urocheck-analyzer.webp',
      '/images/experience/sic6/sic6-01.jpeg',
      '/images/experience/sic6/sic6-02.jpeg',
      '/images/experience/sic6/sic6-03.png',
      '/images/experience/sic6/sic6-04.png',
    ],
  },
  {
    slug: 'src2025',
    main: '/images/experience/src2025/src2025-main.jpeg',
    extras: [
      '/images/experience/src2025/src2025-01.jpeg',
      '/images/experience/src2025/src2025-02.jpeg',
      '/images/experience/src2025/src2025-03.jpeg',
      '/images/experience/src2025/src2025-04.jpeg',
      '/images/experience/src2025/src2025-05.jpeg',
    ],
  },
  {
    slug: 'comingsoon',
    main: '/images/experience/comingsoon/comingsoon-main.png',
    extras: [
      '/images/experience/comingsoon/comingsoon-01.png',
      '/images/experience/comingsoon/comingsoon-02.png',
      '/images/experience/comingsoon/comingsoon-03.png',
    ],
  },
];
