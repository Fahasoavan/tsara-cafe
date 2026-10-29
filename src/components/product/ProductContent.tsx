'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  ORIGIN_LABELS,
  getProductBySlug,
  getGrindOptions,
  getUnitPrice,
  type FormatId,
  type GrindId,
} from '@/data/products';
import { useI18n } from '@/lib/i18n';
import { useCart } from '@/lib/cart';
import { formatMoney, round2 } from '@/lib/format';
import { BagVisual } from '@/components/BagVisual';
import { Reveal } from '@/components/ui/Reveal';
import {
  IconArrowRight,
  IconBag,
  IconCheck,
  IconMinus,
  IconPlus,
} from '@/components/ui/icons';

const FORMAT_ORDER: FormatId[] = ['s250', 's1000'];

export function ProductContent({ slug }: { slug: string }) {
  const { t, locale } = useI18n();
  const { add } = useCart();
  const product = getProductBySlug(slug);

  const [format, setFormat] = useState<FormatId>('s250');
  const [grind, setGrind] = useState<GrindId>('grains');
  const [qty, setQty] = useState(1);

  const grinds = useMemo(() => (product ? getGrindOptions(product) : []), [product]);

  if (!product) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-6 py-28 text-center">
        <h1 className="font-serif text-3xl font-bold">{t('product.notfound.title')}</h1>
        <p className="text-noir/70">{t('product.notfound.sub')}</p>
        <Link href="/catalogue" className="btn-card bg-caramel text-noir hover:-translate-y-0.5">
          {t('product.back')}
        </Link>
      </div>
    );
  }

  const isCoffret = product.type === 'coffret';
  const effectiveFormat: FormatId = isCoffret ? 'coffret' : format;
  const unitPrice = getUnitPrice(product, effectiveFormat);
  const total = round2(unitPrice * qty);
  const originLabel = ORIGIN_LABELS[product.origin];
  const notes = locale === 'en' ? product.notes.en : product.notes.fr;
  const contents = product.contents ? (locale === 'en' ? product.contents.en : product.contents.fr) : null;
  const badge = product.badge ? (locale === 'en' ? product.badge.en : product.badge.fr) : null;

  const grindValue = isCoffret ? null : grind;
  const nextQty = (delta: number) => setQty((q) => Math.min(99, Math.max(1, q + delta)));
  const incLabel = t('a11y.increase');
  const decLabel = t('a11y.decrease');

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      {/* Fil d'ariane */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-sm text-noir/55">
        <Link href="/" className="link-underline hover:text-noir">
          {t('nav.home')}
        </Link>
        <span aria-hidden="true">/</span>
        <Link href="/catalogue" className="link-underline hover:text-noir">
          {t('nav.catalog')}
        </Link>
        <span aria-hidden="true">/</span>
        <span className="font-medium text-noir">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        {/* ---------- Visuel ---------- */}
        <Reveal variant="zoom">
          <div className="relative flex h-full min-h-[380px] items-center justify-center rounded-[2rem] shadow-warm sm:min-h-[520px]"
            style={{
              background: `radial-gradient(500px 400px at 70% 20%, ${product.accent}30, transparent 70%), linear-gradient(135deg, ${product.accent}26, rgba(30,22,18,0.14))`,
            }}
          >
            {badge && (
              <span className="absolute left-5 top-5 rounded-full bg-noir px-3 py-1.5 text-xs font-semibold text-creme shadow">
                {badge}
              </span>
            )}
            <BagVisual
              accent={product.accent}
              deco={isCoffret ? 'gift' : 'coffee'}
              className="h-[85%] max-h-[460px] w-auto animate-float-slow drop-shadow-xl"
            />
            <span className="absolute bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/85 px-4 py-2 text-xs font-semibold text-noir shadow backdrop-blur">
              {t('type.' + product.type)} · {t('label.origin')} : {locale === 'en' ? originLabel.en : originLabel.fr}
            </span>
          </div>
        </Reveal>

        {/* ---------- Panneau de droite ---------- */}
        <div>
          <Reveal>
            <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-[2.6rem]">{product.name}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="chip">{t(`roastValue.${product.roast}`)}</span>
              <span className="chip">{locale === 'en' ? originLabel.en : originLabel.fr}</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sauge/15 px-3 py-1 text-xs font-semibold text-sauge-deep">
                <IconCheck className="h-3.5 w-3.5" strokeWidth={2.5} />
                {t('product.instock')}
              </span>
            </div>
            <p className="mt-5 leading-relaxed text-noir/75">
              {locale === 'en' ? product.description.en : product.description.fr}
            </p>
          </Reveal>

          {/* Notes de dégustation */}
          <Reveal delay={80}>
            <div className="mt-6">
              <p className="label-warm">{t('label.notes')}</p>
              <div className="flex flex-wrap gap-2">
                {notes.map((n) => (
                  <span
                    key={n}
                    className="rounded-full border border-caramel/40 bg-caramel/10 px-3 py-1 text-sm font-medium text-caramel-deep"
                  >
                    {n}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Contenu d'un coffret */}
          {isCoffret && contents && (
            <Reveal delay={100}>
              <div className="mt-6 rounded-xl border border-caramel/40 bg-caramel/10 p-4">
                <p className="label-warm mb-1">{t('product.includes')}</p>
                <p className="text-sm leading-relaxed text-noir/80">{contents}</p>
                <p className="mt-2 text-xs font-medium text-caramel-deep">{t('product.setNote')}</p>
              </div>
            </Reveal>
          )}

          {/* Choix du format */}
          {!isCoffret && (
            <Reveal delay={120}>
              <div className="mt-7">
                <p className="label-warm">{t('product.format')}</p>
                <div className="flex flex-wrap gap-3" role="group" aria-label={t('product.format')}>
                  {FORMAT_ORDER.map((f) => {
                    const price = getUnitPrice(product, f);
                    const selected = format === f;
                    return (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setFormat(f)}
                        aria-pressed={selected}
                        className={`flex min-w-[9.5rem] flex-col items-start rounded-2xl border-2 px-4 py-3 text-left transition-all duration-200 ${
                          selected
                            ? 'border-caramel bg-caramel/10 shadow-warm'
                            : 'border-noir/15 bg-white hover:border-caramel/60'
                        }`}
                      >
                        <span className="font-serif text-lg font-bold">{t(f === 's250' ? 'format.250' : 'format.1000')}</span>
                        <span className="text-sm font-semibold text-noir/80">{formatMoney(price, locale)}</span>
                        <span className="mt-0.5 text-xs text-noir/50">
                          {t('product.per100g', { price: formatMoney(round2(price / 10), locale) })}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </Reveal>
          )}

          {/* Choix de la mouture */}
          {!isCoffret && grinds.length > 0 && (
            <Reveal delay={160}>
              <div className="mt-6">
                <p className="label-warm">{t('product.grind')}</p>
                <div className="flex flex-wrap gap-2" role="group" aria-label={t('product.grind')}>
                  {grinds.map((g) => {
                    const selected = grind === g;
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGrind(g)}
                        aria-pressed={selected}
                        className={`rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 ${
                          selected
                            ? 'border-noir bg-noir text-creme'
                            : 'border-noir/15 bg-white text-noir/70 hover:border-noir/40 hover:text-noir'
                        }`}
                      >
                        {t(`grind.${g}`)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </Reveal>
          )}

          {/* Quantité + prix + ajout */}
          <Reveal delay={200}>
            <div className="mt-8 rounded-2xl border border-noir/10 bg-white p-5 shadow-[0_1px_2px_rgba(30,22,18,0.05)]">
              <div className="flex flex-wrap items-center gap-5">
                <div>
                  <p className="label-warm mb-2">{t('product.qty')}</p>
                  <div className="flex items-center rounded-full border border-noir/15">
                    <button
                      type="button"
                      onClick={() => nextQty(-1)}
                      aria-label={decLabel}
                      disabled={qty <= 1}
                      className="flex h-10 w-10 items-center justify-center rounded-full text-noir/70 transition hover:bg-creme-soft disabled:opacity-30"
                    >
                      <IconMinus className="h-4 w-4" />
                    </button>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={99}
                      value={qty}
                      onChange={(e) => {
                        const n = parseInt(e.target.value || '1', 10);
                        if (!Number.isNaN(n)) setQty(Math.min(99, Math.max(1, n)));
                      }}
                      aria-label={t('product.qty')}
                      className="w-12 bg-transparent text-center font-semibold focus-visible:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => nextQty(1)}
                      aria-label={incLabel}
                      className="flex h-10 w-10 items-center justify-center rounded-full text-noir/70 transition hover:bg-creme-soft"
                    >
                      <IconPlus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="ml-auto text-right">
                  <p aria-live="polite" className="font-serif text-3xl font-bold">
                    {formatMoney(total, locale)}
                  </p>
                  <p className="text-xs text-noir/50">
                    {formatMoney(unitPrice, locale)} × {qty}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => add(product.id, effectiveFormat, grindValue, qty)}
                className="btn-card mt-5 w-full bg-caramel text-noir shadow-warm hover:-translate-y-0.5 hover:bg-caramel-deep hover:text-creme"
              >
                <IconBag className="h-4 w-4" />
                {t('product.addToCart')}
              </button>

              <ul className="mt-5 space-y-2 border-t border-noir/10 pt-4 text-sm text-noir/70">
                {(['product.info1', 'product.info2', 'product.info3'] as const).map((k) => (
                  <li key={k} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-sauge/20 text-sauge-deep">
                      <IconCheck className="h-2.5 w-2.5" strokeWidth={3} />
                    </span>
                    {t(k)}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* Lien retour */}
          <Reveal delay={240}>
            <Link
              href="/catalogue"
              className="link-underline mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-caramel-deep"
            >
              <IconArrowRight className="h-4 w-4 rotate-180" />
              {t('product.back')}
            </Link>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
