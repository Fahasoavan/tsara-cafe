'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { COUNTRIES, useI18n } from '@/lib/i18n';
import { formatDate, formatMoney } from '@/lib/format';
import { Reveal } from '@/components/ui/Reveal';
import { IconCheck, IconLoader, IconSearch } from '@/components/ui/icons';
import type { StoredOrder } from '@/lib/types';

const STATUS_FLOW = ['paid', 'preparing', 'shipped'] as const;

export function TrackContent() {
  const { t, locale } = useI18n();
  const searchParams = useSearchParams();

  const [orderNo, setOrderNo] = useState('');
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'found' | 'missing'>('idle');
  const [order, setOrder] = useState<StoredOrder | null>(null);

  /* Pré-remplissage depuis l'URL : /suivi?id=TS-XXXXXX */
  useEffect(() => {
    const preset = searchParams.get('id');
    if (preset) setOrderNo(preset.toUpperCase());
  }, [searchParams]);

  const track = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (state === 'loading') return;
    const id = orderNo.trim().toUpperCase();
    const mail = email.trim();
    if (!id || !mail) return;

    setState('loading');
    try {
      const res = await fetch(
        `/api/orders/${encodeURIComponent(id)}?email=${encodeURIComponent(mail)}`,
        { cache: 'no-store' },
      );
      if (!res.ok) {
        setOrder(null);
        setState('missing');
        return;
      }
      const body = (await res.json()) as { order: StoredOrder };
      setOrder(body.order);
      setState('found');
    } catch {
      setOrder(null);
      setState('missing');
    }
  };

  const countryLabel = (value: string): string => {
    const country = COUNTRIES.find((c) => c.value === value);
    if (!country) return value;
    return locale === 'en' ? country.en : country.fr;
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <Reveal>
        <div className="text-center">
          <p className="label-warm">{t('nav.track')}</p>
          <h1 className="font-serif text-4xl font-bold tracking-tight">{t('track.title')}</h1>
          <p className="mx-auto mt-3 max-w-xl text-noir/65">{t('track.sub')}</p>
        </div>
      </Reveal>

      {/* Formulaire de recherche */}
      <Reveal delay={80}>
        <form
          onSubmit={track}
          noValidate
          className="mx-auto mt-8 grid gap-3 rounded-3xl border border-noir/10 bg-white/80 p-5 shadow-warm backdrop-blur-sm sm:grid-cols-[1fr_1fr_auto]"
        >
          <label>
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-noir/55">
              {t('track.orderNo')} *
            </span>
            <input
              type="text"
              required
              value={orderNo}
              onChange={(e) => setOrderNo(e.target.value)}
              placeholder={t('track.orderPH')}
              className="w-full rounded-xl border border-noir/15 bg-white px-3.5 py-2.5 text-sm font-mono uppercase tracking-wider focus-visible:outline-none"
            />
          </label>
          <label>
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-noir/55">
              {t('track.email')} *
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('ph.email')}
              className="w-full rounded-xl border border-noir/15 bg-white px-3.5 py-2.5 text-sm focus-visible:outline-none"
            />
          </label>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={state === 'loading'}
              className="btn-card h-[2.81rem] w-full bg-noir text-creme hover:bg-caramel hover:text-noir disabled:opacity-70 sm:w-auto"
            >
              {state === 'loading' ? (
                <>
                  <IconLoader className="h-4 w-4 animate-spin" />
                  {t('track.searching')}
                </>
              ) : (
                <>
                  <IconSearch className="h-4 w-4" />
                  {t('track.submit')}
                </>
              )}
            </button>
          </div>
        </form>
      </Reveal>

      {/* Introuvable */}
      {state === 'missing' && (
        <div
          role="alert"
          className="animate-fade-up mt-8 rounded-2xl border border-red-300 bg-red-50 px-5 py-4 text-center text-sm font-medium text-red-700"
        >
          {t('track.notfound')}
        </div>
      )}

      {/* Résultat */}
      {state === 'found' && order && (
        <Reveal delay={80}>
          <section aria-label={t('track.title')} className="mt-10 space-y-6">
            {/* Statut */}
            <div className="rounded-3xl border border-noir/10 bg-white p-6 shadow-warm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-lg font-bold tracking-widest">{order.id}</p>
                  <p className="text-xs text-noir/55">
                    {t('track.orderedOn')} {formatDate(order.createdAt, locale)}
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full bg-sauge/15 px-4 py-1.5 text-sm font-bold text-sauge-deep">
                  <IconCheck className="h-4 w-4" strokeWidth={2.6} />
                  {t(`status.${order.status}`)}
                </span>
              </div>

              <ol className="mt-6 flex items-center">
                {STATUS_FLOW.map((s, i) => {
                  const index = STATUS_FLOW.indexOf(order.status);
                  const done = i <= index;
                  return (
                    <li key={s} className="flex flex-1 items-center last:flex-none">
                      <div className="flex flex-col items-center gap-1.5 text-center">
                        <span
                          className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-bold ${
                            done ? 'border-sauge bg-sauge text-creme' : 'border-noir/20 bg-white text-noir/40'
                          }`}
                          aria-current={i === index ? 'step' : undefined}
                        >
                          {i < index ? <IconCheck className="h-4 w-4" strokeWidth={2.6} /> : i + 1}
                        </span>
                        <span className={`w-20 text-[11px] font-semibold leading-tight ${done ? 'text-noir' : 'text-noir/40'}`}>
                          {t(`status.${s}`)}
                        </span>
                      </div>
                      {i < STATUS_FLOW.length - 1 && (
                        <div className="mx-2 mb-6 h-0.5 flex-1 overflow-hidden rounded bg-noir/10">
                          <div className={`h-full bg-sauge transition-all duration-700 ${i < index ? 'w-full' : 'w-0'}`} />
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>

            {/* Articles + adresse */}
            <div className="grid gap-6 md:grid-cols-[1.3fr_0.85fr]">
              <div className="rounded-3xl border border-noir/10 bg-white p-6">
                <h2 className="font-serif text-lg font-bold">{t('track.items')}</h2>
                <ul className="mt-3 divide-y divide-noir/10 text-sm">
                  {order.items.map((item, i) => (
                    <li key={i} className="flex justify-between gap-3 py-2.5">
                      <span>
                        <span className="font-semibold">{item.qty}×</span>{' '}
                        {locale === 'en' ? item.name.en : item.name.fr}
                        <span className="block text-xs text-noir/50">
                          {item.format === 'coffret'
                            ? t('format.coffret')
                            : item.format === 's250'
                              ? t('format.250')
                              : t('format.1000')}
                          {item.grind && ' · ' + t(`grind.${item.grind}`)}
                        </span>
                      </span>
                      <span className="font-semibold">{formatMoney(item.lineTotal, locale)}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 flex justify-between border-t border-dashed border-noir/15 pt-3 font-serif text-base font-bold">
                  {t('cart.summary.total')}
                  <span>{formatMoney(order.total, locale)}</span>
                </p>
              </div>

              <div className="rounded-3xl border border-noir/10 bg-white p-6">
                <h2 className="font-serif text-lg font-bold">{t('confirm.address')}</h2>
                <address className="mt-3 text-sm not-italic leading-relaxed text-noir/70">
                  {order.customer.name}
                  <br />
                  {order.customer.address}
                  <br />
                  {order.customer.postalCode} {order.customer.city}
                  <br />
                  {countryLabel(order.customer.country)}
                </address>
                <Link
                  href={`/facture/${encodeURIComponent(order.id)}`}
                  className="link-underline mt-4 inline-block text-sm font-semibold text-caramel-deep"
                >
                  {t('confirm.invoice')} →
                </Link>
              </div>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setState('idle');
                  setOrder(null);
                  setOrderNo('');
                  setEmail('');
                }}
                className="link-underline text-sm font-semibold text-noir/60"
              >
                ↺ {t('track.newSearch')}
              </button>
            </div>
          </section>
        </Reveal>
      )}
    </div>
  );
}
