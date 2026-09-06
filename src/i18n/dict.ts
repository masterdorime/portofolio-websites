// Bilingual dictionary: English + Bahasa Indonesia. Proper nouns (names,
// places, tech terms, social labels) stay untouched in both languages.

export type Lang = 'en' | 'id';

export interface ProjectText {
  tagline: string;
  description: string;
  problem: string;
  approach: string;
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
  unknown: (input: string) => string;
}

export interface Dict {
  nav: { about: string; projects: string; contact: string };
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
  };
  badge: string;
  marquee: string;
  about: {
    kicker: string;
    title: string;
    story: [string, string, string];
    quote: string;
    skillsKicker: string;
  };
  bridgeBuilds: string;
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
  },
  puresip: {
    tagline: 'Ultrafiltration straw with real-time sensors',
    description:
      "A portable water filtration straw equipped with live sensors. It doesn't just filter out bad stuff; it actually tells you in real-time whether the water you're drinking is safe.",
    problem:
      "When you're out hiking or dealing with an emergency, standard filtration gear is basically a guessing game. You never really know if the filter is failing or if the water is actually safe to drink.",
    approach:
      'Combines a hollow-fiber ultrafiltration membrane with live TDS and turbidity sensors. The built-in low-power MCU monitors water quality continuously and gives immediate feedback so you can drink with confidence.',
  },
  techware: {
    tagline: 'Smart thermal jacket',
    description:
      'An AI-assisted smart jacket that automatically adjusts its heating and cooling elements based on your body temperature and environment, keeping you comfortable without manual adjustments.',
    problem:
      "Traditional layered clothing is rigid. If you're commuting or exercising in changing weather, you either overheat or freeze because regular jackets can't adapt to your body's thermal shifts.",
    approach:
      'Embedded skin sensors and distributed heating elements controlled by an edge algorithm. It predicts your comfort level and adjusts temperature proactively, running entirely on a small wearable battery pack.',
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
  },
  puresip: {
    tagline: 'Sedotan ultrafiltrasi dengan sensor kualitas air',
    description:
      'Sedotan filter air portabel yang dilengkapi sensor digital. Jadi gak cuma nyaring kotoran doang, tapi alat ini ngasih tahu secara real-time kalau air yang lu minum beneran aman.',
    problem:
      'Pas lagi di alam bebas atau darurat, pakai filter air biasa tuh untung-untungan. Lu gak bakal tahu kapan filternya jebol atau airnya masih layak minum apa gak.',
    approach:
      'Gabungin membran ultrafiltrasi *hollow-fiber* dengan sensor TDS dan kekeruhan. MCU hemat daya mantau kualitas air terus-menerus, jadi ada indikator jelas sebelum air masuk ke mulut.',
  },
  techware: {
    tagline: 'Jaket thermal pintar',
    description:
      'Jaket pintar berbasis AI yang bisa ngatur sendiri kapan harus kasih panas atau pendinginan sesuai suhu tubuh dan lingkungan sekitar, tanpa perlu repot pencet tombol manual.',
    problem:
      'Pakai jaket berlapis-lapis itu ribet. Kalau lu lagi aktif di cuaca yang berubah-ubah, seringnya malah kepanasan pas gerak terus kedinginan pas diem, karena jaket biasa gak bisa menyesuaikan diri.',
    approach:
      'Nyematkan sensor suhu kulit dan elemen pemanas fleksibel yang diatur sama algoritma lokal. Sistemnya memprediksi perubahan suhu tubuh lu dan langsung menyesuaikan otomatis pakai baterai portable.',
  },
};

export const dict: Record<Lang, Dict> = {
  en: {
    nav: { about: 'about', projects: 'projects', contact: 'contact' },
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
    },
    badge: 'undergrad',
    marquee: 'Hardware ✦ IoT Systems ✦ AI Devices ✦ Creative Frontend',
    about: {
      kicker: '01 — about',
      title: 'Circuit boards and clean code.',
      story: [
        'I’m Tristan. When I’m not buried under assignments for my Computer Engineering degree at Telkom University in Bandung, you’ll usually find me knee-deep in electronics and physical prototypes.',
        'I like building things that exist in the physical space—devices with actual sensors, inputs, and real-world constraints. There’s a very specific kind of satisfaction when a custom-built circuit board finally boots up and works the way you planned.',
        'That same practical mindset spills over into my web work. I treat frontend development the same way I treat hardware: keep it clean, cut out the fluff, and make sure it actually does what it’s supposed to do.',
      ],
      quote: 'Build things that work, wrap them in interfaces that make sense.',
      skillsKicker: 'skills & tech matrix',
    },
    bridgeBuilds:
      'Ideas are nice, but hardware has to leave the desk. Here are three projects that actually made it out.',
    projects: {
      kicker: '02 — projects & labs',
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
      kicker: 'side quest',
      titleA: 'i also do',
      struck: 'photography',
      titleB: 'phone’ography',
      sub: '(i don’t have a camera yet — everything here was captured on my mobile phone) these are some of the photos i took',
      cta: 'visit my insta for more →',
    },
    bridgePeople:
      'Tools and code are cool, but talking to people is better. Hit me up.',
    contact: {
      kicker: '03 — contact',
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
      unknown: (input: string) => `command not found: ${input.trim()} — type "help" for the list`,
    },
    projectText: enProjectText,
  },
  id: {
    nav: { about: 'tentang', projects: 'proyek', contact: 'kontak' },
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
    },
    badge: 'mahasiswa',
    marquee: 'Perangkat Keras ✦ Sistem IoT ✦ Perangkat AI ✦ Frontend Kreatif',
    about: {
      kicker: '01 — tentang',
      title: 'Papan sirkuit dan kode yang rapi.',
      story: [
        'Kenalin, gue Tristan. Kalau lagi gak pusing mikirin tugas kuliah Teknik Komputer di Telkom University, Bandung, kegiatan gue biasanya gak jauh-jauh dari ngerakit sirkuit dan bikin purwarupa fisik.',
        'Gue suka bikin sesuatu yang wujudnya nyata di dunia fisik — perangkat yang ada sensornya, tombolnya, dan punya tantangan teknis tersendiri. Rasanya puas banget pas rangkaian PCB buatan sendiri akhirnya nyala dan berfungsi sesuai rencana.',
        'Pola pikir praktis itu juga yang nempel ke cara gue bikin web. Buat gue, frontend itu mirip hardware: bikin sesimpel mungkin, buang elemen yang gak berguna, dan pastikan fungsinya jalan mulus.',
      ],
      quote: 'Bikin alat yang jalan, bungkus dengan tampilan yang masuk akal.',
      skillsKicker: 'matriks skill & teknologi',
    },
    bridgeBuilds:
      'Ide emang gampang diomongin, tapi hardware harus dibuktikan. Tiga proyek ini berhasil jadi barang jadi — cek di bawah.',
    projects: {
      kicker: '02 — proyek & lab',
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
      kicker: 'misi sampingan',
      titleA: 'gue juga bisa',
      struck: 'fotografi',
      titleB: 'phone’ography',
      sub: '(belum punya kamera — semua ini dijepret pakai HP) ini beberapa foto gue',
      cta: 'mampir ke insta buat lebih banyak →',
    },
    bridgePeople:
      'Ngoprek kode sama hardware emang seru, tapi kenalan sama orang baru jauh lebih asik. Sapa gue aja.',
    contact: {
      kicker: '03 — kontak',
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
      unknown: (input: string) => `perintah gak dikenal: ${input.trim()} — ketik "help" buat lihat daftarnya`,
    },
    projectText: idProjectText,
  },
};
