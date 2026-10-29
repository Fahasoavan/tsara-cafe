'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { formatDate, formatMoney } from '@/lib/format';
import { AdminAuthError, fetchAsAdmin } from '@/lib/admin-client';
import { IconCheck, IconLoader } from '@/components/ui/icons';
import { ORDER_STATUSES, type OrderStatus, type StoredOrder } from '@/lib/types';

/** Tableau des commandes — onglet « Commandes » de l'écran Admin */
export function OrdersTable({
  orders,
  onOrderChanged,
  onRequireAuth,
}: {
  orders: StoredOrder[];
  onOrderChanged: (order: StoredOrder) => void;
  /** Appelé quand une action renvoie 401 → fait apparaître la saisie du mot de passe */
  onRequireAuth: () => void;
}) {
  const { t, locale } = useI18n();
  const [savingId, setSavingId] = useState<string | null>(null);
  const [flash, setFlash] = useState<Set<string>>(new Set());
  const [rowError, setRowError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const changeStatus = async (id: string, next: OrderStatus) => {
    setSavingId(id);
    setError(null);
    try {
      const res = await fetchAsAdmin(`/api/orders/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error('http');
      const body = (await res.json()) as { order: StoredOrder };
      onOrderChanged(body.order);
      setFlash((prev) => new Set(prev).add(id));
      setTimeout(() => {
        setFlash((prev) => {
          const copy = new Set(prev);
          copy.delete(id);
          return copy;
        });
      }, 1600);
    } catch (err) {
      if (err instanceof AdminAuthError) {
        onRequireAuth();
      } else {
        setError(t('admin.error'));
      }
    } finally {
      setSavingId(null);
    }
  };

  /* E-mail masqué (visiteur sans mot de passe) = lien confirmation inutilisable */
  const emailIsReal = (email: string) => !email.includes('***');

  return (
    <>
      {error && (
        <p role="alert" className="mt-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      {orders.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-4 rounded-3xl border border-dashed border-noir/20 bg-white/60 py-16 text-center">
          <span className="text-4xl" aria-hidden="true">📦</span>
          <p className="max-w-md text-sm text-noir/60">{t('admin.empty')}</p>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-3xl border border-noir/10 bg-white shadow-warm">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-noir/10 bg-creme/60 text-xs uppercase tracking-wider text-noir/55">
                <th className="px-5 py-3.5 font-semibold">{t('admin.th.no')}</th>
                <th className="px-5 py-3.5 font-semibold">{t('admin.th.date')}</th>
                <th className="px-5 py-3.5 font-semibold">{t('admin.th.client')}</th>
                <th className="px-5 py-3.5 font-semibold">{t('admin.th.items')}</th>
                <th className="px-5 py-3.5 text-right font-semibold">{t('admin.th.total')}</th>
                <th className="px-5 py-3.5 font-semibold">{t('admin.th.status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-noir/10">
              {orders.map((order) => (
                <tr key={order.id} className="transition-colors duration-200 hover:bg-creme-soft/50">
                  <td className="px-5 py-4 font-mono text-xs font-bold tracking-wider">{order.id}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-noir/70">{formatDate(order.createdAt, locale)}</td>
                  <td className="px-5 py-4">
                    <span className="block font-semibold">{order.customer.name}</span>
                    {/* Masqué pour les visiteurs (f***@gmail.com), complet pour l'admin déverrouillé */}
                    <span className="block text-xs text-noir/50">{order.customer.email}</span>
                  </td>
                  <td className="px-5 py-4 text-noir/70">
                    {order.items.reduce((sum, item) => sum + item.qty, 0)} ×{' '}
                    {emailIsReal(order.customer.email) ? (
                      <Link
                        href={`/commande/${encodeURIComponent(order.id)}?email=${encodeURIComponent(order.customer.email)}`}
                        className="link-underline font-medium text-caramel-deep"
                        title={t('admin.order.link')}
                      >
                        {order.items.length}
                      </Link>
                    ) : (
                      <span title={t('admin.auth.lockedHint')}>{order.items.length}</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right font-semibold">{formatMoney(order.total, locale)}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <select
                        value={order.status}
                        onChange={(e) => changeStatus(order.id, e.target.value as OrderStatus)}
                        disabled={savingId === order.id || rowError}
                        aria-label={`${t('admin.th.status')} ${order.id}`}
                        className="rounded-xl border border-noir/15 bg-white px-3 py-2 text-xs font-semibold focus-visible:outline-none disabled:opacity-60"
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {t(`status.${s}`)}
                          </option>
                        ))}
                      </select>
                      {savingId === order.id ? (
                        <IconLoader className="h-4 w-4 animate-spin text-caramel-deep" />
                      ) : flash.has(order.id) ? (
                        <IconCheck className="h-4 w-4 text-sauge-deep" strokeWidth={2.6} />
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-4 text-xs text-noir/40">
        {t('admin.dataStore')}
      </p>
    </>
  );
}
