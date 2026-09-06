// Landing badge: vintage-passport aesthetic + live WIB clock (spec §7).
'use client';

import { useEffect, useState } from 'react';
import { SITE } from '@/data/site';
import { formatWib } from '@/lib/time/wib';
import { useDict } from '@/i18n/LanguageProvider';

export default function HeroBadge() {
  // Null until mounted so server and client render the same placeholder (no hydration mismatch).
  const [now, setNow] = useState<Date | null>(null);
  const t = useDict();

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <p className="hero-badge" aria-label={`Academic status: undergraduate at ${SITE.university}`}>
      <span className="dot" aria-hidden />
      <span>
        {SITE.university} · {t.badge} · <time>{now ? formatWib(now) : '--:--:-- WIB'}</time>
      </span>
    </p>
  );
}
