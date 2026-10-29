import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement>;

function stroke(props: P): P {
  return {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
    ...props,
  };
}

/* --- Logo : grain de café dans un cercle --- */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} role="img" aria-label="Tsara Café">
      <circle cx="20" cy="20" r="20" fill="#1E1612" />
      <ellipse cx="20" cy="20.5" rx="8.6" ry="11.4" fill="#C07A3A" transform="rotate(24 20 20.5)" />
      <path
        d="M20 10.5 C 15.5 16.5 15.5 25.5 20 30.5"
        stroke="#1E1612"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
        transform="rotate(24 20 20.5)"
      />
    </svg>
  );
}

export function IconBag(p: P) {
  return (
    <svg {...stroke(p)}>
      <path d="M5.5 8.5h13l-1.1 11.2a1.6 1.6 0 0 1-1.6 1.3H8.2a1.6 1.6 0 0 1-1.6-1.3L5.5 8.5Z" />
      <path d="M9 8.5V7a3 3 0 0 1 6 0v1.5" />
    </svg>
  );
}

export function IconMenu(p: P) {
  return (
    <svg {...stroke(p)}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function IconClose(p: P) {
  return (
    <svg {...stroke(p)}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function IconPlus(p: P) {
  return (
    <svg {...stroke(p)}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconMinus(p: P) {
  return (
    <svg {...stroke(p)}>
      <path d="M5 12h14" />
    </svg>
  );
}

export function IconTruck(p: P) {
  return (
    <svg {...stroke(p)}>
      <path d="M2.5 6.5h11v10h-11zM13.5 10h4l3 3v3.5h-7" />
      <circle cx="6.5" cy="17.5" r="1.8" />
      <circle cx="17" cy="17.5" r="1.8" />
    </svg>
  );
}

export function IconLeaf(p: P) {
  return (
    <svg {...stroke(p)}>
      <path d="M5 19c0-8 5-13 14-13 0 9-5 13-11 13H5Z" />
      <path d="M5 19c3-5 6-8 10-9.5" />
    </svg>
  );
}

export function IconFlame(p: P) {
  return (
    <svg {...stroke(p)}>
      <path d="M12 3c1 3 4 4.5 4 8a4 4 0 0 1-8 0c0-1.6.7-2.7 1.4-3.6C10.2 6.3 11.4 5 12 3Z" />
      <path d="M9.5 21h5" />
    </svg>
  );
}

export function IconSprout(p: P) {
  return (
    <svg {...stroke(p)}>
      <path d="M12 21v-8" />
      <path d="M12 13C12 9 9 7 4.5 7 4.5 11 7.5 13 12 13Z" />
      <path d="M12 10c0-3.5 2.5-5.5 7.5-5.5 0 3.5-2.5 5.5-7.5 5.5Z" />
    </svg>
  );
}

export function IconGift(p: P) {
  return (
    <svg {...stroke(p)}>
      <path d="M4 10h16v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V10Z" />
      <path d="M3 7h18v3H3zM12 7v14" />
      <path d="M12 7C10 3.5 6.5 3.6 6.7 5.8 6.9 7.4 9 7 12 7Zm0 0c2-3.5 5.5-3.4 5.3-1.2C17.1 7.4 15 7 12 7Z" />
    </svg>
  );
}

export function IconStar(p: P) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
      <path d="M12 2.6l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.5 6.1 20.6l1.2-6.5-4.8-4.6 6.6-.9L12 2.6Z" />
    </svg>
  );
}

export function IconCheck(p: P) {
  return (
    <svg {...stroke(p)}>
      <path d="M4.5 12.5l5 5L19.5 7" />
    </svg>
  );
}

export function IconArrowRight(p: P) {
  return (
    <svg {...stroke(p)}>
      <path d="M4 12h16m-6-6 6 6-6 6" />
    </svg>
  );
}

export function IconSearch(p: P) {
  return (
    <svg {...stroke(p)}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" />
    </svg>
  );
}

export function IconPrinter(p: P) {
  return (
    <svg {...stroke(p)}>
      <path d="M7 8V4h10v4M5 8h14a1 1 0 0 1 1 1v7h-4M8 13h8v7H8v-7Z" />
      <path d="M5 16H4V9a1 1 0 0 1 1-1" />
    </svg>
  );
}

export function IconShield(p: P) {
  return (
    <svg {...stroke(p)}>
      <path d="M12 3l7 2.5v5.2c0 4.6-3 8-7 10.3-4-2.3-7-5.7-7-10.3V5.5L12 3Z" />
      <path d="M9 12l2 2 4-4.5" />
    </svg>
  );
}

export function IconTrash(p: P) {
  return (
    <svg {...stroke(p)}>
      <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6.5 7l.8 12a1.4 1.4 0 0 0 1.4 1.3h6.6a1.4 1.4 0 0 0 1.4-1.3l.8-12" />
      <path d="M10 11v6m4-6v6" />
    </svg>
  );
}

export function IconRefresh(p: P) {
  return (
    <svg {...stroke(p)}>
      <path d="M20 5v5h-5" />
      <path d="M4 19v-5h5" />
      <path d="M19.4 10a8 8 0 0 0-14-2.5L4 12m1 2a8 8 0 0 0 13.6 3.5L20 12" />
    </svg>
  );
}

export function IconLoader(p: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...p}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.9s" repeatCount="indefinite" />
    </svg>
  );
}
