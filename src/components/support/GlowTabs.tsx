// Support kit tabs — active pill glows in dark, solid in light.
'use client';

import { useState } from 'react';

export default function GlowTabs({
  options,
  defaultValue,
  onChange,
  label = 'tabs',
}: {
  options: string[];
  defaultValue?: string;
  onChange?: (v: string) => void;
  label?: string;
}) {
  const [active, setActive] = useState(defaultValue ?? options[0]);
  return (
    <div className="sup-tabs" role="tablist" aria-label={label}>
      {options.map((opt) => (
        <button
          key={opt}
          role="tab"
          aria-selected={opt === active}
          className="sup-tabs__btn"
          onClick={() => {
            setActive(opt);
            onChange?.(opt);
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
