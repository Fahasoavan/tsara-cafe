'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { LogoMark } from '@/components/ui/icons';

export function Footer() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-noir text-creme/85">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-10 pt-14 sm:px-6 md:grid-cols-[2fr_1fr_1fr_1fr]">
        {/* Marque */}
        <div>
          <div className="flex items-center gap-2.5">
            <LogoMark className="h-9 w-9" />
            <span className="font-serif text-xl font-semibold text-creme">Tsara Café</span>
          </div>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-creme/65">{t('footer.tagline')}</p>
        </div>

        {/* Boutique */}
        <nav aria-label={t('footer.shop')}>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-caramel-light">
            {t('footer.shop')}
          </p>
          <ul className="space-y-2 text-sm">
            <li><Link className="link-underline" href="/catalogue">{t('nav.catalog')}</Link></li>
            <li><Link className="link-underline" href="/panier">{t('cart.title')}</Link></li>
            <li><Link className="link-underline" href="/paiement">{t('checkout.title')}</Link></li>
          </ul>
        </nav>

        {/* Aide */}
        <nav aria-label={t('footer.help')}>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-caramel-light">
            {t('footer.help')}
          </p>
          <ul className="space-y-2 text-sm">
            <li><Link className="link-underline" href="/suivi">{t('nav.track')}</Link></li>
            <li><Link className="link-underline" href="/livraison-retours">{t('footer.returns')}</Link></li>
            <li><Link className="link-underline" href="/admin">{t('nav.admin')}</Link></li>
          </ul>
        </nav>

        {/* Légal */}
        <nav aria-label={t('footer.legal')}>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-caramel-light">
            {t('footer.legal')}
          </p>
          <ul className="space-y-2 text-sm">
            <li><Link className="link-underline" href="/cgv">{t('footer.terms')}</Link></li>
            <li><Link className="link-underline" href="/livraison-retours">{t('footer.returns')}</Link></li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-creme/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-creme/50 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>{t('footer.rights', { year })}</p>
          <p>☕ {t('footer.demo')}</p>
        </div>
      </div>
    </footer>
  );
}
