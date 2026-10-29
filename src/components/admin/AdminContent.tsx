'use client';

import { useCallback, useEffect, useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { Reveal } from '@/components/ui/Reveal';
import { IconLoader, IconRefresh, IconShield, IconTrash } from '@/components/ui/icons';
import { Dashboard } from '@/components/admin/Dashboard';
import { OrdersTable } from '@/components/admin/OrdersTable';
import {
  AdminAuthError,
  fetchAsAdmin,
  isAuthed,
  setAdminPassword,
} from '@/lib/admin-client';
import type { StoredOrder } from '@/lib/types';

type Tab = 'dash' | 'orders';

/**
 * Écran Admin (démonstration) :
 *  • lecture ouverte — le dashboard est visitable sans mot de passe,
 *    mais les données personnelles y sont masquées ;
 *  • actions protégées (effacer, simuler, statut, démasquer) : elles
 *    déclenchent la saisie du mot de passe (env var ADMIN_PASSWORD).
 */
export function AdminContent() {
  const { t } = useI18n();

  const [orders, setOrders] = useState<StoredOrder[] | null>(null);
  const [tab, setTab] = useState<Tab>('dash');
  const [error, setError] = useState<string | null>(null);

  /* Mot de passe admin (saisie à la volée, jamais persistée) */
  const [authPanelOpen, setAuthPanelOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState(false);

  /* Simulation de commandes de démonstration */
  const [seeding, setSeeding] = useState(false);
  const [seedFlash, setSeedFlash] = useState<string | null>(null);

  /* Purge en deux temps (confirmation) */
  const [clearState, setClearState] = useState<'idle' | 'confirm' | 'clearing'>('idle');

  const refresh = useCallback(async (): Promise<StoredOrder[]> => {
    const res = await fetchAsAdmin('/api/orders', { cache: 'no-store' });
    const body = (await res.json()) as { orders: StoredOrder[] };
    setOrders(body.orders);
    return body.orders;
  }, []);

  useEffect(() => {
    refresh().catch(() => setError(t('admin.error')));
  }, [refresh, t]);

  /* Saisie du mot de passe puis rechargement (pour démasquer les e-mails) */
  const submitPassword = async () => {
    setAdminPassword(passwordInput);
    try {
      await refresh();
      setAuthError(false);
      setAuthPanelOpen(false);
      setPasswordInput('');
    } catch (err) {
      if (err instanceof AdminAuthError) {
        /* Mot de passe refusé (ou ADMIN_PASSWORD non défini côté serveur) */
        setAdminPassword(null);
        setAuthError(true);
        return;
      }
      setAdminPassword(null);
      setError(t('admin.error'));
    }
  };

  /* Toute action 401 ouvre le panneau de saisie */
  const requireAuth = () => {
    setAuthError(false);
    setAuthPanelOpen(true);
  };

  const seedDemo = async () => {
    if (seeding) return;
    setSeeding(true);
    setError(null);
    try {
      const res = await fetchAsAdmin('/api/orders/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: 25 }),
      });
      if (!res.ok) throw new Error('http');
      const body = (await res.json()) as { created: number };
      await refresh();
      setSeedFlash(t('admin.demo.seeded', { n: body.created }));
      setTimeout(() => setSeedFlash(null), 2600);
    } catch (err) {
      if (err instanceof AdminAuthError) {
        requireAuth();
      } else {
        setError(t('admin.error'));
      }
    } finally {
      setSeeding(false);
    }
  };

  const clearAll = async () => {
    if (clearState === 'clearing') return;
    if (clearState !== 'confirm') {
      setClearState('confirm');
      setTimeout(() => setClearState((s) => (s === 'confirm' ? 'idle' : s)), 3500);
      return;
    }
    setClearState('clearing');
    setError(null);
    try {
      const res = await fetchAsAdmin('/api/orders', { method: 'DELETE' });
      if (!res.ok) throw new Error('http');
      await refresh();
      setSeedFlash(t('admin.demo.cleared'));
      setTimeout(() => setSeedFlash(null), 2600);
    } catch (err) {
      if (err instanceof AdminAuthError) {
        requireAuth();
      } else {
        setError(t('admin.error'));
      }
    } finally {
      setClearState('idle');
    }
  };

  const authed = isAuthed();

  const tabButton = (id: Tab, label: string) => (
    <button
      key={id}
      type="button"
      onClick={() => setTab(id)}
      aria-pressed={tab === id}
      className={`rounded-full border px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
        tab === id
          ? 'border-noir bg-noir text-creme shadow-warm'
          : 'border-noir/15 bg-white text-noir/60 hover:border-noir/40 hover:text-noir'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      {/* Bandeau démo */}
      <div role="note" className="mb-8 flex items-center gap-3 rounded-2xl border border-sauge/50 bg-sauge/15 px-4 py-3.5">
        <IconShield className="h-5 w-5 shrink-0 text-sauge-deep" />
        <p className="text-sm font-semibold text-sauge-deep">{t('admin.sub')}</p>
      </div>

      {/* En-tête : titre + compte + toolbar démo */}
      <Reveal className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl font-bold tracking-tight">{t('admin.title')}</h1>
          {orders && (
            <p aria-live="polite" className="mt-1 text-sm font-semibold text-noir/55">
              {orders.length === 1 ? t('admin.countOne') : t('admin.countOther', { n: orders.length })}
              {seedFlash && <span className="ml-3 text-sauge-deep">{seedFlash}</span>}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={seedDemo}
            disabled={seeding}
            className="btn-card bg-noir px-4 py-2 text-creme hover:bg-caramel hover:text-noir disabled:cursor-wait disabled:opacity-70"
          >
            {seeding ? <IconLoader className="h-4 w-4 animate-spin" /> : <IconRefresh className="h-4 w-4" />}
            {seeding ? t('admin.demo.seeding') : t('admin.demo.seed')}
          </button>
          <button
            type="button"
            onClick={clearAll}
            disabled={orders === null}
            className={`btn-card px-4 py-2 ${
              clearState === 'confirm'
                ? 'bg-red-600 text-white shadow-warm'
                : 'border border-noir/15 bg-white text-noir/70 hover:border-red-300 hover:text-red-600'
            }`}
            aria-live="polite"
          >
            {clearState === 'clearing' ? (
              <IconLoader className="h-4 w-4 animate-spin" />
            ) : (
              <IconTrash className="h-4 w-4" />
            )}
            {clearState === 'confirm' ? t('admin.demo.clearConfirm') : t('admin.demo.clear')}
          </button>
          {!authed && (
            <button
              type="button"
              onClick={() => setAuthPanelOpen((v) => !v)}
              className="btn-card border border-sauge/60 bg-white px-4 py-2 text-sauge-deep hover:border-sauge"
            >
              <IconShield className="h-4 w-4" />
              {t('admin.auth.unlock')}
            </button>
          )}
        </div>
      </Reveal>

      {/* Panneau de déverrouillage */}
      {authPanelOpen && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void submitPassword();
          }}
          className="mt-4 flex flex-wrap items-end gap-3 rounded-2xl border border-sauge/50 bg-white px-4 py-4"
        >
          <label className="min-w-56 flex-1">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-noir/55">
              {t('admin.auth.password')}
            </span>
            <input
              type="password"
              autoFocus
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              aria-invalid={authError}
              className="w-full rounded-xl border border-noir/15 bg-white px-3.5 py-2.5 text-sm text-noir focus-visible:outline-none"
            />
          </label>
          <button type="submit" className="btn-card bg-noir px-4 py-2.5 text-creme hover:bg-caramel hover:text-noir">
            {t('admin.auth.unlock')}
          </button>
          {authError && (
            <p role="alert" className="w-full text-xs font-medium text-red-700">
              {t('admin.auth.badPassword')}
            </p>
          )}
          <p className="w-full text-xs text-noir/45">{t('admin.auth.hint')}</p>
        </form>
      )}

      {error && (
        <p role="alert" className="mt-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      {/* Onglets */}
      <Reveal delay={60} className="mt-8 flex gap-2.5">
        {tabButton('dash', t('admin.tab.dashboard'))}
        {tabButton('orders', t('admin.tab.orders'))}
      </Reveal>

      {/* Contenu des onglets */}
      {orders === null ? (
        <div className="mt-10 flex items-center gap-3 text-sm text-noir/60">
          <IconLoader className="h-5 w-5 animate-spin text-caramel-deep" />
          {t('admin.loading')}
        </div>
      ) : tab === 'dash' ? (
        <div key="dash" className="animate-fade-up">
          <Dashboard orders={orders} seeding={seeding} onSeed={seedDemo} />
        </div>
      ) : (
        <div key="orders" className="animate-fade-up">
          <OrdersTable
            orders={orders}
            onRequireAuth={requireAuth}
            onOrderChanged={(order) => setOrders((prev) => prev?.map((o) => (o.id === order.id ? order : o)) ?? prev)}
          />
        </div>
      )}
    </div>
  );
}
