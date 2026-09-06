// Category filter buttons (spec §4/§6).
'use client';

import type { ProjectFilter } from '@/data/projects';
import { useDict } from '@/i18n/LanguageProvider';

export default function FilterBar({
  value,
  onChange,
}: {
  value: ProjectFilter;
  onChange: (v: ProjectFilter) => void;
}) {
  const t = useDict();
  const OPTIONS: Array<{ value: ProjectFilter; label: string }> = [
    { value: 'all', label: t.filters.all },
    { value: 'ai', label: 'ai' },
    { value: 'iot', label: 'iot' },
    { value: 'hardware', label: 'hardware' },
  ];
  return (
    <div className="filter-bar" role="group" aria-label="Filter projects by category">
      {OPTIONS.map(({ value: v, label }) => (
        <button
          key={v}
          type="button"
          className="filter-btn"
          aria-pressed={value === v}
          onClick={() => onChange(v)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
