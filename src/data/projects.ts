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
    slug: 'urocheck',
    name: 'Urocheck',
    tagline: 'Portable AI urine analysis device',
    description:
      'A portable, AI-powered urine checker designed for quick screening at home or in local clinics. It gives fast results right on the device without needing a bulky lab setup.',
    category: 'ai',
    tech: ['Embedded C', 'AI inference', 'Sensor array', 'UART/I2C'],
    problem:
      'Lab tests for basic urinalysis take too long and cost more than they should for quick check-ups. People dealing with recurring health tracking need something faster and private at home instead of waiting days for results.',
    approach:
      'Built an optical sensor array to read test strips, paired with an edge-AI model running locally on a microcontroller. It processes data right on the spot—no cloud dependency, no stored private data, just quick, practical feedback.',
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
