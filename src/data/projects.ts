export type ProjectCategory = 'ai' | 'iot' | 'hardware';
export type ProjectFilter = 'all' | ProjectCategory;

export interface Project {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: ProjectCategory;
  tech: string[];
  problem: string;
  approach: string;
  hardware: string[];
  year: number;
}

export const PROJECTS: Project[] = [
  {
    slug: 'uricheck',
    name: 'Uricheck',
    tagline: 'Portable AI urine analysis',
    description:
      'Portable AI-powered urine checker device; on-device AI determines symptoms the user may have.',
    category: 'ai',
    tech: ['Embedded C', 'AI inference', 'Sensor array', 'UART/I2C'],
    problem:
      'Laboratory urinalysis is slow, expensive, and unavailable outside clinics. People with recurring renal-health concerns need a fast, private check at home.',
    approach:
      'Sensor array captures chemical markers; an on-device inference model maps readings to likely symptom patterns, returning instant guidance with a confidence level instead of waiting days for lab results.',
    hardware: ['Optical sensor array', 'Microcontroller', 'Custom sampling cartridge', 'Rechargeable LiPo'],
    year: 2025,
  },
  {
    slug: 'puresip',
    name: 'Puresip',
    tagline: 'Ultrafiltration straw with live sensors',
    description:
      'Portable ultrafiltration straw with multiple sensors ensuring safe drinkable water anywhere you go.',
    category: 'hardware',
    tech: ['Ultrafiltration membrane', 'Turbidity sensor', 'TDS sensor', 'Low-power MCU'],
    problem:
      'Hikers, travelers, and disaster-zone residents cannot trust untreated water sources. Existing filter straws give no feedback on whether the water is actually safe right now.',
    approach:
      'Hollow-fiber ultrafiltration paired with live turbidity and TDS monitoring. Sensors gate the drinking path and report water quality in real time, so the user knows every sip meets safety thresholds.',
    hardware: ['Hollow-fiber membrane', 'Turbidity + TDS sensors', 'Low-power MCU', 'Food-grade housing'],
    year: 2025,
  },
  {
    slug: 'techware',
    name: 'Techware',
    tagline: 'AI-powered thermal jacket',
    description:
      'AI-powered jacket with self-determining heat and cold control, ensuring perfect body temperature.',
    category: 'iot',
    tech: ['Thermal control', 'AI edge inference', 'Wearable sensors', 'BLE'],
    problem:
      'Layered clothing is a static compromise. Athletes and commuters in swing climates overheat mid-activity then chill at rest because garments cannot adapt.',
    approach:
      'Distributed thermal elements and skin/environment sensors feed an edge model that predicts comfort drift and actuates heating or active cooling before discomfort arrives.',
    hardware: ['Thermal film elements', 'Skin + ambient temp sensors', 'BLE MCU', 'Flexible battery pack'],
    year: 2025,
  },
];

export function filterProjects(
  projects: Project[],
  category: ProjectFilter,
): Project[] {
  if (category === 'all') return projects;
  return projects.filter((p) => p.category === category);
}
