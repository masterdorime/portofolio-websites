'use client';

// ponytail: minimal route fallback — no stack leak, one retry.
export default function Error({ reset }: { reset: () => void }) {
  return (
    <main className="page" style={{ paddingTop: '6rem', textAlign: 'center' }}>
      <p className="page-kicker">something snapped</p>
      <h1 className="page-title">Offline for a sec.</h1>
      <button type="button" className="btn" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
