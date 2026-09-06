'use client';

import Link from 'next/link';
import { useDict } from '@/i18n/LanguageProvider';

export default function NotFound() {
  const t = useDict();
  return (
    <main className="not-found">
      <p className="page-kicker">{t.notfound.kicker}</p>
      <h1>{t.notfound.title}</h1>
      <p className="page-lede" style={{ textAlign: 'center' }}>
        {t.notfound.lede}
      </p>
      <Link href="/" className="btn" data-magnetic>{t.notfound.back}</Link>
    </main>
  );
}
