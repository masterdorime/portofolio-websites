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
  facebook: 'https://www.facebook.com/tristanerdd',
  socials: [
    { label: 'GitHub', href: 'https://github.com/masterdorime', icon: 'github' },
    { label: 'Instagram', href: 'https://www.instagram.com/tristanerdd', icon: 'instagram' },
    { label: 'Facebook', href: 'https://www.facebook.com/tristanerdd', icon: 'facebook' },
  ] as Social[],
} as const;
