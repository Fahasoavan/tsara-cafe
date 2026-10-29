'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  ORIGIN_LABELS,
  PRODUCTS,
  getUnitPrice,
  type Product,
} from '@/data/products';
import { useI18n } from '@/lib/i18n';
import { useCart } from '@/lib/cart';
import { lineKey } from '@/lib/cart-utils';
import { findPromo } from '@/lib/promo';
import { shippingFor, FREE_SHIPPING_MIN } from '@/lib/shipping';
import { formatMoney, round2 } from '@/lib/format';
import type { CartLine } from '@/lib/types';
import { BagVisual } from '@/components/BagVisual';
import { Reveal } from '@/components/ui/Reveal';
import { IconBag, IconCheck, IconClose, IconMinus, IconPlus, IconTruck } from '@/components/ui/icons';

export function CartContent() {
  const { t, locale } = useI18n();
  const { lines, ready, count, setQty, remove, clear } = useCart();

  const [promoInput, setPromoInput] = useState('');
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [promoError, setPromoError] = useState(false);

  const namedLines = useMemo(
    () =>
      lines
        .map((line) => ({ line, product: PRODUCTS.find((p) => p.id === line.productId) }))
        .filter((entry): entry is { line: CartLine; product: Product } => Boolean(entry.product)),
    [lines],
  );

  const subtotal = round2(
    namedLines.reduce((sum, { line, product }) => sum + getUnitPrice(product, line.format) * line.qty, 0),
  );
  const discount = promoCode ? round2((subtotal * (findPromo(promoCode)?.percentOff ?? 0)) / 100) : 0;
  const afterDiscount = round2(subtotal - discount);
  const shipping = shippingFor(afterDiscount);
  const total = round2(afterDiscount + shipping);
  const missing = round2(Math.max(0, FREE_SHIPPING_MIN - afterDiscount));
  const progress = Math.min(100, (afterDiscount / FREE_SHIPPING_MIN) * 100);

  const applyPromo = () => {
    const found = findPromo(promoInput);
    if (found) {
      setPromoCode(found.code);
      setPromoError(false);
      setPromoInput('');
    } else {
      setPromoError(true);
    }
  };

  if (!ready) {
    /* squelette pendant la lecture du localStorage */
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="skeleton h-10 w-44" />
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-4">
            <div className="skeleton h-28 w-full" />
            <div className="skeleton h-28 w-full" />
          </div>
          <div className="skeleton h-64 w-full" />
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 px-4 py-24 text-center sm:px-6">
        <Reveal variant="zoom">
          <BagVisual accent="#C07A3A" className="h-44 w-auto animate-float" aria-hidden />
        </Reveal>
        <Reveal delay={80}>
          <h1 className="font-serif text-3xl font-bold">{t('cart.empty.title')}</h1>
          <p className="mt-2 text-noir/60">{t('cart.empty.sub')}</p>
          <Link
            href="/catalogue"
            className="btn-card mt-6 bg-caramel text-noir shadow-warm hover:-translate-y-0.5 hover:bg-caramel-deep hover:text-creme"
          >
            {t('cart.empty.cta')}
          </Link>
        </Reveal>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <Reveal className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="font-serif text-4xl font-bold tracking-tight">{t('cart.title')}</h1>
        <p aria-live="polite" className="text-sm font-semibold text-noir/55">
          {count === 1 ? t('cart.itemsOne') : t('cart.itemsOther', { n: count })}
        </p>
      </Reveal>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1.55fr_1fr]">
        {/* ---------- Lignes du panier ---------- */}
        <ul className="space-y-4">
          {namedLines.map(({ line, product }, i) => {
            const origin = ORIGIN_LABELS[product.origin];
            const unit = getUnitPrice(product, line.format);
            const lineTotal = round2(unit * line.qty);
            return (
              <Reveal key={lineKey(line)} delay={i * 70} variant="zoom">
                <li className="flex flex-wrap items-center gap-4 rounded-2xl border border-noir/10 bg-white p-4 shadow-[0_1px_2px_rgba(30,22,18,0.04)] transition-shadow hover:shadow-warm sm:flex-nowrap">
                  <Link
                    href={`/produit/${product.slug}`}
                    className="flex h-24 w-20 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: `linear-gradient(135deg, ${product.accent}30, ${product.accent}12)` }}
                    title={product.name}
                  >
                    <BagVisual
                      accent={product.accent}
                      deco={product.type === 'coffret' ? 'gift' : 'coffee'}
                      labelLines={false}
                      className="h-[92%] w-auto transition-transform duration-300 hover:scale-105"
                    />
                  </Link>

                  <div className="min-w-[9rem] flex-1">
                    <Link href={`/produit/${product.slug}`} className="font-serif text-lg font-semibold hover:text-caramel-deep">
                      {product.name}
                    </Link>
                    <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-noir/50">
                      {locale === 'en' ? origin.en : origin.fr}
                    </p>
                    <p className="mt-1 text-sm text-noir/70">
                      {line.format === 'coffret'
                        ? t('format.coffret')
                        : line.format === 's250'
                          ? t('format.250')
                          : t('format.1000')}
                      {line.grind && (
                        <>
                          {' · '}
                          {t(`grind.${line.grind}`)}
                        </>
                      )}
                    </p>
                    <p className="text-xs text-noir/50">{formatMoney(unit, locale)} × {line.qty}</p>
                  </div>

                  {/* Quantité */}
                  <div className="flex items-center rounded-full border border-noir/15">
                    <button
                      type="button"
                      aria-label={t('a11y.decrease')}
                      onClick={() => setQty(line, line.qty - 1)}
                      className="flex h-9 w-9 items-center justify-center rounded-full text-noir/70 transition hover:bg-creme-soft"
                    >
                      <IconMinus className="h-3.5 w-3.5" />
                    </button>
                    <span aria-live="polite" className="w-9 text-center text-sm font-semibold">
                      {line.qty}
                    </span>
                    <button
                      type="button"
                      aria-label={t('a11y.increase')}
                      onClick={() => setQty(line, line.qty + 1)}
                      disabled={line.qty >= 99}
                      className="flex h-9 w-9 items-center justify-center rounded-full text-noir/70 transition hover:bg-creme-soft disabled:opacity-30"
                    >
                      <IconPlus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <p className="w-24 text-right font-serif text-lg font-bold">{formatMoney(lineTotal, locale)}</p>

                  <button
                    type="button"
                    onClick={() => remove(line)}
                    aria-label={t('a11y.remove')}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-noir/10 text-noir/50 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                  >
                    <IconClose className="h-4 w-4" />
                  </button>
                </li>
              </Reveal>
            );
          })}

          <li className="flex justify-between pt-2">
            <Link href="/catalogue" className="link-underline text-sm font-semibold text-caramel-deep">
              ← {t('cart.summary.continue')}
            </Link>
            <button
              type="button"
              onClick={clear}
              className="link-underline text-sm font-medium text-noir/50 hover:text-red-600"
            >
              {t('a11y.remove')} — {t('cart.title')}
            </button>
          </li>
        </ul>

        {/* ---------- Récapitulatif ---------- */}
        <Reveal delay={120} variant="zoom" className="lg:sticky lg:top-24">
          <section aria-labelledby="cart-summary-title" className="rounded-3xl border border-noir/10 bg-white p-6 shadow-warm">
            <h2 id="cart-summary-title" className="font-serif text-xl font-bold">
              {t('cart.summary.title')}
            </h2>

            {/* Progression livraison offerte */}
            <div
              className={`mt-4 rounded-xl p-3.5 ${
                missing > 0 ? 'bg-caramel/10' : 'bg-sauge/15'
              }`}
            >
              <p className="flex items-center gap-2 text-xs font-semibold leading-snug">
                <IconTruck className={`h-4 w-4 shrink-0 ${missing > 0 ? 'text-caramel-deep' : 'text-sauge-deep'}`} />
                {missing > 0 ? t('cart.freeRemaining', { amount: formatMoney(missing, locale) }) : t('cart.freeDone')}
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-noir/10">
                <div
                  className={`h-full rounded-full transition-[width] duration-700 ease-out ${missing > 0 ? 'bg-caramel' : 'bg-sauge'}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <dl className="mt-5 space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-noir/60">{t('cart.summary.subtotal')}</dt>
                <dd className="font-semibold">{formatMoney(subtotal, locale)}</dd>
              </div>

              {promoCode && (
                <div className="flex justify-between text-sauge-deep">
                  <dt>{t('cart.summary.discount', { code: promoCode })}</dt>
                  <dd className="font-semibold">−{formatMoney(discount, locale)}</dd>
                </div>
              )}

              <div className="flex justify-between">
                <dt className="text-noir/60">{t('cart.summary.shipping')}</dt>
                <dd className="font-semibold">
                  {shipping === 0 ? (
                    <span className="inline-flex items-center gap-1 text-sauge-deep">
                      <IconCheck className="h-3.5 w-3.5" strokeWidth={2.6} />
                      {t('cart.summary.free')}
                    </span>
                  ) : (
                    formatMoney(shipping, locale)
                  )}
                </dd>
              </div>

              <div className="flex justify-between border-t border-dashed border-noir/20 pt-3 text-base">
                <dt className="font-serif font-bold">{t('cart.summary.total')}</dt>
                <dd className="font-serif text-xl font-bold">{formatMoney(total, locale)}</dd>
              </div>
            </dl>
            <p className="mt-2 text-xs text-noir/45">{t('cart.summary.vat')}</p>

            {/* Code promo */}
            <div className="mt-5">
              {promoCode ? (
                <div className="flex items-center justify-between rounded-xl bg-sauge/15 px-4 py-3 text-sm">
                  <span className="inline-flex items-center gap-2 font-semibold text-sauge-deep">
                    <IconCheck className="h-4 w-4" strokeWidth={2.6} />
                    {promoCode} — {t('promo.ok')}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPromoCode(null)}
                    aria-label={t('promo.remove')}
                    className="text-noir/40 transition hover:text-noir"
                  >
                    <IconClose className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    applyPromo();
                  }}
                  aria-label={t('promo.label')}
                >
                  <label htmlFor="promo-input" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-noir/50">
                    {t('promo.label')}
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="promo-input"
                      type="text"
                      value={promoInput}
                      onChange={(e) => {
                        setPromoInput(e.target.value);
                        setPromoError(false);
                      }}
                      placeholder={t('promo.placeholder')}
                      className={`flex-1 rounded-xl border bg-white px-3.5 py-2.5 text-sm uppercase tracking-wide ${
                        promoError ? 'border-red-400' : 'border-noir/15'
                      } focus-visible:outline-none`}
                    />
                    <button
                      type="submit"
                      className="rounded-xl bg-noir px-4 text-sm font-semibold text-creme transition hover:bg-noir-mist"
                    >
                      {t('promo.apply')}
                    </button>
                  </div>
                  {promoError && (
                    <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">
                      {t('promo.invalid')}
                    </p>
                  )}
                </form>
              )}
            </div>

            <Link
              href="/paiement"
              className="btn-card mt-6 w-full bg-caramel text-noir shadow-warm hover:-translate-y-0.5 hover:bg-caramel-deep hover:text-creme"
            >
              <IconBag className="h-4 w-4" />
              {t('cart.summary.checkout')}
            </Link>
          </section>
        </Reveal>
      </div>
    </div>
  );
}
