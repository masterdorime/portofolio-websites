import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="not-found">
      <p className="page-kicker">404 · signal lost</p>
      <h1>static.</h1>
      <p className="page-lede" style={{ textAlign: 'center' }}>
        Nothing broadcasts on this frequency. The・tuning dial suggests heading home.
      </p>
      <Link href="/" className="btn" data-magnetic>← back to landing</Link>
    </main>
  );
}
