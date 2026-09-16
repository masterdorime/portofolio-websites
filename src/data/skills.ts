// Neuron skill graph data: CV skills merged into the 6-hub preset tree,
// plus the untouched soft-skills hub and the Tristan root.
// Levels: CV-rated 1–5 from CV emphasis; preset-only additions default to 3
// (working knowledge) until hand-tuned. Hubs size from their children.

export type SkillHubId =
  | 'frontend'
  | 'backend'
  | 'tools'
  | 'infrastructure'
  | 'devops'
  | 'observability'
  | 'soft'
  | 'core';

export interface SkillNode {
  id: string;
  /** Display name — proper noun, identical in EN/ID. */
  name: string;
  hub: Exclude<SkillHubId, 'core'>;
  /** Proficiency 1–5. */
  level: number;
}

export const SKILL_HUBS: SkillHubId[] = [
  'frontend',
  'backend',
  'tools',
  'infrastructure',
  'devops',
  'observability',
  'soft',
  'core',
];

export const SKILLS: SkillNode[] = [
  // Frontend (CV: all browser-side craft, 3D included)
  { id: 'react', name: 'React', hub: 'frontend', level: 5 },
  { id: 'nextjs', name: 'Next.js', hub: 'frontend', level: 5 },
  { id: 'typescript', name: 'TypeScript', hub: 'frontend', level: 5 },
  { id: 'tailwind', name: 'Tailwind CSS', hub: 'frontend', level: 4 },
  { id: 'framer-motion', name: 'Framer Motion', hub: 'frontend', level: 4 },
  { id: 'html5', name: 'HTML5', hub: 'frontend', level: 5 },
  { id: 'css3', name: 'CSS3', hub: 'frontend', level: 4 },
  { id: 'responsive', name: 'Responsive Design', hub: 'frontend', level: 4 },
  { id: 'threejs', name: 'Three.js', hub: 'frontend', level: 5 },
  { id: 'r3f', name: 'React Three Fiber', hub: 'frontend', level: 5 },
  { id: 'glsl', name: 'GLSL Shaders', hub: 'frontend', level: 4 },
  { id: 'webgl', name: 'WebGL', hub: 'frontend', level: 4 },
  { id: 'canvas', name: 'Canvas API', hub: 'frontend', level: 4 },
  // Backend
  { id: 'nodejs', name: 'Node.js', hub: 'backend', level: 4 },
  { id: 'python', name: 'Python', hub: 'backend', level: 3 },
  { id: 'rest', name: 'REST APIs', hub: 'backend', level: 3 },
  // Tools
  { id: 'git', name: 'Git', hub: 'tools', level: 4 },
  { id: 'figma', name: 'Figma', hub: 'tools', level: 3 },
  { id: 'problem-solving', name: 'Problem Solving', hub: 'tools', level: 4 },
  { id: 'debugging', name: 'Debugging', hub: 'tools', level: 4 },
  // Infrastructure (preset-only)
  { id: 'aws', name: 'AWS', hub: 'infrastructure', level: 3 },
  { id: 'nginx', name: 'Nginx', hub: 'infrastructure', level: 3 },
  { id: 'dns', name: 'DNS', hub: 'infrastructure', level: 3 },
  { id: 'https', name: 'HTTPS', hub: 'infrastructure', level: 3 },
  // DevOps (preset-only)
  { id: 'docker', name: 'Docker', hub: 'devops', level: 3 },
  { id: 'cicd', name: 'CI/CD', hub: 'devops', level: 3 },
  { id: 'linux', name: 'Linux', hub: 'devops', level: 3 },
  { id: 'deployment', name: 'Deployment', hub: 'devops', level: 3 },
  // Observability (preset-only, except perf which is CV-rated)
  { id: 'logging', name: 'Logging', hub: 'observability', level: 3 },
  { id: 'monitoring', name: 'Monitoring', hub: 'observability', level: 3 },
  { id: 'error-tracking', name: 'Error Tracking', hub: 'observability', level: 3 },
  { id: 'perf', name: 'Performance Optimization', hub: 'observability', level: 4 },
  // Soft Skills (CV, untouched)
  { id: 'public-speaking', name: 'Public Speaking', hub: 'soft', level: 3 },
  { id: 'creative-design', name: 'Creative Design', hub: 'soft', level: 4 },
  { id: 'tech-comm', name: 'Technical Communication', hub: 'soft', level: 4 },
  { id: 'teamwork', name: 'Team Collaboration', hub: 'soft', level: 4 },
];

/** Mean level of a hub's skills — drives hub node size. */
export function hubLevel(hub: SkillHubId): number {
  const members = SKILLS.filter((s) => s.hub === hub);
  if (members.length === 0) return 0;
  return members.reduce((sum, s) => sum + s.level, 0) / members.length;
}

/** Same-hub siblings, strongest first — the "linked skills" readout. */
export function linkedSkills(id: string): SkillNode[] {
  const self = SKILLS.find((s) => s.id === id);
  if (!self) return [];
  return SKILLS.filter((s) => s.hub === self.hub && s.id !== id).sort(
    (a, b) => b.level - a.level || a.name.localeCompare(b.name),
  );
}
