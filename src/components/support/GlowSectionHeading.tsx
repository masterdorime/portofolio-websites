// Support kit section heading — title text-glow in dark, ink-flat in light.
export default function GlowSectionHeading({
  kicker,
  title,
  lede,
}: {
  kicker: string;
  title: string;
  lede?: string;
}) {
  return (
    <div>
      <p className="sup-heading__kicker">{kicker}</p>
      <h2 className="sup-heading__title">{title}</h2>
      {lede ? <p className="sup-heading__lede">{lede}</p> : null}
    </div>
  );
}
