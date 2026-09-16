// Click-to-load stage for the Lanyard card. The physics + texture + env map
// init is deferred until the visitor explicitly summons it, so the heavy
// WebGL boot happens on user intent (after the intro and hero have settled)
// instead of racing every other first-paint workload. Bilingual via useDict.
'use client';

import { Suspense, useState } from 'react';
import Lanyard from './Lanyard';
import type { LanyardProps } from './Lanyard';
import { useDict } from '@/i18n/LanguageProvider';

export default function LanyardStage(props: LanyardProps) {
  const t = useDict();
  const [summoned, setSummoned] = useState(false);

  if (!summoned) {
    return (
      <button
        type="button"
        className="btn lanyard-summon"
        onClick={() => setSummoned(true)}
        data-magnetic
      >
        {t.lanyard.load}
      </button>
    );
  }

  return (
    <Suspense fallback={<p className="lanyard-loading">{t.lanyard.loading}</p>}>
      <Lanyard {...props} />
    </Suspense>
  );
}
