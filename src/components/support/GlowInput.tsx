// Support kit field — label + input/textarea/select with theme-aware focus ring.
import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

function Shell({
  label,
  hint,
  error,
  children,
  htmlFor,
}: {
  label?: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className={`sup-field${error ? ' sup-field--error' : ''}`}>
      {label ? (
        <label className="sup-field__label" htmlFor={htmlFor}>
          {label}
        </label>
      ) : null}
      {children}
      {error ? <p className="sup-field__error">{error}</p> : hint ? <p className="sup-field__hint">{hint}</p> : null}
    </div>
  );
}

export function GlowInput({
  label,
  hint,
  error,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label?: string; hint?: string; error?: string }) {
  return (
    <Shell label={label} hint={hint} error={error} htmlFor={rest.id}>
      <input className="sup-input" {...rest} />
    </Shell>
  );
}

export function GlowTextarea({
  label,
  hint,
  error,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; hint?: string; error?: string }) {
  return (
    <Shell label={label} hint={hint} error={error} htmlFor={rest.id}>
      <textarea className="sup-textarea" {...rest} />
    </Shell>
  );
}

export function GlowSelect({
  label,
  hint,
  error,
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & { label?: string; hint?: string; error?: string }) {
  return (
    <Shell label={label} hint={hint} error={error} htmlFor={rest.id}>
      <select className="sup-select" {...rest}>
        {children}
      </select>
    </Shell>
  );
}
