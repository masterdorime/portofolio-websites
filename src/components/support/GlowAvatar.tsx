// Support kit avatar — neon ring in dark, soft shadow in light.
import Image from 'next/image';

export default function GlowAvatar({
  src,
  alt,
  size = 48,
  online,
}: {
  src: string;
  alt: string;
  size?: number;
  online?: boolean;
}) {
  return (
    <span className="sup-avatar" style={{ width: size, height: size }}>
      <Image src={src} alt={alt} width={size} height={size} style={{ width: size - 4, height: size - 4 }} />
      {typeof online === 'boolean' ? (
        <span
          className={`sup-avatar__status${online ? ' sup-avatar__status--online' : ''}`}
          aria-label={online ? 'online' : 'offline'}
        />
      ) : null}
    </span>
  );
}
