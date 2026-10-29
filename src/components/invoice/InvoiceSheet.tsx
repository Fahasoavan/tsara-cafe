'use client';

import Link from 'next/link';
import { COUNTRIES, useI18n } from '@/lib/i18n';
import { formatMoney, formatDate } from '@/lib/format';
import type { StoredOrder } from '@/lib/types';

/**
 * Facture imprimable (Ctrl+P → PDF). Layout volontairement sobre :
 * fond blanc, noir café, aucune animation ni image lourde.
 */
export function InvoiceSheet({ order }: { order: StoredOrder }) {
  const { t, locale } = useI18n();

  const countryLabel = (value: string): string => {
    const country = COUNTRIES.find((c) => c.value === value);
    if (!country) return value;
    return locale === 'en' ? country.en : country.fr;
  };

  const formatLabel = (line: StoredOrder['items'][number]): string => {
    const sizeText =
      line.format === 'coffret'
        ? t('format.coffret')
        : line.format === 's250'
          ? t('format.250')
          : t('format.1000');
    return line.grind ? `${sizeText} · ${t(`grind.${line.grind}`)}` : sizeText;
  };

  const sellerLines = t('inv.sellerLines').split('\n');

  return (
    <div className="bg-creme px-4 py-10 print:px-0 print:py-0 print:bg-white">
      <div className="print-sheet mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-warm sm:p-12">
        {/* En-tête */}
        <header className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-noir pb-6">
          <div className="flex items-center gap-3">
            <svg viewBox="0 0 40 40" className="h-11 w-11" aria-hidden="true">
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
            <div>
              <p className="font-serif text-2xl font-bold text-noir">Tsara Café</p>
              <p className="text-xs uppercase tracking-[0.18em] text-noir/55">{t('brand.tagline')}</p>
            </div>
          </div>
          <div className="text-right text-sm">
            <p className="font-serif text-3xl font-bold text-noir">{t('inv.title')}</p>
            <p className="mt-0.5 font-mono text-sm text-noir/70">{t('inv.no', { no: order.id.replace('TS-', 'INV-') })}</p>
            <p className="text-xs text-noir/55">
              {t('inv.date')} : {formatDate(order.createdAt, locale)}
            </p>
          </div>
        </header>

        {/* Émetteur / destinataire */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-caramel-deep">{t('inv.seller')}</p>
            <p className="mt-2 text-sm leading-relaxed text-noir/75 whitespace-pre-line">{sellerLines.join('\n')}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-caramel-deep">{t('inv.billTo')}</p>
            <p className="mt-2 text-sm leading-relaxed text-noir/80">
              {order.customer.name}
              <br />
              {order.customer.address}
              <br />
              {order.customer.postalCode} {order.customer.city}
              <br />
              {countryLabel(order.customer.country)}
              <br />
              {order.customer.email}
            </p>
          </div>
        </div>

        {/* Tableau des articles */}
        <table className="mt-8 w-full text-sm">
          <thead>
            <tr className="border-b-2 border-noir text-left text-xs uppercase tracking-wide text-noir/60">
              <th className="pb-2">{t('inv.item')}</th>
              <th className="pb-2 text-center">{t('inv.qty')}</th>
              <th className="pb-2 text-right">{t('inv.unit')}</th>
              <th className="pb-2 text-right">{t('inv.total')}</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((line, index) => (
              <tr key={index} className="border-b border-noir/10">
                <td className="py-3">
                  <span className="font-semibold text-noir">{locale === 'en' ? line.name.en : line.name.fr}</span>
                  <span className="block text-xs text-noir/55">{formatLabel(line)}</span>
                </td>
                <td className="py-3 text-center font-mono">{line.qty}</td>
                <td className="py-3 text-right font-mono">{formatMoney(line.unitPrice, locale)}</td>
                <td className="py-3 text-right font-mono">{formatMoney(line.lineTotal, locale)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totaux */}
        <div className="mt-6 flex justify-end">
          <dl className="w-full max-w-xs space-y-1.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-noir/60">{t('cart.summary.subtotal')}</dt>
              <dd className="font-mono">{formatMoney(order.subtotal, locale)}</dd>
            </div>
            {order.promoCode && (
              <div className="flex justify-between">
                <dt className="text-noir/60">
                  {t('cart.summary.discount', { code: order.promoCode })}
                </dt>
                <dd className="font-mono">−{formatMoney(order.discount, locale)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-noir/60">{t('cart.summary.shipping')}</dt>
              <dd className="font-mono">{formatMoney(order.shipping, locale)}</dd>
            </div>
            <div className="flex justify-between border-t-2 border-noir pt-2">
              <dt className="font-serif font-bold">{t('cart.summary.total')}</dt>
              <dd className="font-mono font-bold">{formatMoney(order.total, locale)}</dd>
            </div>
          </dl>
        </div>

        <p className="mt-4 text-right text-xs text-noir/50">
          {t('confirm.paidWith', { last4: order.payment.last4 })}
        </p>

        {/* Pied de facture */}
        <footer className="mt-10 border-t border-noir/10 pt-5 text-center text-xs text-noir/60">
          <p className="font-serif text-base italic text-noir/80">{t('inv.thanks')}</p>
          <p className="mt-2">{t('inv.demoNote')}</p>
        </footer>
      </div>

      {/* Actions (masquées à l'impression) */}
      <div className="no-print mx-auto mt-8 flex max-w-3xl flex-wrap items-center justify-center gap-3 pb-8">
        <button
          type="button"
          onClick={() => window.print()}
          className="btn-card bg-noir text-creme hover:-translate-y-0.5 hover:shadow-warm-lg"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M7 8V4h10v4M5 8h14a1 1 0 0 1 1 1v7h-4M8 13h8v7H8v-7Z" />
            <path d="M5 16H4V9a1 1 0 0 1 1-1" />
          </svg>
          {t('inv.print')}
        </button>
        <Link href={`/commande/${encodeURIComponent(order.id)}`} className="btn-card border border-noir/20 hover:border-noir/50">
          ← {t('inv.back')}
        </Link>
      </div>
    </div>
  );
}
