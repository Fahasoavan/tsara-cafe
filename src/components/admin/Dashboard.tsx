'use client';

import { useMemo } from 'react';
import {
  computeKpis,
  countByStatus,
  dailySeries,
  revenueByFormat,
  topProducts,
} from '@/lib/analytics';
import { useI18n } from '@/lib/i18n';
import { formatMoney } from '@/lib/format';
import { BarsList, Donut, RevenueAreaChart, type BarRow, type DonutPart } from '@/components/admin/charts';
import { Reveal } from '@/components/ui/Reveal';
import { IconLoader } from '@/components/ui/icons';
import type { StoredOrder } from '@/lib/types';

const STATUS_COLORS: Record<string, string> = {
  paid: '#6B7F5E',
  preparing: '#C07A3A',
  shipped: '#1E1612',
};

export function Dashboard({
  orders,
  seeding = false,
  onSeed,
}: {
  orders: StoredOrder[];
  seeding?: boolean;
  onSeed?: () => void;
}) {
  const { t, locale } = useI18n();

  const kpis = useMemo(() => computeKpis(orders), [orders]);
  const series = useMemo(() => dailySeries(orders, 30, locale), [orders, locale]);
  const top = useMemo(() => topProducts(orders, 5), [orders]);
  const formats = useMemo(() => revenueByFormat(orders), [orders]);
  const statuses = useMemo(() => countByStatus(orders), [orders]);

  /* ---------- État vide : aucune vente ---------- */
  if (orders.length === 0) {
    return (
      <Reveal className="mt-8 flex flex-col items-center gap-4 rounded-3xl border border-dashed border-noir/20 bg-white/60 py-16 text-center">
        <span className="text-4xl" aria-hidden="true">📊</span>
        <h2 className="font-serif text-xl font-semibold">{t('admin.empty.dash')}</h2>
        <p className="max-w-md text-sm text-noir/60">{t('admin.empty.dashSub')}</p>
        {onSeed && (
          <button
            type="button"
            onClick={onSeed}
            disabled={seeding}
            className="btn-card bg-noir text-creme hover:bg-caramel hover:text-noir disabled:opacity-70"
          >
            {seeding ? <IconLoader className="h-4 w-4 animate-spin" /> : null}
            {seeding ? t('admin.demo.seeding') : t('admin.demo.seed')}
          </button>
        )}
      </Reveal>
    );
  }

  /* ---------- Donut des formats ---------- */
  const formatParts: DonutPart[] = [
    { label: t('format.250'), value: formats.s250, color: '#C07A3A' },
    { label: t('format.1000'), value: formats.s1000, color: '#6B7F5E' },
    { label: t('format.coffret'), value: formats.coffret, color: '#1E1612' },
  ];

  /* ---------- Top produits ---------- */
  const topRows: BarRow[] = top.map((p) => ({
    label: locale === 'en' ? p.name.en : p.name.fr,
    sub: t('admin.chart.topUnits', { n: p.units }),
    value: formatMoney(p.revenue, locale),
    pct: p.revenue,
  }));

  /* ---------- Statuts ---------- */
  const totalStatuses = statuses.reduce((s, x) => s + x.count, 0) || 1;
  const statusRows: BarRow[] = statuses.map((s) => ({
    label: t(`status.${s.status}`),
    value: String(s.count),
    pct: s.count,
    color: STATUS_COLORS[s.status],
  }));

  return (
    <div className="mt-8 space-y-6">
      {/* ---------- KPI ---------- */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* CA (+ évolution 7 j vs 7 j précédents) */}
        <Reveal delay={0}>
          <div className="flex h-full flex-col justify-between rounded-2xl border border-noir/10 bg-white p-5 shadow-[0_1px_2px_rgba(30,22,18,0.05)] transition-shadow hover:shadow-warm">
            <p className="text-xs font-semibold uppercase tracking-wide text-noir/50">{t('admin.kpi.revenue')}</p>
            <p className="mt-2 font-serif text-2xl font-bold sm:text-3xl">{formatMoney(kpis.revenue, locale)}</p>
            {kpis.growth7 === null ? (
              <p className="mt-1 text-xs text-noir/40">{t('admin.kpi.growth')}</p>
            ) : (
              <p
                className={`mt-1 inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${
                  kpis.growth7 >= 0 ? 'bg-sauge/15 text-sauge-deep' : 'bg-red-100 text-red-600'
                }`}
              >
                {kpis.growth7 >= 0 ? '▲' : '▼'} {Math.abs(kpis.growth7).toLocaleString(locale === 'en' ? 'en' : 'fr')} %
                <span className="font-medium opacity-70">{t('admin.kpi.growth')}</span>
              </p>
            )}
          </div>
        </Reveal>

        <Reveal delay={70}>
          <div className="flex h-full flex-col rounded-2xl border border-noir/10 bg-white p-5 shadow-[0_1px_2px_rgba(30,22,18,0.05)] transition-shadow hover:shadow-warm">
            <p className="text-xs font-semibold uppercase tracking-wide text-noir/50">{t('admin.kpi.orders')}</p>
            <p className="mt-2 font-serif text-2xl font-bold sm:text-3xl">{kpis.ordersCount}</p>
            <p className="mt-1 text-xs text-noir/40">{t('admin.kpi.ordersSub')}</p>
          </div>
        </Reveal>

        <Reveal delay={140}>
          <div className="flex h-full flex-col rounded-2xl border border-noir/10 bg-white p-5 shadow-[0_1px_2px_rgba(30,22,18,0.05)] transition-shadow hover:shadow-warm">
            <p className="text-xs font-semibold uppercase tracking-wide text-noir/50">{t('admin.kpi.avg')}</p>
            <p className="mt-2 font-serif text-2xl font-bold sm:text-3xl">{formatMoney(kpis.avgBasket, locale)}</p>
            <p className="mt-1 text-xs text-noir/40">{t('admin.kpi.avgSub')}</p>
          </div>
        </Reveal>

        <Reveal delay={210}>
          <div className="flex h-full flex-col rounded-2xl border border-noir/10 bg-white p-5 shadow-[0_1px_2px_rgba(30,22,18,0.05)] transition-shadow hover:shadow-warm">
            <p className="text-xs font-semibold uppercase tracking-wide text-noir/50">{t('admin.kpi.items')}</p>
            <p className="mt-2 font-serif text-2xl font-bold sm:text-3xl">{kpis.itemsSold}</p>
            <p className="mt-1 text-xs text-noir/40">{t('admin.kpi.itemsSub')}</p>
          </div>
        </Reveal>
      </div>

      {/* ---------- Courbe CA + donut formats ---------- */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Reveal delay={60} className="lg:col-span-2">
          <section className="h-full rounded-3xl border border-noir/10 bg-white p-5 shadow-[0_1px_2px_rgba(30,22,18,0.05)]">
            <h2 className="font-serif text-lg font-bold">{t('admin.chart.daily')}</h2>
            <RevenueAreaChart series={series} locale={locale} className="mt-3" />
          </section>
        </Reveal>

        <Reveal delay={120}>
          <section className="h-full rounded-3xl border border-noir/10 bg-white p-5 shadow-[0_1px_2px_rgba(30,22,18,0.05)]">
            <h2 className="font-serif text-lg font-bold">{t('admin.chart.format')}</h2>
            <div className="mt-4 pb-2">
              <Donut
                parts={formatParts}
                centerLabel={t('admin.kpi.revenue')}
                centerValue={formatMoney(kpis.revenue, locale)}
                locale={locale}
              />
            </div>
          </section>
        </Reveal>
      </div>

      {/* ---------- Top produits + statuts ---------- */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Reveal delay={60} className="lg:col-span-2">
          <section className="h-full rounded-3xl border border-noir/10 bg-white p-5 shadow-[0_1px_2px_rgba(30,22,18,0.05)]">
            <h2 className="flex items-center justify-between font-serif text-lg font-bold">
              {t('admin.chart.top')}
              <span className="text-xs font-medium text-noir/40">{t('admin.kpi.growth')}</span>
            </h2>
            <div className="mt-5">
              {topRows.length > 0 ? (
                <BarsList rows={topRows} />
              ) : (
                <p className="text-sm text-noir/50">{t('admin.empty.dash')}</p>
              )}
            </div>
          </section>
        </Reveal>

        <Reveal delay={120}>
          <section className="h-full rounded-3xl border border-noir/10 bg-white p-5 shadow-[0_1px_2px_rgba(30,22,18,0.05)]">
            <h2 className="font-serif text-lg font-bold">{t('admin.chart.status')}</h2>
            <div className="mt-5 space-y-2">
              <BarsList rows={statusRows} />
              <p className="pt-1 text-xs text-noir/45">
                {t('status.paid')} → {t('status.preparing')} → {t('status.shipped')}
              </p>
            </div>
          </section>
        </Reveal>
      </div>
    </div>
  );
}
