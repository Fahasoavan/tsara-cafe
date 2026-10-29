'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/**
 * Fait apparaître son contenu au scroll (IntersectionObserver).
 * Respecte prefers-reduced-motion via la classe .reveal (voir globals.css).
 */
export function Reveal({
  children,
  className = '',
  delay = 0,
  variant = 'up',
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: 'up' | 'left' | 'zoom';
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === 'undefined') {
      node.classList.add('revealed');
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            node.classList.add('revealed');
            io.disconnect();
          }
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -30px 0px' },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${variant === 'up' ? '' : `reveal-${variant}`} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
