// Exports every user-facing string on the site into website-copy.txt.
// Run: npm run export-copy   (uses npx tsx, no extra dependency)
import { writeFileSync } from 'node:fs';
import { dict } from '../src/i18n/dict';
import { PROJECTS } from '../src/data/projects';
import { SITE as SITE_INFO } from '../src/data/site';
import { ROWS as SKILLS } from '../src/components/about/SkillsMatrix';
import { COMMANDS } from '../src/lib/terminal/commands';

const out: string[] = [];
const en = dict.en;
const id = dict.id;

out.push('TRISTAN PORTFOLIO — COPY DECK');
out.push('Generated from src/i18n/dict.ts (+ data files). Do not edit code to change words —');
out.push('edit THIS file, tell me, and I will apply your edits back into the site.');
out.push('Rules: keep every [EN]/[ID] label and --- slug --- header exactly as-is.');
out.push('Dynamic bits filled automatically at runtime: current year, live WIB clock, project count.');
out.push('');

out.push('=== IDENTITY (src/data/site.ts — proper nouns, same in both languages) ===');
out.push(`Name: ${SITE_INFO.name}`);
out.push(`Role: ${SITE_INFO.role}`);
out.push(`University: ${SITE_INFO.university}`);
out.push(`City: ${SITE_INFO.city}`);
out.push(`Email: ${SITE_INFO.email}`);
out.push(`GitHub: ${SITE_INFO.github}`);
out.push(`Instagram: ${SITE_INFO.instagram}`);
out.push(`Facebook: ${SITE_INFO.facebook}`);
out.push('');

out.push('=== NAV ===');
out.push(`[EN] ${en.nav.about} / ${en.nav.projects} / ${en.nav.contact}`);
out.push(`[ID] ${id.nav.about} / ${id.nav.projects} / ${id.nav.contact}`);
out.push('');

out.push('=== HERO ===');
out.push(`Role line [EN]: ${en.hero.role}`);
out.push(`Role line [ID]: ${id.hero.role}`);
out.push(`Intro [EN]: ${en.hero.intro}`);
out.push(`Intro [ID]: ${id.hero.intro}`);
out.push(`Meta [EN]: {n} ${en.hero.buildsLabel} / wib ${en.hero.tzValue} / ${en.hero.openLabel} ${en.hero.openValue}`);
out.push(`Meta [ID]: {n} ${id.hero.buildsLabel} / wib ${id.hero.tzValue} / ${id.hero.openLabel} ${id.hero.openValue}`);
out.push(`CTA primary [EN]: ${en.hero.ctaAbout}`);
out.push(`CTA primary [ID]: ${id.hero.ctaAbout}`);
out.push(`CTA ghost [EN]: ${en.hero.ctaContact}`);
out.push(`CTA ghost [ID]: ${id.hero.ctaContact}`);
out.push(`Hero view toggle [EN]: ${en.heroView.lanyard} / ${en.heroView.girl}`);
out.push(`Hero view toggle [ID]: ${id.heroView.lanyard} / ${id.heroView.girl}`);
out.push(`Badge status word [EN]: ${en.badge}`);
out.push(`Badge status word [ID]: ${id.badge}`);
out.push(`Marquee [EN]: ${en.marquee}`);
out.push(`Marquee [ID]: ${id.marquee}`);
out.push('');

out.push('=== ABOUT (01) ===');
out.push(`Kicker [EN]: ${en.about.kicker}`);
out.push(`Kicker [ID]: ${id.about.kicker}`);
out.push(`Title [EN]: ${en.about.title}`);
out.push(`Title [ID]: ${id.about.title}`);
en.about.story.forEach((p, i) => {
  out.push(`Story p${i + 1} [EN]: ${p}`);
  out.push(`Story p${i + 1} [ID]: ${id.about.story[i]}`);
});
out.push(`Quote [EN]: ${en.about.quote}`);
out.push(`Quote [ID]: ${id.about.quote}`);
out.push(`Skills kicker [EN]: ${en.about.skillsKicker}`);
out.push(`Skills kicker [ID]: ${id.about.skillsKicker}`);
out.push(`Bridge to builds [EN]: ${en.bridgeBuilds}`);
out.push(`Bridge to builds [ID]: ${id.bridgeBuilds}`);
out.push('');

out.push('=== SKILLS MATRIX (same in both languages — tech terms) ===');
for (const r of SKILLS) out.push(`- ${r.area} :: ${r.detail}`);
out.push('');

out.push('=== PROJECTS (02) ===');
out.push(`Kicker [EN]: ${en.projects.kicker}`);
out.push(`Kicker [ID]: ${id.projects.kicker}`);
out.push(`Title [EN]: ${en.projects.title}`);
out.push(`Title [ID]: ${id.projects.title}`);
out.push(`Lede [EN]: ${en.projects.lede}`);
out.push(`Lede [ID]: ${id.projects.lede}`);
out.push(`Filter 'all' [EN]: ${en.filters.all}`);
out.push(`Filter 'all' [ID]: ${id.filters.all}`);
out.push(`Bridge to contact [EN]: ${en.bridgePeople}`);
out.push(`Bridge to contact [ID]: ${id.bridgePeople}`);
out.push('');
for (const p of PROJECTS) {
  const tEn = en.projectText[p.slug];
  const tId = id.projectText[p.slug];
  out.push(`--- ${p.slug} (${p.category}, ${p.year}) ---`);
  out.push(`Name: ${p.name}`);
  out.push(`Tagline [EN]: ${tEn.tagline}`);
  out.push(`Tagline [ID]: ${tId.tagline}`);
  out.push(`Description [EN]: ${tEn.description}`);
  out.push(`Description [ID]: ${tId.description}`);
  out.push(`Problem [EN]: ${tEn.problem}`);
  out.push(`Problem [ID]: ${tId.problem}`);
  out.push(`Approach [EN]: ${tEn.approach}`);
  out.push(`Approach [ID]: ${tId.approach}`);
  out.push(`Tech stack (both): ${p.tech.join(' / ')}`);
  out.push(`Hardware list (both): ${p.hardware.join(' / ')}`);
  out.push('');
}
out.push(`Case study headings [EN]: ${en.projects.problem} / ${en.projects.approach} / ${en.projects.hardware}`);
out.push(`Case study headings [ID]: ${id.projects.problem} / ${id.projects.approach} / ${id.projects.hardware}`);
out.push(`Case back link [EN]: ${en.projects.back}`);
out.push(`Case back link [ID]: ${id.projects.back}`);
out.push(`Case nav middle [EN]: ${en.projects.allBuilds}`);
out.push(`Case nav middle [ID]: ${id.projects.allBuilds}`);
out.push('');

out.push('=== CONTACT (03) ===');
out.push(`Kicker [EN]: ${en.contact.kicker}`);
out.push(`Kicker [ID]: ${id.contact.kicker}`);
out.push(`Title [EN]: ${en.contact.title}`);
out.push(`Title [ID]: ${id.contact.title}`);
out.push(`Lede [EN]: ${en.contact.lede}`);
out.push(`Lede [ID]: ${id.contact.lede}`);
out.push(`Form name [EN]: ${en.contact.name} (placeholder: ${en.contact.namePh})`);
out.push(`Form name [ID]: ${id.contact.name} (placeholder: ${id.contact.namePh})`);
out.push(`Form message [EN]: ${en.contact.message} (placeholder: ${en.contact.messagePh})`);
out.push(`Form message [ID]: ${id.contact.message} (placeholder: ${id.contact.messagePh})`);
out.push(`Submit [EN]: ${en.contact.submit}`);
out.push(`Submit [ID]: ${id.contact.submit}`);
out.push(`Socials heading [EN]: ${en.contact.socials}`);
out.push(`Socials heading [ID]: ${id.contact.socials}`);
out.push('');

out.push('=== TERMINAL (commands stay English; responses localized) ===');
out.push(`Commands: ${COMMANDS.join(', ')}`);
out.push(`Greeting [EN]: ${en.terminal.greeting.join(' | ')}`);
out.push(`Greeting [ID]: ${id.terminal.greeting.join(' | ')}`);
out.push(`Help [EN]: ${en.terminal.help.join(' | ')}`);
out.push(`Help [ID]: ${id.terminal.help.join(' | ')}`);
out.push(`Whoami [EN]: ${en.terminal.whoami.join(' | ')}`);
out.push(`Whoami [ID]: ${id.terminal.whoami.join(' | ')}`);
out.push(`Status lines [EN]: ${en.terminal.statusCity} | ${en.terminal.statusTime}<HH:MM:SS WIB> | ${en.terminal.statusState}`);
out.push(`Status lines [ID]: ${id.terminal.statusCity} | ${id.terminal.statusTime}<HH:MM:SS WIB> | ${id.terminal.statusState}`);
out.push(`Contact [EN]: ${en.terminal.contactEmail}<email> | ${en.terminal.contactForm}`);
out.push(`Contact [ID]: ${id.terminal.contactEmail}<email> | ${id.terminal.contactForm}`);
out.push(`Projects tail [EN]: ${en.terminal.projectsTail}`);
out.push(`Projects tail [ID]: ${id.terminal.projectsTail}`);
out.push(`Unknown-cmd template [EN]: ${en.terminal.unknown('<typed-command>')}`);
out.push(`Unknown-cmd template [ID]: ${id.terminal.unknown('<typed-command>')}`);
out.push('');

out.push('=== FOOTER / 404 ===');
out.push(`Footer rights [EN]: © {year} Tristan Edgina — Bandung, ${en.footer.rights}`);
out.push(`Footer rights [ID]: © {year} Tristan Edgina — Bandung, ${id.footer.rights}`);
out.push('Footer colophon (both): Set in Space Grotesk · IBM Plex Mono · Instrument Serif');
out.push(`404 kicker [EN]: ${en.notfound.kicker}`);
out.push(`404 kicker [ID]: ${id.notfound.kicker}`);
out.push(`404 title [EN]: ${en.notfound.title}`);
out.push(`404 title [ID]: ${id.notfound.title}`);
out.push(`404 lede [EN]: ${en.notfound.lede}`);
out.push(`404 lede [ID]: ${id.notfound.lede}`);
out.push(`404 back [EN]: ${en.notfound.back}`);
out.push(`404 back [ID]: ${id.notfound.back}`);
out.push('');

writeFileSync('website-copy.txt', out.join('\n') + '\n');
console.log(`website-copy.txt written (${out.length} lines)`);
