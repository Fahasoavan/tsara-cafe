'use client';

import { useMemo, useState } from 'react';
import {
  ORIGIN_LABELS,
  PRODUCTS,
  getMinPrice,
  getOrigins,
  type Product,
  type ProductType,
} from '@/data/products';
import { useI18n } from '@/lib/i18n';
import { ProductCard } from '@/components/ProductCard';
import { Reveal } from '@/components/ui/Reveal';
import { IconRefresh } from '@/components/ui/icons';

type TypeFilter = 'all' | ProductType;
type SortId = 'featured' | 'priceAsc' | 'priceDesc' | 'name';

const TYPE_OPTIONS: { id: TypeFilter }[] = [
  { id: 'all' },
  { id: 'grains' },
  { id: 'moulu' },
  { id: 'coffret' },
];

export function CatalogContent() {
  const { t, locale } = useI18n();
  const [type, setType] = useState<TypeFilter>('all');
  const [origin, setOrigin] = useState<string>('all');
  const [sort, setSort] = useState<SortId>('featured');

  const origins = useMemo(() => getOrigins(), []);

  const filtered = useMemo(() => {
    let list: Product[] = [...PRODUCTS];
    if (type !== 'all') list = list.filter((p) => p.type === type);
    if (origin !== 'all') list = list.filter((p) => p.origin === origin);

    switch (sort) {
      case 'priceAsc':
        list.sort((a, b) => getMinPrice(a) - getMinPrice(b));
        break;
      case 'priceDesc':
        list.sort((a, b) => getMinPrice(b) - getMinPrice(a));
        break;
      case 'name':
        list.sort((a, b) => a.name.localeCompare(b.name, locale === 'en' ? 'en' : 'fr'));
        break;
      default:
        /* Mise en avant : phares d'abord, puis ordre du catalogue */
        list.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
    }
    return list;
  }, [type, origin, sort, locale]);

  const hasFilters = type !== 'all' || origin !== 'all';
  const reset = () => {
    setType('all');
    setOrigin('all');
    setSort('featured');
  };

  const sortLabel = (id: SortId) => t(`cat.sort.${id}`);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      {/* En-tête */}
      <Reveal>
        <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl">{t('cat.title')}</h1>
        <p className="mt-3 max-w-2xl text-noir/65">{t('cat.sub')}</p>
      </Reveal>

      {/* Filtres */}
      <Reveal delay={80}>
        <div className="mt-8 flex flex-wrap items-end gap-4 rounded-2xl border border-noir/10 bg-white/70 p-4 backdrop-blur-sm sm:gap-6">
          {/* Type */}
          <div className="min-w-[9.5rem] flex-1 sm:flex-none">
            <label htmlFor="filter-type" className="label-warm">
              {t('cat.filter.type')}
            </label>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label={t('cat.filter.type')}>
              {TYPE_OPTIONS.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setType(o.id)}
                  aria-pressed={type === o.id}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                    type === o.id
                      ? 'border-noir bg-noir text-creme'
                      : 'border-noir/15 bg-white text-noir/60 hover:border-noir/40 hover:text-noir'
                  }`}
                >
                  {t(o.id === 'all' ? 'cat.filter.typeAll' : `type.${o.id}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Origine */}
          <div className="min-w-[10rem]">
            <label htmlFor="filter-origin" className="label-warm">
              {t('cat.filter.origin')}
            </label>
            <select
              id="filter-origin"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full appearance-none rounded-xl border border-noir/15 bg-white px-3.5 py-2.5 text-sm font-medium focus-visible:outline-none"
            >
              <option value="all">{t('cat.filter.originAll')}</option>
              {origins.map((o) => (
                <option key={o} value={o}>
                  {(() => {
                    const l = ORIGIN_LABELS[o];
                    return l ? (locale === 'en' ? l.en : l.fr) : o;
                  })()}
                </option>
              ))}
            </select>
          </div>

          {/* Tri */}
          <div className="min-w-[11rem]">
            <label htmlFor="filter-sort" className="label-warm">
              {t('cat.filter.sort')}
            </label>
            <select
              id="filter-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortId)}
              className="w-full appearance-none rounded-xl border border-noir/15 bg-white px-3.5 py-2.5 text-sm font-medium focus-visible:outline-none"
            >
              {(['featured', 'priceAsc', 'priceDesc', 'name'] as SortId[]).map((id) => (
                <option key={id} value={id}>
                  {sortLabel(id)}
                </option>
              ))}
            </select>
          </div>

          {/* Reset */}
          <div>
            <button
              type="button"
              onClick={reset}
              disabled={!hasFilters}
              className="inline-flex items-center gap-2 rounded-xl border border-noir/15 px-3.5 py-2.5 text-sm font-medium text-noir/70 transition-colors hover:border-noir/40 hover:text-noir disabled:cursor-not-allowed disabled:opacity-40"
            >
              <IconRefresh className="h-4 w-4" />
              {t('cat.reset')}
            </button>
          </div>

          {/* Compteur */}
          <p aria-live="polite" className="ml-auto text-sm font-semibold text-noir/60">
            {filtered.length === 1 ? t('cat.resultsOne') : t('cat.resultsOther', { n: filtered.length })}
          </p>
        </div>
      </Reveal>

      {/* Grille */}
      {filtered.length > 0 ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p, i) => (
            <Reveal key={p.id} delay={(i % 3) * 90}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      ) : (
        <Reveal className="mt-16 flex flex-col items-center gap-3 rounded-3xl border border-dashed border-noir/20 bg-white/50 py-16 text-center">
          <span className="text-4xl" aria-hidden="true">
            ☕
          </span>
          <h2 className="font-serif text-xl font-semibold">{t('cat.empty.title')}</h2>
          <p className="text-sm text-noir/60">{t('cat.empty.sub')}</p>
          <button
            type="button"
            onClick={reset}
            className="btn-card mt-2 bg-noir text-creme hover:bg-caramel hover:text-noir"
          >
            {t('cat.reset')}
          </button>
        </Reveal>
      )}
    </div>
  );
}
