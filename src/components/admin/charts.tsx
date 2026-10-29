'use client';

import { useEffect, useId, useState } from 'react';
import type { DayPoint } from '@/lib/analytics';
import { formatMoney } from '@/lib/format';

/**
 * Graphiques faits main en SVG — aucune dépendance externe.
 * Dégradés de la marque, animations CSS, info-bulles natives <title>.
 */

/* ------------------------------------------------------------------ */
/* Courbe d'aire : CA journalier                                       */
/* ------------------------------------------------------------------ */
export function RevenueAreaChart({
  series,
  locale = 'fr',
  className = '',
}: {
  series: DayPoint[];
  locale?: string;
  className?: string;
}) {
  const uid = useId().replace(/[:]/g, '');
  const W = 640;
  const H = 260;
  const PAD_X = 14;
  const PAD_BOTTOM = 30;
  const TOP = 14;

  const max = Math.max(...series.map((s) => s.revenue), 1) * 1.18;
  const innerW = W - PAD_X * 2;
  const innerH = H - PAD_BOTTOM - TOP;
  const x = (i: number) => PAD_X + (i * innerW) / Math.max(1, series.length - 1);
  const y = (v: number) => TOP + innerH - (v / max) * innerH;

  /* Courbe lissée par des courbes de Bézier horizontales */
  let linePath = '';
  if (series.length > 0) {
    const first = series[0];
    linePath = `M ${x(0).toFixed(1)},${y(first.revenue).toFixed(1)}`;
    for (let i = 1; i < series.length; i += 1) {
      const px = x(i - 1);
      const py = y(series[i - 1].revenue);
      const cx = x(i);
      const cy = y(series[i].revenue);
      const midX = ((px + cx) / 2).toFixed(1);
      linePath += ` C ${midX},${py.toFixed(1)} ${midX},${cy.toFixed(1)} ${cx.toFixed(1)},${cy.toFixed(1)}`;
    }
  }
  const areaPath =
    linePath &&
    `${linePath} L ${x(series.length - 1).toFixed(1)},${(TOP + innerH).toFixed(1)} L ${x(0).toFixed(1)},${(TOP + innerH).toFixed(1)} Z`;

  const labelStep = Math.max(1, Math.ceil(series.length / 6));
  const hasData = series.some((s) => s.revenue > 0);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={`w-full ${className}`} role="img" aria-label="Évolution des ventes">
      <defs>
        <linearGradient id={`rev-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C07A3A" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#C07A3A" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Grille */}
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <line
          key={f}
          x1={PAD_X}
          x2={W - PAD_X}
          y1={TOP + innerH - f * innerH}
          y2={TOP + innerH - f * innerH}
          stroke="#1E1612"
          strokeOpacity={f === 1 ? 0.25 : 0.08}
          strokeDasharray={f === 1 ? undefined : '3 6'}
        />
      ))}

      {/* Aire + courbe */}
      {areaPath && <path d={areaPath} fill={`url(#rev-${uid})`} className={hasData ? 'animate-fade-in' : ''} />}
      {linePath && (
        <path
          d={linePath}
          fill="none"
          stroke="#C07A3A"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeDasharray={hasData ? undefined : '4 8'}
        />
      )}

      {/* Points + info-bulles natives */}
      {series.map((p, i) => (
        <g key={p.key}>
          <circle cx={x(i)} cy={y(p.revenue)} r="3.4" fill="#C07A3A" stroke="#F6EFE6" strokeWidth="1.6" opacity={hasData ? 1 : 0} />
          <circle cx={x(i)} cy={y(p.revenue)} r="11" fill="transparent">
            <title>
              {p.label} — {formatMoney(p.revenue, locale)} · {p.orders} {p.orders === 1 ? 'commande' : 'commandes'}
            </title>
          </circle>
        </g>
      ))}

      {/* Axe abscisses */}
      {series.map((p, i) =>
        i % labelStep === 0 || i === series.length - 1 ? (
          <text
            key={`x-${p.key}`}
            x={x(i)}
            y={H - 8}
            textAnchor="middle"
            fontSize="10"
            fill="#1E1612"
            fillOpacity="0.45"
          >
            {p.label}
          </text>
        ) : null,
      )}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Barres horizontales animées                                        */
/* ------------------------------------------------------------------ */
export interface BarRow {
  label: string;
  sub?: string;
  /** Valeur affichée à droite */
  value: string;
  /** Part relative (0–100) */
  pct: number;
  color?: string;
}

export function BarsList({ rows }: { rows: BarRow[] }) {
  const [go, setGo] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setGo(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const max = Math.max(...rows.map((r) => r.pct), 1);

  return (
    <ul className="space-y-3.5">
      {rows.map((row, i) => (
        <li key={`${row.label}-${i}`}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 flex-1 truncate font-medium text-noir/85">
              {row.label}
              {row.sub && <span className="ml-2 text-xs font-normal text-noir/45">{row.sub}</span>}
            </span>
            <span className="font-semibold tabular-nums" title={row.value}>{row.value}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-noir/10">
            <div
              className="h-full rounded-full"
              style={{
                width: go ? `${(row.pct / max) * 100}%` : '0%',
                background: row.color ?? 'linear-gradient(90deg, #C07A3A, #C07A3A80)',
                transition: `width 0.9s cubic-bezier(0.22,1,0.36,1) ${i * 90}ms`,
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Donut (répartition)                                                */
/* ------------------------------------------------------------------ */
export interface DonutPart {
  label: string;
  value: number;
  color: string;
}

export function Donut({
  parts,
  centerLabel,
  centerValue,
  locale = 'fr',
}: {
  parts: DonutPart[];
  centerLabel: string;
  centerValue: string;
  locale?: string;
}) {
  const uid = useId().replace(/[:]/g, '');
  const total = parts.reduce((sum, p) => sum + p.value, 0);
  const R = 62;
  const C = 2 * Math.PI * R;

  let offset = 0;
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <svg viewBox="0 0 180 180" className="w-44 sm:w-48" role="img" aria-label={centerLabel}>
        {/* anneau de fond */}
        <circle cx="90" cy="90" r={R} fill="none" stroke="#1E1612" strokeOpacity="0.08" strokeWidth="24" />
        {mounted &&
          total > 0 &&
          parts.map((p) => {
            if (p.value <= 0) return null;
            const dash = (p.value / total) * C;
            const el = (
              <circle
                key={p.label}
                cx="90"
                cy="90"
                r={R}
                fill="none"
                stroke={p.color}
                strokeWidth="24"
                strokeDasharray={`${Math.max(0, dash - 2)} ${C}`}
                strokeDashoffset={-offset}
                transform="rotate(-90 90 90)"
                className="transition-[stroke-dasharray,stroke-dashoffset] duration-1000"
              >
                <title>
                  {p.label} — {formatMoney(p.value, locale)}
                </title>
              </circle>
            );
            offset += dash;
            return el;
          })}
        {/* Centre */}
        <text x="90" y="86" textAnchor="middle" fontSize="21" fontWeight="700" fill="#1E1612" className="font-serif">
          {centerValue}
        </text>
        <text x="90" y="106" textAnchor="middle" fontSize="10" fill="#1E1612" fillOpacity="0.5">
          {centerLabel}
        </text>
      </svg>

      {/* Légende */}
      <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs">
        {parts.map((p) => {
          const pct = total > 0 ? Math.round((p.value / total) * 100) : 0;
          return (
            <li key={p.label} className="flex items-center gap-1.5 text-noir/70">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.color }} aria-hidden="true" />
              {p.label}
              <span className="font-semibold">{pct}&nbsp;%</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
