'use client';

import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { useI18n } from '@/lib/i18n';
import { formatMoney, formatDate, isValidEmail, round2 } from '@/lib/format';
import { Reveal } from '@/components/ui/Reveal';
import { BagVisual } from '@/components/BagVisual';
import {
  IconCheck,
  IconPrinter,
  IconLoader,
  IconArrowRight,
} from '@/components/ui/icons';
import type { StoredOrder } from '@/lib/types';

/* Timeline : statuts possibles dans l'ordre */
const STATUS_FLOW = ['paid', 'preparing', 'shipped'] as const;

export function ConfirmationContent() {
  const { t, locale } = useI18n();
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const id = typeof params.id === 'string' ? params.id : '';

  /* L'e-mail sécurise la consultation : la commande ne s'ouvre pas avec
     le seul numéro (elle contient le nom et l'adresse du client). */
  const [email, setEmail] = useState<string | null>(searchParams.get('email'));
  const [emailInput, setEmailInput] = useState('');

  const [order, setOrder] = useState<StoredOrder | null>(null);
  const [loading, setLoading] = useState(Boolean(searchParams.get('email')));
  const [missing, setMissing] = useState(false);
  const [emailError, setEmailError] = useState(false);

  useEffect(() => {
    if (!email) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/orders/${encodeURIComponent(id)}?email=${encodeURIComponent(email)}`,
          { cache: 'no-store' },
        );
        if (!res.ok) {
          if (!cancelled) setMissing(true);
          return;
        }
        const body = (await res.json()) as { order: StoredOrder };
        if (!cancelled) setOrder(body.order);
      } catch {
        if (!cancelled) setMissing(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, email]);

  const requestEmail = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = emailInput.trim();
    if (!isValidEmail(value)) {
      setEmailError(true);
      return;
    }
    setEmailError(false);
    setLoading(true);
    setMissing(false);
    setEmail(value);
  };

  /* ---------- Étape e-mail (aucun ?email= dans l'URL) ---------- */
  if (!email) {
    return (
      <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-24 text-center sm:px-6">
        <BagVisual accent="#5A4232" className="mx-auto h-24 w-auto opacity-70" aria-hidden />
        <h1 className="font-serif text-2xl font-bold">{t('confirm.email.title')}</h1>
        <p className="text-sm text-noir/60">{t('confirm.email.sub')}</p>
        <form onSubmit={requestEmail} noValidate className="space-y-3 text-left">
          <label htmlFor="confirm-email">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-noir/55">
              {t('track.email')} *
            </span>
            <input
              id="confirm-email"
              type="email"
              required
              autoComplete="email"
              placeholder={t('ph.email')}
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              aria-invalid={emailError}
              className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-noir placeholder:text-noir/35 focus-visible:outline-none ${
                emailError ? 'border-red-400' : 'border-noir/15'
              }`}
            />
          </label>
          {emailError && (
            <p role="alert" className="text-xs font-medium text-red-700">
              {t('confirm.email.invalid')}
            </p>
          )}
          <button type="submit" className="btn-card w-full bg-caramel text-noir shadow-warm hover:-translate-y-0.5">
            {t('confirm.email.cta')}
          </button>
        </form>
        <Link href="/suivi" className="link-underline text-sm font-medium text-noir/55">
          {t('confirm.track')}
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-6 py-28">
        <IconLoader className="h-8 w-8 animate-spin text-caramel-deep" />
        <p className="text-sm text-noir/60">{t('confirm.loading')}</p>
      </div>
    );
  }

  if (missing || !order) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-6 py-24 text-center">
        <BagVisual accent="#5A4232" className="h-36 w-auto opacity-70" aria-hidden />
        <h1 className="font-serif text-3xl font-bold">{t('confirm.notfound.title')}</h1>
        <p className="text-noir/65">{t('confirm.notfound.sub')}</p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <Link href="/suivi" className="btn-card bg-caramel text-noir hover:-translate-y-0.5">
            {t('confirm.track')}
          </Link>
          <Link href="/catalogue" className="btn-card border border-noir/20 hover:border-noir/50">
            {t('nf.cta')}
          </Link>
        </div>
      </div>
    );
  }

  const statusPosition = STATUS_FLOW.indexOf(order.status);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
      {/* Bandeau succès */}
      <Reveal>
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-sauge text-creme shadow-warm-lg animate-scale-in">
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden="true">
              <path
                d="M4 12.5l5.5 5.5L20 6.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="48"
                className="animate-draw-check"
              />
            </svg>
          </span>
          <p className="rounded-full bg-sauge/15 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-sauge-deep">
            {t('confirm.badge')}
          </p>
          <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">{t('confirm.title')}</h1>
          <p className="text-noir/65">{t('confirm.sub', { email: order.customer.email })}</p>
          <p className="rounded-full bg-noir px-4 py-1.5 font-mono text-sm font-semibold tracking-widest text-creme">
            {t('confirm.order', { id: order.id })}
          </p>
        </div>
      </Reveal>

      {/* Timeline de statut */}
      <Reveal delay={100}>
        <section
          aria-label={t('confirm.status')}
          className="mt-10 rounded-3xl border border-noir/10 bg-white p-6 shadow-[0_1px_2px_rgba(30,22,18,0.05)]"
        >
          <ol className="flex items-center">
            {STATUS_FLOW.map((s, i) => {
              const done = i <= statusPosition;
              return (
                <li key={s} className="flex flex-1 items-center last:flex-none">
                  <div className="flex flex-col items-center gap-1.5 text-center">
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-500 ${
                        done
                          ? 'border-sauge bg-sauge text-creme'
                          : 'border-noir/20 bg-white text-noir/40'
                      }`}
                      aria-current={i === statusPosition ? 'step' : undefined}
                    >
                      {i < statusPosition ? <IconCheck className="h-4 w-4" strokeWidth={2.6} /> : i + 1}
                    </span>
                    <span
                      className={`w-20 text-[11px] font-semibold leading-tight ${
                        done ? 'text-noir' : 'text-noir/40'
                      }`}
                    >
                      {t(`status.${s}`)}
                    </span>
                  </div>
                  {i < STATUS_FLOW.length - 1 && (
                    <div className="mx-2 mb-6 h-0.5 flex-1 overflow-hidden rounded bg-noir/10">
                      <div
                        className={`h-full bg-sauge transition-all duration-700 ${
                          i < statusPosition ? 'w-full' : 'w-0'
                        }`}
                      />
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      </Reveal>

      {/* Récapitulatif */}
      <div className="mt-8 grid gap-6 md:grid-cols-[1.3fr_0.85fr]">
        <Reveal delay={140}>
          <section className="h-full rounded-3xl border border-noir/10 bg-white p-6 shadow-[0_1px_2px_rgba(30,22,18,0.05)]">
            <h2 className="font-serif text-lg font-bold">{t('confirm.recap')}</h2>
            <p className="mt-1 text-xs text-noir/50">{formatDate(order.createdAt, locale)}</p>

            <ul className="mt-4 divide-y divide-noir/10">
              {order.items.map((item) => (
                <li key={`${item.productId}-${item.format}-${item.grind ?? ''}`} className="flex items-center gap-3 py-3">
                  <span
                    className="flex h-12 w-10 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: `linear-gradient(135deg, ${item.accent}40, ${item.accent}18)` }}
                  >
                    <BagVisual accent={item.accent} className="h-[85%] w-auto" labelLines={false} aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">
                      {item.qty}× {locale === 'en' ? item.name.en : item.name.fr}
                    </span>
                    <span className="text-xs text-noir/50">
                      {item.format === 'coffret'
                        ? t('format.coffret')
                        : item.format === 's250'
                          ? t('format.250')
                          : t('format.1000')}
                      {item.grind && ' · ' + t(`grind.${item.grind}`)}
                    </span>
                  </span>
                  <span className="text-sm font-semibold">{formatMoney(item.lineTotal, locale)}</span>
                </li>
              ))}
            </ul>

            <dl className="mt-4 space-y-2 border-t border-dashed border-noir/15 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-noir/60">{t('cart.summary.subtotal')}</dt>
                <dd>{formatMoney(order.subtotal, locale)}</dd>
              </div>
              {order.promoCode && (
                <div className="flex justify-between text-sauge-deep">
                  <dt>{t('cart.summary.discount', { code: order.promoCode })}</dt>
                  <dd>−{formatMoney(order.discount, locale)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-noir/60">{t('cart.summary.shipping')}</dt>
                <dd>{order.shipping === 0 ? t('cart.summary.free') : formatMoney(order.shipping, locale)}</dd>
              </div>
              <div className="flex justify-between border-t border-dashed border-noir/15 pt-2.5">
                <dt className="font-serif font-bold">{t('cart.summary.total')}</dt>
                <dd className="font-serif text-lg font-bold">{formatMoney(round2(order.total), locale)}</dd>
              </div>
            </dl>
          </section>
        </Reveal>

        <div className="space-y-6">
          <Reveal delay={180}>
            <section className="rounded-3xl border border-noir/10 bg-white p-6 shadow-[0_1px_2px_rgba(30,22,18,0.05)]">
              <h2 className="font-serif text-lg font-bold">{t('confirm.address')}</h2>
              <address className="mt-3 text-sm not-italic leading-relaxed text-noir/75">
                {order.customer.name}
                <br />
                {order.customer.address}
                <br />
                {order.customer.postalCode} {order.customer.city}
                <br />
                {order.customer.country}
              </address>
            </section>
          </Reveal>

          <Reveal delay={220}>
            <section className="rounded-3xl border border-noir/10 bg-white p-6 shadow-[0_1px_2px_rgba(30,22,18,0.05)]">
              <h2 className="font-serif text-lg font-bold">{t('confirm.payment')}</h2>
              <p className="mt-3 flex items-center gap-2.5 text-sm text-noir/75">
                <span className="flex h-8 w-12 items-center justify-center rounded-md bg-noir text-[10px] font-bold text-creme">
                  DEMO
                </span>
                {t('confirm.paidWith', { last4: order.payment.last4 })}
              </p>
            </section>
          </Reveal>
        </div>
      </div>

      {/* Actions */}
      <Reveal delay={260}>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={`/facture/${encodeURIComponent(order.id)}?email=${encodeURIComponent(order.customer.email)}`}
            className="btn-card bg-noir text-creme hover:-translate-y-0.5 hover:shadow-warm-lg"
          >
            <IconPrinter className="h-4 w-4" />
            {t('confirm.invoice')}
          </Link>
          <Link
            href={`/suivi?id=${encodeURIComponent(order.id)}&email=${encodeURIComponent(order.customer.email)}`}
            className="btn-card bg-caramel text-noir shadow-warm hover:-translate-y-0.5"
          >
            {t('confirm.track')}
            <IconArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/" className="btn-card border border-noir/20 hover:border-noir/50">
            {t('confirm.home')}
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
