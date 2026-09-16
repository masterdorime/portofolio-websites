// Bilingual dictionary: English + Bahasa Indonesia. Proper nouns (names,
// places, tech terms, social labels) stay untouched in both languages.

import type { SkillHubId } from '@/data/skills';

export type Lang = 'en' | 'id';

export interface ProjectText {
  tagline: string;
  description: string;
  problem: string;
  approach: string;
  relic: string;
}

export interface ExperienceText {
  span: string;
  title: string;
  body: string;
}

export interface ExperienceUi {
  openFolder: string;
  photos: string;
  close: string;
  prev: string;
  next: string;
  of: string;
  readMore: string;
  showLess: string;
}

export interface TerminalText {
  greeting: string[];
  help: string[];
  whoami: string[];
  statusCity: string;
  statusTime: string;
  statusState: string;
  contactEmail: string;
  contactForm: string;
  projectsTail: string;
  deploy: string[];
  unknown: (input: string) => string;
}

export interface Dict {
  nav: {
    home: string;
    about: string;
    experience: string;
    skills: string;
    projects: string;
    phoneography: string;
    contact: string;
    cv: string;
  };
  heroView: { lanyard: string; girl: string };
  hero: {
    role: string;
    intro: string;
    buildsLabel: string;
    tzValue: string;
    openLabel: string;
    openValue: string;
    ctaAbout: string;
    ctaContact: string;
    ctaCV: string;
    cvEN: string;
    cvID: string;
  };
  lanyard: { load: string; loading: string };
  prehero: { eyebrow: string; scroll: string };
  miku: { hint: string; lines: string[] };
  badge: string;
  marquee: string;
  about: {
    kicker: string;
    title: string;
    story: [string, string, string];
    quote: string;
    skillsKicker: string;
    experience: ExperienceText[];
    experienceUi: ExperienceUi;
    skillGraph: {
      hint: string;
      level: string;
      linked: string;
      close: string;
      hubs: Record<SkillHubId, string>;
    };
  };
  bridgeBuilds: string;
  bridgeSkills: string;
  projects: {
    kicker: string;
    title: string;
    lede: string;
    back: string;
    allBuilds: string;
    problem: string;
    approach: string;
    hardware: string;
  };
  filters: { all: string };
  phone: {
    kicker: string;
    titleA: string;
    struck: string;
    titleB: string;
    sub: string;
    cta: string;
  };
  bridgePeople: string;
  contact: {
    kicker: string;
    title: string;
    lede: string;
    name: string;
    namePh: string;
    message: string;
    messagePh: string;
    submit: string;
    socials: string;
    terminalLabel: string;
    terminalInput: string;
  };
  footer: { rights: string };
  notfound: { kicker: string; title: string; lede: string; back: string };
  terminal: TerminalText;
  projectText: Record<string, ProjectText>;
}

const enProjectText: Record<string, ProjectText> = {
  urocheck: {
    tagline: 'Portable AI urine analysis device',
    description:
      'A portable, AI-powered urine checker designed for quick screening at home or in local clinics. It gives fast results right on the device without needing a bulky lab setup.',
    problem:
      'Lab tests for basic urinalysis take too long and cost more than they should for quick check-ups. People dealing with recurring health tracking need something faster and private at home instead of waiting days for results.',
    approach:
      'Built an optical sensor array to read test strips, paired with an edge-AI model running locally on a microcontroller. It processes data right on the spot—no cloud dependency, no stored private data, just quick, practical feedback.',
    relic: 'Grade 2 relic · 1,800M',
  },
  puresip: {
    tagline: 'Ultrafiltration straw with real-time sensors',
    description:
      "A portable water filtration straw equipped with live sensors. It doesn't just filter out bad stuff; it actually tells you in real-time whether the water you're drinking is safe.",
    problem:
      "When you're out hiking or dealing with an emergency, standard filtration gear is basically a guessing game. You never really know if the filter is failing or if the water is actually safe to drink.",
    approach:
      'Combines a hollow-fiber ultrafiltration membrane with live TDS and turbidity sensors. The built-in low-power MCU monitors water quality continuously and gives immediate feedback so you can drink with confidence.',
    relic: 'Grade 1 relic · 4,500M',
  },
  techware: {
    tagline: 'Smart thermal jacket',
    description:
      'An AI-assisted smart jacket that automatically adjusts its heating and cooling elements based on your body temperature and environment, keeping you comfortable without manual adjustments.',
    problem:
      "Traditional layered clothing is rigid. If you're commuting or exercising in changing weather, you either overheat or freeze because regular jackets can't adapt to your body's thermal shifts.",
    approach:
      'Embedded skin sensors and distributed heating elements controlled by an edge algorithm. It predicts your comfort level and adjusts temperature proactively, running entirely on a small wearable battery pack.',
    relic: 'Special grade relic · 9,000M',
  },
  h2orizon: {
    tagline: 'Smart water bottle with ultrafiltration + micro-pump',
    description:
      'H2orizon is a next-generation smart water bottle that turns virtually any freshwater source into clean, drinkable water on the go. Compact, rugged, and intelligently designed, it combines advanced ultrafiltration technology with a built-in micro-pump and real-time purity sensing—so you can hydrate with confidence wherever you are.',
    problem:
      'Relying on freshwater sources without treatment is a gamble, and plain filters offer no proof of safety while demanding constant effort to sip through. The risk stays invisible until it is too late.',
    approach:
      'Integrates a hollow-fiber ultrafiltration membrane with a quiet micro-pump that pulls water for you and inline TDS/turbidity sensing that verifies purity in real time. A low-power core handles the whole loop so the bottle stays reliable on trails, travel, and daily carry.',
    relic: 'Grade 1 relic · 6,200M',
  },
};

const idProjectText: Record<string, ProjectText> = {
  urocheck: {
    tagline: 'Alat analisis urine AI portabel',
    description:
      'Perangkat cek urine portabel bertenaga AI buat skrining cepat di rumah atau klinik kecil. Bisa ngasih hasil instan langsung di perangkat tanpa harus nunggu alat lab besar.',
    problem:
      'Tes urin standar di lab kadang kelamaan dan gak praktis buat sekadar ngecek kondisi rutin. Orang-orang yang butuh memantau kesehatan berkala butuh cara yang cepat dan privat di rumah.',
    approach:
      'Pakai susunan sensor optik buat baca strip uji, digabung sama model AI kecil yang jalan langsung di mikrokontroler. Semua pemrosesan jalan secara lokal: gak butuh internet, data aman di device, langsung keluar hasilnya.',
    relic: 'Relik tingkat 2 · 1.800M',
  },
  puresip: {
    tagline: 'Sedotan ultrafiltrasi dengan sensor kualitas air',
    description:
      'Sedotan filter air portabel yang dilengkapi sensor digital. Jadi gak cuma nyaring kotoran doang, tapi alat ini ngasih tahu secara real-time kalau air yang lu minum beneran aman.',
    problem:
      'Pas lagi di alam bebas atau darurat, pakai filter air biasa tuh untung-untungan. Lu gak bakal tahu kapan filternya jebol atau airnya masih layak minum apa gak.',
    approach:
      'Gabungin membran ultrafiltrasi *hollow-fiber* dengan sensor TDS dan kekeruhan. MCU hemat daya mantau kualitas air terus-menerus, jadi ada indikator jelas sebelum air masuk ke mulut.',
    relic: 'Relik tingkat 1 · 4.500M',
  },
  techware: {
    tagline: 'Jaket thermal pintar',
    description:
      'Jaket pintar berbasis AI yang bisa ngatur sendiri kapan harus kasih panas atau pendinginan sesuai suhu tubuh dan lingkungan sekitar, tanpa perlu repot pencet tombol manual.',
    problem:
      'Pakai jaket berlapis-lapis itu ribet. Kalau lu lagi aktif di cuaca yang berubah-ubah, seringnya malah kepanasan pas gerak terus kedinginan pas diem, karena jaket biasa gak bisa menyesuaikan diri.',
    approach:
      'Nyematkan sensor suhu kulit dan elemen pemanas fleksibel yang diatur sama algoritma lokal. Sistemnya memprediksi perubahan suhu tubuh lu dan langsung menyesuaikan otomatis pakai baterai portable.',
    relic: 'Relik kelas khusus · 9.000M',
  },
  h2orizon: {
    tagline: 'Botol pintar dengan ultrafiltrasi + micro-pump',
    description:
      'H2orizon adalah botol minum pintar generasi terbaru yang bisa mengubah hampir semua sumber air tawar jadi air minum bersih kapan pun lu butuh. Ringkas, tangguh, dan dirancang cerdas, dia gabungin teknologi ultrafiltrasi canggih dengan micro-pump built-in dan sensor kemurnian real-time—jadi lu bisa minum dengan tenang di mana aja.',
    problem:
      'Ngandelin air sumber tanpa olahan tuh spekulasi, filter biasa gak ngasih bukti aman dan nyedotnya berat. Risikonya gak kelihatan sampai telat.',
    approach:
      'Satu paket ultrafiltrasi hollow-fiber, micro-pump senyap yang narik air buat lu, plus sensor TDS/kekeruhan yang verifikasi kemurnian secara real-time. Inti hemat daya ngatur semuanya biar tetap andal buat hiking, traveling, atau pakai harian.',
    relic: 'Relik tingkat 1 · 6.200M',
  },
};

export const dict: Record<Lang, Dict> = {
  en: {
    nav: {
      home: 'home',
      about: 'about',
      experience: 'experience',
      skills: 'skills',
      projects: 'projects',
      phoneography: 'phoneography',
      contact: 'contact',
      cv: 'cv',
    },
    heroView: { lanyard: 'id card', girl: '3d muse' },
    hero: {
      role: 'computer engineering · hardware & iot · frontend dev — bandung, id',
      intro:
        "I'm Tristan Edgina, a Computer Engineering student at Telkom University, Bandung. I build physical stuff that actually interacts with the real world and wrap them in clean, solid web interfaces.",
      buildsLabel: 'documented builds',
      tzValue: 'utc+7, bandung',
      openLabel: 'open',
      openValue: 'to collab',
      ctaAbout: 'check out my work →',
      ctaContact: 'say hello',
      ctaCV: 'download CV ▾',
      cvEN: 'English — Data-focused',
      cvID: 'Indonesia',
    },
    lanyard: { load: '◉ summon the id card', loading: 'weaving the strap…' },
    prehero: { eyebrow: 'portfolio · vol. 01 — bandung, id', scroll: 'scroll to reveal' },
    miku: {
      hint: 'tap Miku — she talks',
      lines: [
        "Nyaa~ hi-hi! I'm Miku, the lab cat!",
        'Tristan digs up weird tech down here.',
        'Urocheck, Puresip, Techware, H2orizon — all hand-built!',
        'Nyaa, stretch those paws. Scroll gently.',
      ],
    },
    badge: 'undergrad',
    marquee: 'Hardware ✦ IoT Systems ✦ AI Devices ✦ Creative Frontend',
    about: {
      kicker: '01 · EDGE OF THE ABYSS',
      title: 'Circuit boards and clean code.',
      story: [
        'I’m Tristan. When I’m not buried under assignments for my Computer Engineering degree at Telkom University in Bandung, you’ll usually find me knee-deep in electronics and physical prototypes.',
        'I like building things that exist in the physical space—devices with actual sensors, inputs, and real-world constraints. There’s a very specific kind of satisfaction when a custom-built circuit board finally boots up and works the way you planned.',
        'That same practical mindset spills over into my web work. I treat frontend development the same way I treat hardware: keep it clean, cut out the fluff, and make sure it actually does what it’s supposed to do.',
      ],
      quote: 'Build things that work, wrap them in interfaces that make sense.',
      skillsKicker: 'skills & tech matrix',
      skillGraph: {
        hint: 'drag to spin · click a node',
        level: 'Proficiency',
        linked: 'Linked skills',
        close: 'Close',
        hubs: {
          frontend: 'Frontend',
          backend: 'Backend',
          tools: 'Tools',
          infrastructure: 'Infrastructure',
          devops: 'DevOps',
          observability: 'Observability',
          soft: 'Soft Skills',
          core: 'Core Node',
        },
      },
      experience: [
        {
          span: 'Top 10 team · 2,700+',
          title: 'Innovation Challenge 2024',
          body: 'In late 2024 I joined the Innovation Challenge: Generasi Terampil with my team Gentar (Tempest Tech) — me, Saif, El, Atha, and Sulthon. Against 2,700+ participants we built a solution for real community issues and made the 10 teams at Demo Day, learning to spot problems, design practical fixes, and collaborate under pressure.',
        },
        {
          span: 'Gold medal · Apr 2025',
          title: 'H2ORIZON at JISF 2025',
          body: 'In April 2025 I designed and presented H2ORIZON, a smart adventure bottle for outdoor explorers with real-time hydration and environmental sensing. It took Gold in Innovation Science at the Jakarta International Science Fair — proof that ideas become real when tech, design, and human needs meet.',
        },
        {
          span: 'Stage 4 · 10,000+',
          title: 'Samsung Innovation Campus 6',
          body: 'Selected from 10,000+ applicants for Samsung Innovation Campus Batch 6, I joined Team Samsutron with Saif, Atha, and Rado. The intensive AI, IoT, and programming program carried us to Stage 4 and showed me how software and hardware click together into real-world applications.',
        },
        {
          span: '2nd place · Jun 2025',
          title: 'Schools Reinventing Cities',
          body: 'In June 2025 I entered the global C40 Cities competition with Rakha and Kafka, designing an Integrated Low-Emission Zone concept for Jakarta that placed 2nd in West Jakarta — stretching my view from single products to how tech and design shape sustainable cities.',
        },
        {
          span: 'New arc · coming soon',
          title: 'College arc: opening soon',
          body: 'Next chapter: my college arc at the School of Electrical Engineering, Telkom University. New labs, new hardware, new builds — this folder opens as soon as the semester does.',
        },
      ],
      experienceUi: {
        openFolder: 'open folder',
        photos: 'photos',
        close: 'Close',
        prev: 'Previous photo',
        next: 'Next photo',
        of: 'of',
        readMore: 'Read more',
        showLess: 'Show less',
      },
    },
    bridgeBuilds:
      'Ideas are nice, but hardware has to leave the desk. Here are four projects that actually made it out.',
    bridgeSkills:
      'Each project pushed me to develop a versatile set of technical and creative skills. Here’s a closer look at the skills that power everything I create.',
    projects: {
      kicker: '02 · ARTIFACTS OF THE DEEP',
      title: 'Physical builds, IoT systems, and custom tinkering.',
      lede:
        "Every project here is a real device I've built, soldered, and tested as a student. They usually start from everyday annoyances and turn into functioning prototypes. Click any build to see the full documentation, schematic, and parts list.",
      back: '← projects',
      allBuilds: 'all builds',
      problem: 'Problem',
      approach: 'Engineering approach',
      hardware: 'Hardware breakdown',
    },
    filters: { all: 'all' },
    phone: {
      kicker: 'field recordings · fifth layer',
      titleA: 'i also do',
      struck: 'photography',
      titleB: 'phone’ography',
      sub: '(i don’t have a camera yet — everything here was captured on my mobile phone) these are some of the photos i took',
      cta: 'visit my insta for more →',
    },
    bridgePeople:
      'Tools and code are cool, but talking to people is better. Hit me up.',
    contact: {
      kicker: '03 · CAPITAL OF THE UNRETURNED',
      title: "Let's talk.",
      lede:
        "Drop me an email if you want to chat about hardware, web dev, or potential collaborations. I read everything myself. Whether you're a tech person or just want to talk about building cool stuff, my inbox is open.",
      name: 'name',
      namePh: 'ada lovelace',
      message: 'message',
      messagePh: "let's build something cool…",
      submit: 'send via mail →',
      socials: 'elsewhere',
      terminalLabel: 'Interactive terminal — type help for commands',
      terminalInput: 'Terminal command input',
    },
    footer: { rights: 'built by hand' },
    notfound: {
      kicker: '404 · signal lost',
      title: 'nothing here.',
      lede: 'Looks like you took a wrong turn. Better head back home.',
      back: '← back to landing',
    },
    terminal: {
      greeting: ['tristan@bandung:~ guest shell', 'type "help" to list commands'],
      help: [
        'available commands:',
        '  help       this list',
        '  whoami     who is behind this site',
        '  status     current location + local time',
        '  contact    how to reach me',
        '  socials    elsewhere on the internet',
        '  projects   list of builds',
        '  deploy     deployment-finished screen',
        '  clear      wipe the screen',
      ],
      whoami: [
        'Tristan Edgina — Computer Engineering undergraduate at Telkom University, Bandung.',
        'I build hardware systems and wrap them in experimental web interfaces.',
      ],
      statusCity: 'location: Bandung, Indonesia',
      statusTime: 'local time: ',
      statusState: 'status: student, building hardware + web',
      contactEmail: 'email: ',
      contactForm: 'or use the contact form next door.',
      projectsTail: 'check out /projects for full build details.',
      deploy: [
        '— deployment finished —',
        '✓ build clean · tests passing',
        '✓ live: https://tristanedgina-portofolio.vercel.app',
        'screenshot away, this one is yours.',
      ],
      unknown: (input: string) => `command not found: ${input.trim()} — type "help" for the list`,
    },
    projectText: enProjectText,
  },
  id: {
    nav: {
      home: 'beranda',
      about: 'tentang',
      experience: 'pengalaman',
      skills: 'keahlian',
      projects: 'proyek',
      phoneography: 'fotografi',
      contact: 'kontak',
      cv: 'cv',
    },
    heroView: { lanyard: 'kartu id', girl: 'muse 3d' },
    hero: {
      role: 'teknik komputer · hardware & iot · frontend dev — bandung, id',
      intro:
        'Gue Tristan Edgina, anak Teknik Komputer Telkom University di Bandung. Gue suka bikin perangkat keras yang beneran jalan di dunia nyata — dari alat cek kesehatan, sensor air, sampai perangkat IoT — lengkap dengan antarmuka web yang digarap serius.',
      buildsLabel: 'build terdokumentasi',
      tzValue: 'utc+7, bandung',
      openLabel: 'terbuka',
      openValue: 'buat kolaborasi',
      ctaAbout: 'lihat karya gue →',
      ctaContact: 'sapa gue',
      ctaCV: 'unduh CV ▾',
      cvEN: 'English — Data-focused',
      cvID: 'Indonesia',
    },
    lanyard: { load: '◉ panggil kartu id', loading: 'lagi merajut talinya…' },
    prehero: { eyebrow: 'portofolio · vol. 01 — bandung, id', scroll: 'gulir untuk membuka' },
    miku: {
      hint: 'ketuk Miku — dia bisa ngomong',
      lines: [
        'Nyaa~ hai-hai! Gue Miku, kucing lab!',
        'Tristan ngoprek teknologi aneh di sini.',
        'Urocheck, Puresip, Techware, H2orizon — rakitan tangan semua!',
        'Nyaa, regangin kaki dulu. Scroll pelan-pelan.',
      ],
    },
    badge: 'mahasiswa',
    marquee: 'Perangkat Keras ✦ Sistem IoT ✦ Perangkat AI ✦ Frontend Kreatif',
    about: {
      kicker: '01 · EDGE OF THE ABYSS',
      title: 'Papan sirkuit dan kode yang rapi.',
      story: [
        'Kenalin, gue Tristan. Kalau lagi gak pusing mikirin tugas kuliah Teknik Komputer di Telkom University, Bandung, kegiatan gue biasanya gak jauh-jauh dari ngerakit sirkuit dan bikin purwarupa fisik.',
        'Gue suka bikin sesuatu yang wujudnya nyata di dunia fisik — perangkat yang ada sensornya, tombolnya, dan punya tantangan teknis tersendiri. Rasanya puas banget pas rangkaian PCB buatan sendiri akhirnya nyala dan berfungsi sesuai rencana.',
        'Pola pikir praktis itu juga yang nempel ke cara gue bikin web. Buat gue, frontend itu mirip hardware: bikin sesimpel mungkin, buang elemen yang gak berguna, dan pastikan fungsinya jalan mulus.',
      ],
      quote: 'Bikin alat yang jalan, bungkus dengan tampilan yang masuk akal.',
      skillsKicker: 'matriks skill & teknologi',
      skillGraph: {
        hint: 'seret untuk putar · klik node',
        level: 'Kemampuan',
        linked: 'Skill terkait',
        close: 'Tutup',
        hubs: {
          frontend: 'Frontend',
          backend: 'Backend',
          tools: 'Perkakas',
          infrastructure: 'Infrastruktur',
          devops: 'DevOps',
          observability: 'Observabilitas',
          soft: 'Soft Skills',
          core: 'Simpul Inti',
        },
      },
      experience: [
        {
          span: 'Top 10 · 2.700+',
          title: 'Innovation Challenge 2024',
          body: 'Akhir 2024, gue ikut Innovation Challenge: Generasi Terampil bareng tim Gentar (Tempest Tech) — gue, Saif, El, Atha, sama Sulthon. Dari 2.700+ peserta, kita bikin solusi buat masalah warga beneran dan tembus 10 tim yang tampil di Demo Day. Di sini gue belajar baca masalah, ngerancang solusi praktis, dan kolaborasi di bawah tekanan.',
        },
        {
          span: 'Medali emas · Apr 2025',
          title: 'H2ORIZON di JISF 2025',
          body: 'April 2025, gue ngerancang dan presentasiin H2ORIZON, botol adventure pintar buat explorer — sensor hidrasi dan lingkungan real-time. Proyek ini dapet Gold Medal Innovation Science di Jakarta International Science Fair — bukti kalau ide jadi nyata pas teknologi, desain, dan kebutuhan manusia ketemu.',
        },
        {
          span: 'Stage 4 · 10.000+',
          title: 'Samsung Innovation Campus 6',
          body: 'Kepilih dari 10.000+ pendaftar buat Samsung Innovation Campus Batch 6, gue gabung Tim Samsutron bareng Saif, Atha, sama Rado. Program intensif AI, IoT, dan programming ini ngebawa kita sampai Stage 4 dan nunjukin gimana software sama hardware nyambung jadi aplikasi dunia nyata.',
        },
        {
          span: 'Juara 2 · Jun 2025',
          title: 'Schools Reinventing Cities',
          body: 'Juni 2025, gue ikut kompetisi global C40 Cities bareng Rakha sama Kafka, ngerancang konsep Integrated Low-Emission Zone buat Jakarta yang dapet juara 2 Jakarta Barat — ngeluarin perspektif gue dari produk satuan ke gimana teknologi dan desain ikut ngebentuk kota lestari.',
        },
        {
          span: 'Arc baru · segera',
          title: 'College arc: segera dibuka',
          body: 'Chapter berikutnya: college arc gue di Fakultas Teknik Elektro, Telkom University. Lab baru, hardware baru, build baru — folder ini kebuka begitu semester jalan.',
        },
      ],
      experienceUi: {
        openFolder: 'buka folder',
        photos: 'foto',
        close: 'Tutup',
        prev: 'Foto sebelumnya',
        next: 'Foto berikutnya',
        of: 'dari',
        readMore: 'Selengkapnya',
        showLess: 'Lebih sedikit',
      },
    },
    bridgeBuilds:
      'Ide emang gampang diomongin, tapi hardware harus dibuktikan. Empat proyek ini berhasil jadi barang jadi — cek di bawah.',
    bridgeSkills:
      'Setiap proyek mendorong gue mengasah skill teknis dan kreatif yang serbaguna. Ini sekilas tentang skill yang menopang semua yang gue buat.',
    projects: {
      kicker: '02 · ARTIFAK DARI KEDALAMAN',
      title: 'Rakitan fisik, sistem IoT, dan hasil otak-atik di lab.',
      lede:
        'Semua yang ada di sini adalah perangkat beneran yang gue rakit, solder, dan tes sendiri selama sekolah. Biasanya berawal dari masalah sepele terus dibikin proto-nya. Klik salah satu buat lihat detail lengkap, masalah yang diselesaikas, sampai komponen di dalamnya.',
      back: '← proyek',
      allBuilds: 'semua proyek',
      problem: 'Masalah',
      approach: 'Pendekatan rekayasa',
      hardware: 'Bedah hardware',
    },
    filters: { all: 'semua' },
    phone: {
      kicker: 'rekaman lapangan · lapisan kelima',
      titleA: 'gue juga bisa',
      struck: 'fotografi',
      titleB: 'phone’ography',
      sub: '(belum punya kamera — semua ini dijepret pakai HP) ini beberapa foto gue',
      cta: 'mampir ke insta buat lebih banyak →',
    },
    bridgePeople:
      'Ngoprek kode sama hardware emang seru, tapi kenalan sama orang baru jauh lebih asik. Sapa gue aja.',
    contact: {
      kicker: '03 · CAPITAL OF THE UNRETURNED',
      title: 'Ngobrol yuk.',
      lede:
        'Kirim email aja kalau lu mau ngobrolin soal hardware, web development, atau mau kolaborasi. Semuanya bakal gue baca sendiri. Mau ngomongin soal teknik atau sekadar nanya-nanya proyek, sikat aja.',
      name: 'nama',
      namePh: 'ada lovelace',
      message: 'pesan',
      messagePh: 'yuk, bikin sesuatu yang seru…',
      submit: 'kirim via email →',
      socials: 'di tempat lain',
      terminalLabel: 'Terminal interaktif — ketik help untuk perintah',
      terminalInput: 'Input perintah terminal',
    },
    footer: { rights: 'dirakit sendiri' },
    notfound: {
      kicker: '404 · sinyal ilang',
      title: 'gak ada apa-apa di sini.',
      lede: 'Kayaknya lu salah jalan deh. Mending balik ke halaman utama.',
      back: '← kembali ke awal',
    },
    terminal: {
      greeting: ['tristan@bandung:~ shell tamu', 'ketik "help" buat lihat daftar perintah'],
      help: [
        'perintah yang tersedia:',
        '  help       daftar ini',
        '  whoami     siapa di balik situs ini',
        '  status     lokasi + waktu lokal',
        '  contact    cara kontak gue',
        '  socials    akun sosmed gue',
        '  projects   daftar rakitan hardware',
        '  deploy     layar deployment selesai',
        '  clear      bersihin layar',
      ],
      whoami: [
        'Tristan Edgina — anak Teknik Komputer Telkom University, Bandung.',
        'Suka ngoprek hardware dan bikin web interface yang eksperimental.',
      ],
      statusCity: 'lokasi: Bandung, Indonesia',
      statusTime: 'waktu lokal: ',
      statusState: 'status: mahasiswa, ngerjain hardware + web',
      contactEmail: 'email: ',
      contactForm: 'atau pakai form di sebelah terminal ini.',
      projectsTail: 'buka /projects buat lihat dokumentasi lengkapnya.',
      deploy: [
        '— deployment selesai —',
        '✓ build bersih · semua tes lolos',
        '✓ live: https://tristanedgina-portofolio.vercel.app',
        'silakan screenshot, yang ini buat lu.',
      ],
      unknown: (input: string) => `perintah gak dikenal: ${input.trim()} — ketik "help" buat lihat daftarnya`,
    },
    projectText: idProjectText,
  },
};
