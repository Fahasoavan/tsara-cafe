'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useRef, useState, type FormEvent } from 'react';
import { PRODUCTS, getUnitPrice, type Product } from '@/data/products';
import { COUNTRIES, useI18n } from '@/lib/i18n';
import { useCart } from '@/lib/cart';
import { lineKey } from '@/lib/cart-utils';
import { findPromo } from '@/lib/promo';
import { FREE_SHIPPING_MIN, shippingFor } from '@/lib/shipping';
import { formatMoney, isValidEmail, round2 } from '@/lib/format';
import { BagVisual } from '@/components/BagVisual';
import { Reveal } from '@/components/ui/Reveal';
import { IconCheck, IconClose, IconLoader, IconShield } from '@/components/ui/icons';
import type { CartLine } from '@/lib/types';

type ServerReason = 'invalid_number' | 'invalid_expiry' | 'invalid_cvc' | 'declined';
type ClientReason = 'address' | 'email' | 'card' | 'empty' | 'generic';
type CheckoutError = ServerReason | ClientReason;

/** Formatage doux du numéro de carte : groupes de 4 chiffres */
function formatCardNumber(raw: string): string {
  return raw
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim();
}

/** Auto-slash pour la date d'expiration : « 12/28 » */
function formatExpiry(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

interface AddressFields {
  name: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
  email: string;
}

const DEFAULT_ADDRESS: AddressFields = {
  name: '',
  address: '',
  postalCode: '',
  city: '',
  country: 'FR',
  email: '',
};

export function CheckoutContent() {
  const { t, locale } = useI18n();
  const { lines, ready, promoCode, setPromoCode, clear } = useCart();
  const router = useRouter();

  const [address, setAddress] = useState<AddressFields>(DEFAULT_ADDRESS);
  const [holder, setHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting'>('idle');
  const [error, setError] = useState<CheckoutError | null>(null);
  const submittingRef = useRef(false);
  const errorRef = useRef<HTMLDivElement | null>(null);

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
  const promo = promoCode ? findPromo(promoCode) : undefined;
  const discount = promo ? round2((subtotal * promo.percentOff) / 100) : 0;
  const shipping = shippingFor(round2(subtotal - discount));
  const total = round2(subtotal - discount + shipping);

  const messageFor = (reason: CheckoutError): string => {
    switch (reason) {
      case 'address':
        return t('checkout.error.address');
      case 'email':
        return t('checkout.error.email');
      case 'card':
        return t('checkout.error.card');
      case 'empty':
        return t('checkout.error.empty');
      case 'declined':
        return t('checkout.error.declined');
      case 'invalid_number':
        return t('checkout.error.invalidCard');
      case 'invalid_expiry':
        return t('checkout.error.expiry');
      case 'invalid_cvc':
        return t('checkout.error.cvc');
      default:
        return t('checkout.error.generic');
    }
  };

  const showError = (reason: CheckoutError) => {
    setError(reason);
    /* le bandeau d'erreur devient visible au-dessus du bouton */
    requestAnimationFrame(() => {
      errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittingRef.current) return; // anti double envoi

    /* --- Validation locale --- */
    setError(null);
    if (lines.length === 0) return showError('empty');
    const filled =
      address.name.trim() &&
      address.address.trim() &&
      address.postalCode.trim() &&
      address.city.trim() &&
      address.country.trim();
    if (!filled) return showError('address');
    if (!isValidEmail(address.email)) return showError('email');

    const digits = cardNumber.replace(/\s/g, '');
    if (digits.length < 13 || !/^\d+$/.test(digits)) return showError('card');
    if (!/^\d{2}\/\d{2}$/.test(expiry)) return showError('card');
    if (!/^\d{3}$/.test(cvc)) return showError('invalid_cvc');
    if (!holder.trim()) return showError('card');

    /* --- Envoi (le serveur recalcule tout) --- */
    submittingRef.current = true;
    setStatus('submitting');
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: lines,
          promoCode: promoCode ?? null,
          address: {
            name: address.name.trim(),
            address: address.address.trim(),
            postalCode: address.postalCode.trim(),
            city: address.city.trim(),
            country: countryLabel(address.country),
            email: address.email.trim(),
          },
          card: { holder: holder.trim(), number: digits, expiry, cvc },
        }),
      });

      if (response.status === 201) {
        const body = (await response.json()) as { id: string };
        /* Panier vidé SEULEMENT après un paiement accepté */
        clear();
        router.replace(`/commande/${encodeURIComponent(body.id)}`);
        return;
      }

      const body = (await response.json().catch(() => ({}))) as { error?: string; reason?: ServerReason };
      if (body.error === 'payment' && body.reason) {
        showError(body.reason);
      } else if (body.error === 'address') {
        showError('address');
      } else if (body.error === 'cart') {
        showError('empty');
      } else {
        showError('generic');
      }
    } catch {
      showError('generic');
    } finally {
      submittingRef.current = false;
      setStatus((prev) => (prev === 'submitting' ? 'idle' : prev));
    }
  };

  const countryLabel = (value: string): string => {
    const country = COUNTRIES.find((c) => c.value === value);
    if (!country) return value;
    return locale === 'en' ? country.en : country.fr;
  };

  const fieldLabel = (key: keyof AddressFields): string => t(`form.${key}`);

  /* ---------- Squelette de chargement ---------- */
  if (!ready) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="skeleton h-10 w-36" />
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="skeleton h-96 w-full" />
          <div className="skeleton h-80 w-full" />
        </div>
      </div>
    );
  }

  /* ---------- Panier vide ---------- */
  if (lines.length === 0) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 px-4 py-24 text-center sm:px-6">
        <Reveal variant="zoom">
          <BagVisual accent="#6B7F5E" className="h-40 w-auto animate-float" aria-hidden />
        </Reveal>
        <h1 className="font-serif text-3xl font-bold">{t('checkout.error.empty')}</h1>
        <Link
          href="/catalogue"
          className="btn-card bg-caramel text-noir shadow-warm hover:-translate-y-0.5 hover:bg-caramel-deep hover:text-creme"
        >
          {t('cart.empty.cta')}
        </Link>
      </div>
    );
  }

  const inputClass =
    'w-full rounded-xl border border-noir/15 bg-white px-3.5 py-2.5 text-sm text-noir placeholder:text-noir/35 transition focus-visible:outline-none';

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      {/* Bandeau démonstration */}
      <div
        role="note"
        className="mb-8 flex items-center gap-3 rounded-2xl border border-caramel/50 bg-caramel/15 px-4 py-3.5"
      >
        <IconShield className="h-5 w-5 shrink-0 text-caramel-deep" />
        <p className="text-sm font-semibold text-caramel-deep">{t('demo.banner')}</p>
      </div>

      <h1 className="font-serif text-4xl font-bold tracking-tight">{t('checkout.title')}</h1>

      <form onSubmit={handleSubmit} noValidate className="mt-8 grid items-start gap-8 lg:grid-cols-[1.4fr_1fr]">
        {/* ---------- Colonne formulaire ---------- */}
        <div className="space-y-6">
          {/* Adresse */}
          <Reveal>
            <fieldset className="rounded-3xl border border-noir/10 bg-white p-6 shadow-[0_1px_2px_rgba(30,22,18,0.05)]">
              <legend className="sr-only">{t('checkout.step1')}</legend>
              <p className="mb-4 flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-noir text-xs font-bold text-creme">1</span>
                <span className="font-serif text-lg font-bold">{t('checkout.step1')}</span>
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="sm:col-span-2">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-noir/55">
                    {fieldLabel('name')} *
                  </span>
                  <input
                    type="text"
                    required
                    autoComplete="name"
                    placeholder={t('ph.name')}
                    value={address.name}
                    onChange={(e) => setAddress({ ...address, name: e.target.value })}
                    className={inputClass}
                  />
                </label>

                <label className="sm:col-span-2">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-noir/55">
                    {fieldLabel('address')} *
                  </span>
                  <input
                    type="text"
                    required
                    autoComplete="street-address"
                    placeholder={t('ph.address')}
                    value={address.address}
                    onChange={(e) => setAddress({ ...address, address: e.target.value })}
                    className={inputClass}
                  />
                </label>

                <label>
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-noir/55">
                    {fieldLabel('postalCode')} *
                  </span>
                  <input
                    type="text"
                    required
                    autoComplete="postal-code"
                    placeholder={t('ph.postal')}
                    value={address.postalCode}
                    onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                    className={inputClass}
                  />
                </label>

                <label>
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-noir/55">
                    {fieldLabel('city')} *
                  </span>
                  <input
                    type="text"
                    required
                    autoComplete="address-level2"
                    placeholder={t('ph.city')}
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    className={inputClass}
                  />
                </label>

                <label>
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-noir/55">
                    {fieldLabel('country')} *
                  </span>
                  <select
                    required
                    autoComplete="country-name"
                    value={address.country}
                    onChange={(e) => setAddress({ ...address, country: e.target.value })}
                    className={inputClass}
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {locale === 'en' ? c.en : c.fr}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-noir/55">
                    {fieldLabel('email')} *
                  </span>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    placeholder={t('ph.email')}
                    value={address.email}
                    onChange={(e) => setAddress({ ...address, email: e.target.value })}
                    className={inputClass}
                    aria-describedby="email-hint"
                  />
                  <span id="email-hint" className="mt-1 block text-xs text-noir/50">
                    {t('form.emailHint')}
                  </span>
                </label>
              </div>
            </fieldset>
          </Reveal>

          {/* Carte SIMULÉE */}
          <Reveal delay={80}>
            <fieldset className="rounded-3xl border border-noir/10 bg-white p-6 shadow-[0_1px_2px_rgba(30,22,18,0.05)]">
              <legend className="sr-only">{t('checkout.step2')}</legend>
              <p className="mb-4 flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-noir text-xs font-bold text-creme">2</span>
                <span className="font-serif text-lg font-bold">{t('checkout.step2')}</span>
              </p>

              {/* Banc de test */}
              <div className="mb-4 space-y-1 rounded-xl bg-creme-soft/70 p-3.5 text-xs text-noir/70">
                <p className="font-semibold">{t('checkout.cardTip')}</p>
                <p className="font-mono tracking-tight text-sauge-deep">✓ {t('checkout.cardOk')}</p>
                <p className="font-mono tracking-tight text-caramel-deep">✗ {t('checkout.cardKo')}</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="sm:col-span-2">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-noir/55">
                    {t('form.cardholder')} *
                  </span>
                  <input
                    type="text"
                    required
                    autoComplete="cc-name"
                    placeholder={t('ph.name')}
                    value={holder}
                    onChange={(e) => setHolder(e.target.value)}
                    className={inputClass}
                  />
                </label>

                <label className="sm:col-span-2">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-noir/55">
                    {t('form.cardNumber')} *
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    autoComplete="cc-number"
                    placeholder="4242 4242 4242 4242"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    className={`${inputClass} font-mono tracking-tight`}
                  />
                </label>

                <label>
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-noir/55">
                    {t('form.expiry')} *
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    autoComplete="cc-exp"
                    placeholder="12/28"
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    className={`${inputClass} font-mono tracking-tight`}
                  />
                </label>

                <label>
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-noir/55">
                    {t('form.cvc')} *
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    autoComplete="cc-csc"
                    placeholder="123"
                    maxLength={3}
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 3))}
                    className={`${inputClass} font-mono tracking-tight`}
                  />
                </label>
              </div>

              <p className="mt-4 flex items-center gap-2 text-xs text-noir/50">
                <IconShield className="h-4 w-4 shrink-0 text-sauge" />
                {t('checkout.secure')}
              </p>
            </fieldset>
          </Reveal>
        </div>

        {/* ---------- Récapitulatif ---------- */}
        <Reveal delay={120} variant="zoom" className="lg:sticky lg:top-24">
          <section
            aria-labelledby="checkout-summary-title"
            className="rounded-3xl border border-noir/10 bg-white p-6 shadow-warm"
          >
            <h2 id="checkout-summary-title" className="font-serif text-xl font-bold">
              {t('cart.summary.title')}
            </h2>

            {/* Lignes compactes */}
            <ul className="mt-4 space-y-2.5 text-sm">
              {namedLines.map(({ line, product }) => {
                const unit = getUnitPrice(product, line.format);
                return (
                  <li key={lineKey(line)} className="flex items-baseline justify-between gap-3">
                    <span className="min-w-0 flex-1 truncate">
                      <span className="font-semibold">{line.qty}×</span>{' '}
                      <span className="text-noir/85">{product.name}</span>
                      <span className="text-noir/45">
                        {line.format === 'coffret'
                          ? ` · ${t('format.coffret')}`
                          : ` · ${line.format === 's250' ? t('format.250') : t('format.1000')}${line.grind ? ` · ${t(`grind.${line.grind}`)}` : ''}`}
                      </span>
                    </span>
                    <span className="font-semibold">{formatMoney(round2(unit * line.qty), locale)}</span>
                  </li>
                );
              })}
            </ul>

            <dl className="mt-5 space-y-2.5 border-t border-dashed border-noir/15 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-noir/60">{t('cart.summary.subtotal')}</dt>
                <dd className="font-semibold">{formatMoney(subtotal, locale)}</dd>
              </div>
              {promo && (
                <div className="flex items-center justify-between text-sauge-deep">
                  <dt>{t('cart.summary.discount', { code: promo.code })}</dt>
                  <dd className="flex items-center gap-2 font-semibold">
                    −{formatMoney(discount, locale)}
                    <button
                      type="button"
                      onClick={() => setPromoCode(null)}
                      className="text-noir/40 transition hover:text-noir"
                      aria-label={t('promo.remove')}
                    >
                      <IconClose className="h-3.5 w-3.5" />
                    </button>
                  </dd>
                </div>
              )}
              {subtotal - discount < FREE_SHIPPING_MIN && (
                <p className="rounded-lg bg-caramel/10 px-3 py-2 text-xs font-medium text-caramel-deep">
                  {t('cart.freeRemaining', { amount: formatMoney(round2(FREE_SHIPPING_MIN - (subtotal - discount)), locale) })}
                </p>
              )}
              <div className="flex justify-between">
                <dt className="text-noir/60">{t('cart.summary.shipping')}</dt>
                <dd className="font-semibold">
                  {shipping === 0 ? t('cart.summary.free') : formatMoney(shipping, locale)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-dashed border-noir/15 pt-3">
                <dt className="font-serif text-base font-bold">{t('cart.summary.total')}</dt>
                <dd className="font-serif text-xl font-bold" aria-live="polite">
                  {formatMoney(total, locale)}
                </dd>
              </div>
            </dl>

            {/* Zone d'erreur claire (rôle alert) */}
            {error && (
              <div
                ref={errorRef}
                role="alert"
                className="mt-5 animate-fade-up rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
              >
                {messageFor(error)}
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="btn-card mt-6 w-full bg-caramel text-noir shadow-warm transition-all hover:-translate-y-0.5 hover:bg-caramel-deep hover:text-creme disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {status === 'submitting' ? (
                <>
                  <IconLoader className="h-4 w-4 animate-spin" />
                  {t('checkout.paying')}
                </>
              ) : (
                t('checkout.pay', { amount: formatMoney(total, locale) })
              )}
            </button>

            <Link
              href="/panier"
              className="link-underline mt-3 inline-block w-full text-center text-sm font-medium text-noir/55"
            >
              ← {t('cart.title')}
            </Link>
          </section>
        </Reveal>
      </form>
    </div>
  );
}
