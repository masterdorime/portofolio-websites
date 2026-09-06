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
  uricheck: {
    tagline: 'Portable AI urine analysis',
    description:
      'Portable AI-powered urine checker device; on-device AI determines symptoms the user may have. Conceived for bedrooms and village clinics rather than laboratories — screening that fits in a drawer and answers in minutes, with its reasoning kept deliberately legible.',
    problem:
      'Laboratory urinalysis is slow, expensive, and unavailable outside clinics. People with recurring renal-health concerns need a fast, private check at home. The gap is not just cost — it is the days of anxious waiting between giving a sample and understanding what it means, a wait that keeps people from checking at all.',
    approach:
      'Sensor array captures chemical markers; an on-device inference model maps readings to likely symptom patterns, returning instant guidance with a confidence level instead of waiting days for lab results. Everything runs locally on the microcontroller: no samples leave the room, no account is required, and the output is framed as guidance toward a professional, never as a diagnosis.',
  },
  puresip: {
    tagline: 'Ultrafiltration straw with live sensors',
    description:
      'Portable ultrafiltration straw with multiple sensors ensuring safe drinkable water anywhere you go. It pairs a hollow-fiber membrane with live quality readouts, so the straw does not just filter — it testifies, sip by sip, that the water is actually safe.',
    problem:
      'Hikers, travelers, and disaster-zone residents cannot trust untreated water sources. Existing filter straws give no feedback on whether the water is actually safe right now. A filter is a promise you cannot verify — and when the membrane fouls or the source is worse than it looks, silence is the worst possible interface.',
    approach:
      'Hollow-fiber ultrafiltration paired with live turbidity and TDS monitoring. Sensors gate the drinking path and report water quality in real time, so the user knows every sip meets safety thresholds. The electronics sip power rather than gulp it: the whole sensing chain is budgeted for multi-day trips away from any outlet.',
  },
  techware: {
    tagline: 'AI-powered thermal jacket',
    description:
      'AI-powered jacket with self-determining heat and cold control, ensuring perfect body temperature. Distributed thermal elements and skin sensors close the loop around comfort itself — clothing that notices you are about to overheat before you do.',
    problem:
      'Layered clothing is a static compromise. Athletes and commuters in swing climates overheat mid-activity then chill at rest because garments cannot adapt. Every existing "heated jacket" is a dumb resistor with a switch; none of them know whether you are actually warm.',
    approach:
      'Distributed thermal elements and skin/environment sensors feed an edge model that predicts comfort drift and actuates heating or active cooling before discomfort arrives. Inference stays on the garment over a low-energy link: the jacket keeps working in a tunnel, on a trail, or anywhere the cloud is a rumor.',
  },
};

const idProjectText: Record<string, ProjectText> = {
  uricheck: {
    tagline: 'Analisis urine AI portabel',
    description:
      'Perangkat pemeriksa urine portabel bertenaga AI; AI di perangkat menentukan gejala yang mungkin dimiliki pengguna. Dirancang untuk kamar tidur dan klinik desa, bukan laboratorium — skrining yang muat di laci dan menjawab dalam hitungan menit, dengan penalaran yang dibuat sele gamblang.',
    problem:
      'Urinanalisis laboratorium lambat, mahal, dan tak tersedia di luar klinik. Penderita gangguan ginjal berulang butuh pemeriksaan cepat dan privat di rumah. Kesenjangannya bukan sekadar biaya — melainkan hari-hari menunggu cemas antara memberikan sampel dan memahami artinya, penantian yang membuat orang enggan memeriksa.',
    approach:
      'Deretan sensor menangkap penanda kimia; model inferensi di perangkat memetakan hasil bacaan ke pola gejala, memberi panduan instan beserta tingkat kepercayaan alih-alih menunggu hasil lab berhari-hari. Semuanya berjalan lokal di mikrokontroler: tak ada sampel yang keluar ruangan, tak perlu akun, dan keluarannya dibingkai sebagai panduan menuju tenaga profesional, bukan diagnosis.',
  },
  puresip: {
    tagline: 'Sedotan ultrafiltrasi bersensor langsung',
    description:
      'Sedotan ultrafiltrasi portabel dengan banyak sensor yang memastikan air minum aman di mana pun Anda berada. Ia memadukan membran hollow-fiber dengan pembacaan kualitas langsung, sehingga sedotan ini tak sekadar menyaring — ia bersaksi, tegukan demi tegukan, bahwa airnya benar-benar aman.',
    problem:
      'Pendaki, pelancong, dan warga zona bencana tak bisa memercayai sumber air mentah. Sedotan filter yang ada tak memberi umpan balik apakah airnya benar-benar aman saat ini juga. Filter adalah janji yang tak bisa diverifikasi — dan saat membran jenuh atau sumbernya lebih buruk dari kelihatannya, diam adalah antarmuka terburuk.',
    approach:
      'Ultrafiltrasi hollow-fiber dipadukan dengan pemantauan kekeruhan dan TDS langsung. Sensor menjaga jalur minum dan melaporkan kualitas air secara real-time, sehingga pengguna tahu setiap tegukan memenuhi ambang aman. Elektronikanya mengirit daya, bukan rakus: seluruh rantai sensing dianggarkan untuk perjalanan berhari-hari jauh dari colokan.',
  },
  techware: {
    tagline: 'Jaket termal bertenaga AI',
    description:
      'Jaket bertenaga AI dengan kontrol panas dan dingin mandiri, memastikan suhu tubuh sempurna. Elemen termal tersebar dan sensor kulit menutup loop di sekitar kenyamanan itu sendiri — pakaian yang menyadari Anda akan kepanasan sebelum Anda sadar.',
    problem:
      'Pakaian berlapis adalah kompromi statis. Atlet dan komuter di iklim yang berubah-ubah kepanasan saat beraktivitas lalu kedinginan saat istirahat karena pakaian tak bisa beradaptasi. Setiap "jaket pemanas" yang ada hanyalah resistor bodoh dengan saklar; tak satu pun tahu apakah Anda benar-benar hangat.',
    approach:
      'Elemen termal tersebar dan sensor kulit/lingkungan memberi umpan pada model edge yang memprediksi pergeseran kenyamanan lalu mengaktuasi pemanas atau pendingin aktif sebelum rasa tak nyaman tiba. Inferensi tetap di pakaian melalui tautan hemat energi: jaket tetap bekerja di terowongan, di jalur pendakian, atau di mana pun cloud hanya tinggal rumor.',
  },
};

export const dict: Record<Lang, Dict> = {
  en: {
    nav: { about: 'about', projects: 'projects', contact: 'contact' },
    heroView: { lanyard: 'id card', girl: '3d muse' },
    hero: {
      role: 'computer engineering · physical systems · creative frontend — bandung, id',
      intro:
        "I'm Tristan Edgina, a Computer Engineering undergraduate at Telkom University, Bandung. I build physical things that sense the world — portable laboratories, garments with opinions, water you can trust — and I present them through interfaces given the same care as the circuits.",
      buildsLabel: 'builds documented',
      tzValue: 'utc+7, bandung',
      openLabel: 'open',
      openValue: 'to collaborations',
      ctaAbout: 'meet the builder →',
      ctaContact: 'say hello',
    },
    badge: 'undergrad',
    marquee: 'Hardware ✦ IoT Systems ✦ AI Devices ✦ Creative Frontend',
    about: {
      kicker: '01 — about',
      title: 'Precision instruments, memory-soft interfaces.',
      story: [
        'I study Computer Engineering at Telkom University, Bandung, where I learned that a schematic and a stylesheet are the same thing: instructions for how a stranger should feel when they meet your work.',
        'Most weeks you will find me at the bench — soldering under a desk lamp, arguing with datasheets, coaxing an oscilloscope to confess what the firmware did last night. I like builds you can weigh in your hand, failures you can smell, and fixes that involve a screwdriver.',
        'And I like interfaces with the same honesty: no spinners hiding broken state, no neon shouting over weak ideas. This site is both halves at once — the person above, the devices below, presented the way I wish every datasheet looked.',
      ],
      quote: 'Structure you can measure, atmosphere you can feel — engineering with a memory.',
      skillsKicker: 'skills & tech matrix',
    },
    bridgeBuilds:
      'Every device leaves the bench. These three made it out into the world — here is the proof.',
    projects: {
      kicker: '02 — projects & labs',
      title: 'Physical builds, IoT systems, custom silicon-adjacent tinkering.',
      lede:
        "Every entry below is a real device: sensed, soldered, and iterated as far as a student lab allows. Each one started as a stubborn real-world annoyance — slow lab results, untrustworthy water, clothing that can't keep up — and became a box of sensors with an opinion. Open any build for the full breakdown: the problem, the engineering approach, and exactly what sits inside the enclosure.",
      back: '← projects',
      allBuilds: 'all builds',
      problem: 'Problem',
      approach: 'Engineering approach',
      hardware: 'Hardware breakdown',
    },
    filters: { all: 'all' },
    bridgePeople:
      'Tools and tales are only half the circuit. The other half is people — come say hello.',
    contact: {
      kicker: '03 — contact',
      title: 'Open a channel.',
      lede:
        'The fastest way to reach me is email — I read everything myself. Writing about a collaboration? Tell me what it senses, what it moves, or what it should make someone feel. Hardware people and web people are both welcome; people who are a little of each get answered first.',
      name: 'name',
      namePh: 'ada lovelace',
      message: 'message',
      messagePh: "let's build something strange…",
      submit: 'send via mail →',
      socials: 'elsewhere',
      terminalLabel: 'Interactive terminal — type help for commands',
      terminalInput: 'Terminal command input',
    },
    footer: { rights: 'built by hand' },
    notfound: {
      kicker: '404 · signal lost',
      title: 'static.',
      lede: 'Nothing broadcasts on this frequency. The tuning dial suggests heading home.',
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
        'Tristan Edgina — Computer Engineering undergraduate, Telkom University, Bandung.',
        'Builds physical systems, then wraps them in interfaces worth touching.',
      ],
      statusCity: 'location: Bandung, Indonesia',
      statusTime: 'local time: ',
      statusState: 'status: undergrad, building hardware + web',
      contactEmail: 'email: ',
      contactForm: 'or use the form right next to this terminal.',
      projectsTail: 'open /projects for the full breakdowns.',
      unknown: (input: string) => `command not found: ${input.trim()} — type "help" for the list`,
    },
    projectText: enProjectText,
  },
  id: {
    nav: { about: 'tentang', projects: 'proyek', contact: 'kontak' },
    heroView: { lanyard: 'kartu id', girl: 'muse 3d' },
    hero: {
      role: 'teknik komputer · sistem fisik · frontend kreatif — bandung, id',
      intro:
        'Saya Tristan Edgina, mahasiswa sarjana Teknik Komputer di Telkom University, Bandung. Saya membangun benda fisik yang bisa merasakan dunia — laboratorium portabel, pakaian yang punya pendirian, air yang bisa dipercaya — dan saya membungkusnya dalam antarmuka yang dibuat dengan ketelitian yang sama seperti rangkaiannya.',
      buildsLabel: 'build terdokumentasi',
      tzValue: 'utc+7, bandung',
      openLabel: 'terbuka',
      openValue: 'untuk kolaborasi',
      ctaAbout: 'kenalan dulu →',
      ctaContact: 'sapa saya',
    },
    badge: 'mahasiswa',
    marquee: 'Perangkat Keras ✦ Sistem IoT ✦ Perangkat AI ✦ Frontend Kreatif',
    about: {
      kicker: '01 — tentang',
      title: 'Instrumen presisi, antarmuka selembut memori.',
      story: [
        'Saya kuliah Teknik Komputer di Telkom University, Bandung, tempat saya belajar bahwa skematik dan stylesheet pada dasarnya sama: instruksi tentang bagaimana seharusnya orang asing merasa saat pertama kali bertemu karya Anda.',
        'Hampir setiap minggu saya bisa ditemukan di meja kerja — menyolder di bawah lampu meja, berdebat dengan datasheet, membujuk osiloskop agar mau mengaku apa yang dilakukan firmware semalam. Saya suka rakitan yang bisa ditimbang dengan tangan, kegagalan yang bisa dicium baunya, dan perbaikan yang melibatkan obeng.',
        'Dan saya suka antarmuka yang sama jujurnya: tanpa spinner yang menyembunyikan state rusak, tanpa neon yang berteriak menutupi ide lemah. Situs ini adalah kedua belahan itu sekaligus — orangnya di atas, perangkatnya di bawah, disajikan seperti saya berharap setiap datasheet tampil.',
      ],
      quote: 'Struktur yang bisa diukur, suasana yang bisa dirasakan — rekayasa yang punya memori.',
      skillsKicker: 'matriks skill & teknologi',
    },
    bridgeBuilds:
      'Setiap perangkat meninggalkan meja kerja. Tiga di antaranya berhasil keluar ke dunia — inilah buktinya.',
    projects: {
      kicker: '02 — proyek & lab',
      title: 'Rakitan fisik, sistem IoT, otak-atik mendekati silikon.',
      lede:
        'Setiap entri di bawah ini adalah perangkat nyata: disensor, disolder, dan diiterasi sejauh laboratorium kampus memungkinkan. Semuanya berawal dari kejengkelan dunia nyata yang membandel — hasil lab yang lambat, air yang tak bisa dipercaya, pakaian yang tak bisa mengimbangi — lalu menjadi sekotak sensor yang punya pendirian. Buka setiap build untuk bedah lengkapnya: masalahnya, pendekatan rekayasanya, dan tepat apa yang duduk di dalam enklosur.',
      back: '← proyek',
      allBuilds: 'semua proyek',
      problem: 'Masalah',
      approach: 'Pendekatan rekayasa',
      hardware: 'Bedah hardware',
    },
    filters: { all: 'semua' },
    bridgePeople:
      'Perkakas dan kisah hanyalah separuh rangkaian. Separuh lainnya adalah manusia — mampir dan sapa.',
    contact: {
      kicker: '03 — kontak',
      title: 'Buka sebuah kanal.',
      lede:
        'Cara tercepat menghubungi saya adalah email — saya baca semuanya sendiri. Menulis soal kolaborasi? Ceritakan apa yang ia rasakan, apa yang ia gerakkan, atau apa yang seharusnya ia buat orang rasakan. Baik kubu hardware maupun kubu web sama-sama diterima; yang sedikit dari keduanya dijawab paling dulu.',
      name: 'nama',
      namePh: 'ada lovelace',
      message: 'pesan',
      messagePh: 'mari membangun sesuatu yang aneh…',
      submit: 'kirim via email →',
      socials: 'di tempat lain',
      terminalLabel: 'Terminal interaktif — ketik help untuk perintah',
      terminalInput: 'Input perintah terminal',
    },
    footer: { rights: 'dibuat dengan tangan' },
    notfound: {
      kicker: '404 · sinyal hilang',
      title: 'statis.',
      lede: 'Tidak ada siaran di frekuensi ini. Putaran tuning menyarankan untuk pulang.',
      back: '← kembali ke awal',
    },
    terminal: {
      greeting: ['tristan@bandung:~ shell tamu', 'ketik "help" untuk daftar perintah'],
      help: [
        'perintah yang tersedia:',
        '  help       daftar ini',
        '  whoami     siapa di balik situs ini',
        '  status     lokasi + waktu lokal saat ini',
        '  contact    cara menghubungi saya',
        '  socials    saya di internet',
        '  projects   daftar rakitan',
        '  clear      bersihkan layar',
      ],
      whoami: [
        'Tristan Edgina — mahasiswa sarjana Teknik Komputer, Telkom University, Bandung.',
        'Merakit sistem fisik, lalu membungkusnya dengan antarmuka yang layak disentuh.',
      ],
      statusCity: 'lokasi: Bandung, Indonesia',
      statusTime: 'waktu lokal: ',
      statusState: 'status: mahasiswa, merakit hardware + web',
      contactEmail: 'email: ',
      contactForm: 'atau gunakan formulir di sebelah terminal ini.',
      projectsTail: 'buka /projects untuk bedah lengkapnya.',
      unknown: (input: string) => `perintah tak dikenal: ${input.trim()} — ketik "help" untuk daftarnya`,
    },
    projectText: idProjectText,
  },
};
