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
      'Portable AI-powered urine checker device; on-device AI determines symptoms the user may have. Conceived for bedrooms and village clinics rather than laboratories — screening that fits in a drawer and answers in minutes, with its reasoning kept deliberately legible.',
    category: 'ai',
    tech: ['Embedded C', 'AI inference', 'Sensor array', 'UART/I2C'],
    problem:
      'Laboratory urinalysis is slow, expensive, and unavailable outside clinics. People with recurring renal-health concerns need a fast, private check at home. The gap is not just cost — it is the days of anxious waiting between giving a sample and understanding what it means, a wait that keeps people from checking at all.',
    approach:
      'Sensor array captures chemical markers; an on-device inference model maps readings to likely symptom patterns, returning instant guidance with a confidence level instead of waiting days for lab results. Everything runs locally on the microcontroller: no samples leave the room, no account is required, and the output is framed as guidance toward a professional, never as a diagnosis.',
    hardware: ['Optical sensor array', 'Microcontroller', 'Custom sampling cartridge', 'Rechargeable LiPo'],
    year: 2025,
  },
  {
    slug: 'puresip',
    name: 'Puresip',
    tagline: 'Ultrafiltration straw with live sensors',
    description:
      'Portable ultrafiltration straw with multiple sensors ensuring safe drinkable water anywhere you go. It pairs a hollow-fiber membrane with live quality readouts, so the straw does not just filter — it testifies, sip by sip, that the water is actually safe.',
    category: 'hardware',
    tech: ['Ultrafiltration membrane', 'Turbidity sensor', 'TDS sensor', 'Low-power MCU'],
    problem:
      'Hikers, travelers, and disaster-zone residents cannot trust untreated water sources. Existing filter straws give no feedback on whether the water is actually safe right now. A filter is a promise you cannot verify — and when the membrane fouls or the source is worse than it looks, silence is the worst possible interface.',
    approach:
      'Hollow-fiber ultrafiltration paired with live turbidity and TDS monitoring. Sensors gate the drinking path and report water quality in real time, so the user knows every sip meets safety thresholds. The electronics sip power rather than gulp it: the whole sensing chain is budgeted for multi-day trips away from any outlet.',
    hardware: ['Hollow-fiber membrane', 'Turbidity + TDS sensors', 'Low-power MCU', 'Food-grade housing'],
    year: 2025,
  },
  {
    slug: 'techware',
    name: 'Techware',
    tagline: 'AI-powered thermal jacket',
    description:
      'AI-powered jacket with self-determining heat and cold control, ensuring perfect body temperature. Distributed thermal elements and skin sensors close the loop around comfort itself — clothing that notices you are about to overheat before you do.',
    category: 'iot',
    tech: ['Thermal control', 'AI edge inference', 'Wearable sensors', 'BLE'],
    problem:
      'Layered clothing is a static compromise. Athletes and commuters in swing climates overheat mid-activity then chill at rest because garments cannot adapt. Every existing "heated jacket" is a dumb resistor with a switch; none of them know whether you are actually warm.',
    approach:
      'Distributed thermal elements and skin/environment sensors feed an edge model that predicts comfort drift and actuates heating or active cooling before discomfort arrives. Inference stays on the garment over a low-energy link: the jacket keeps working in a tunnel, on a trail, or anywhere the cloud is a rumor.',
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
