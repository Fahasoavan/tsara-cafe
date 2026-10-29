'use client';

import { useId } from 'react';

/**
 * Sachet de café dessiné en SVG (aucune image distante).
 * `accent` donne la couleur dominante du sachet ; `deco="gift"`
 * ajoute un ruban pour les coffrets.
 */
export function BagVisual({
  accent = '#C07A3A',
  deco = 'coffee',
  className = '',
  labelLines = true,
  'aria-hidden': ariaHidden,
}: {
  accent?: string;
  deco?: 'coffee' | 'gift';
  className?: string;
  labelLines?: boolean;
  'aria-hidden'?: boolean | 'true' | 'false';
}) {
  const uid = useId().replace(/[:]/g, '');
  const gradId = `bag-g-${uid}`;
  const shineId = `bag-s-${uid}`;

  return (
    <svg
      viewBox="0 0 120 168"
      className={className}
      role="img"
      aria-hidden={ariaHidden}
      aria-label="Illustration d’un sachet de café Tsara"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={accent} />
          <stop offset="55%" stopColor={mixAndDarken(accent, 0.45)} />
          <stop offset="100%" stopColor="#1E1612" />
        </linearGradient>
        <linearGradient id={shineId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.28" />
          <stop offset="30%" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.08" />
        </linearGradient>
      </defs>

      {/* Crête supérieure soudée */}
      <path
        d="M28 30l6-7 6 7 6-7 6 7 6-7 6 7 6-7 6 7 6-7 6 7 6-7 6 7h-96Z"
        fill={mixAndDarken(accent, 0.7)}
        opacity="0.95"
      />

      {/* Corps du sachet */}
      <rect x="26" y="30" width="68" height="116" rx="7" fill={`url(#${gradId})`} />

      {/* Reflet */}
      <rect x="26" y="30" width="68" height="116" rx="7" fill={`url(#${shineId})`} />

      {/* Bandeau supérieur foncé */}
      <rect x="26" y="38" width="68" height="13" rx="4" fill="#1E1612" opacity="0.35" />

      {/* Étiquette centrale */}
      <rect x="35" y="86" width="50" height="40" rx="6" fill="#F6EFE6" opacity="0.97" />
      <ellipse cx="60" cy="99" rx="5.4" ry="7.4" fill={accent} transform="rotate(22 60 99)" />
      <path
        d="M60 93 C 56.8 97 56.8 101 60 105"
        stroke="#1E1612"
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
        transform="rotate(22 60 99)"
      />
      {labelLines && (
        <>
          <line x1="46" y1="112" x2="74" y2="112" stroke="#1E1612" strokeOpacity="0.45" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="51" y1="117" x2="69" y2="117" stroke="#1E1612" strokeOpacity="0.3" strokeWidth="1.6" strokeLinecap="round" />
        </>
      )}

      {/* Ruban pour les coffrets */}
      {deco === 'gift' && (
        <>
          <rect x="52" y="30" width="16" height="116" fill="#F6EFE6" opacity="0.5" />
          <circle cx="60" cy="66" r="9" fill="#F6EFE6" opacity="0.8" />
          <path
            d="M60 66 C 51 58 46 74 60 66 C 69 58 74 74 60 66"
            stroke={accent}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </>
      )}

      {/* Soudure sous le sachet */}
      <line x1="28" y1="146" x2="92" y2="146" stroke="#1E1612" strokeOpacity="0.35" strokeWidth="2" strokeLinecap="round" />
      {/* Ombre au sol */}
      <ellipse cx="60" cy="158" rx="34" ry="5" fill="#1E1612" opacity="0.12" />
    </svg>
  );
}

/** Assombrit fortement une couleur hex (pour les dégradés) */
function mixAndDarken(hex: string, amount: number): string {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return hex;
  const to = (s: string) => Math.round(parseInt(s, 16) * (1 - amount));
  const r = to(m[1]).toString(16).padStart(2, '0');
  const g = to(m[2]).toString(16).padStart(2, '0');
  const b = to(m[3]).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}
