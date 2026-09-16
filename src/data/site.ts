export interface Social {
  label: string;
  href: string;
  icon: 'github' | 'instagram' | 'facebook';
}

export const SITE = {
  name: 'Tristan Edgina',
  role: 'Computer Engineering undergraduate',
  university: 'Telkom University, Bandung',
  city: 'Bandung',
  email: 'tristanedginarakhadewa@gmail.com',
  github: 'https://github.com/masterdorime',
  instagram: 'https://www.instagram.com/tristanerdd',
  facebook: 'https://www.facebook.com/profile.php?id=100080284166998&locale=id_ID',
  linkedin: 'https://www.linkedin.com/in/tristan-edgina-rakhadewa-18635a435/',
  x: 'https://x.com/tristanerdd',
  threads: 'https://www.threads.com/@tristanerdd',
  socials: [
    { label: 'GitHub', href: 'https://github.com/masterdorime', icon: 'github' },
    { label: 'Instagram', href: 'https://www.instagram.com/tristanerdd', icon: 'instagram' },
    { label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=100080284166998&locale=id_ID', icon: 'facebook' },
  ] as Social[],
} as const;
