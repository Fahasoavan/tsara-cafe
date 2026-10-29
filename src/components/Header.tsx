'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { LOCALES, useI18n } from '@/lib/i18n';
import { useCart } from '@/lib/cart';
import { IconBag, IconClose, IconMenu, LogoMark } from '@/components/ui/icons';

const NAV = [
  { href: '/', key: 'nav.home' },
  { href: '/catalogue', key: 'nav.catalog' },
  { href: '/suivi', key: 'nav.track' },
] as const;

export function Header() {
  const { t, locale, setLocale } = useI18n();
  const { count, ready } = useCart();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [bump, setBump] = useState(false);
  const previous = useRef(0);

  /* Petit rebond du compteur de panier à chaque ajout */
  useEffect(() => {
    if (ready && count !== previous.current) {
      previous.current = count;
      setBump(true);
      const id = setTimeout(() => setBump(false), 450);
      return () => clearTimeout(id);
    }
  }, [count, ready]);

  /* Ferme le menu mobile à chaque navigation */
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-noir focus:px-4 focus:py-2 focus:text-sm focus:text-creme"
      >
        {t('a11y.skip')}
      </a>

      <header className="sticky top-0 z-50 border-b border-noir/10 bg-creme/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 transition-transform duration-300 hover:scale-[1.03]">
            <LogoMark className="h-9 w-9" />
            <span className="font-serif text-lg font-semibold tracking-tight md:text-xl">
              Tsara Caf<span className="text-caramel-deep" aria-hidden="true">é</span>
            </span>
            <span className="sr-only">{t('brand.tagline')}</span>
          </Link>

          {/* Navigation bureau */}
          <nav aria-label="Navigation principale" className="hidden items-center gap-7 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`link-underline text-sm font-medium transition-colors ${
                  isActive(item.href) ? 'text-caramel-deep' : 'text-noir/80 hover:text-noir'
                }`}
                aria-current={isActive(item.href) ? 'page' : undefined}
              >
                {t(item.key)}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {/* Sélecteur de langue FR/EN */}
            <div
              role="group"
              aria-label={t('nav.language')}
              className="flex items-center rounded-full border border-noir/15 bg-white/70 p-0.5"
            >
              {LOCALES.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setLocale(l.id)}
                  aria-pressed={locale === l.id}
                  className={`lang-pill ${
                    locale === l.id ? 'bg-noir text-creme' : 'text-noir/60 hover:text-noir'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>

            {/* Panier + compteur */}
            <Link
              href="/panier"
              aria-label={`${t('a11y.openCart')}${ready ? ` (${count})` : ''}`}
              className="relative rounded-full border border-noir/15 bg-white/70 p-2 text-noir transition-all duration-300 hover:-translate-y-0.5 hover:bg-white"
            >
              <IconBag className="h-5 w-5" />
              {ready && count > 0 && (
                <span
                  key={count}
                  className={`absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-caramel px-1 text-[11px] font-bold leading-none text-noir ${
                    bump ? 'animate-bump' : ''
                  }`}
                >
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </Link>

            {/* Burger mobile */}
            <button
              type="button"
              className="rounded-full border border-noir/15 bg-white/70 p-2 md:hidden"
              aria-expanded={open}
              aria-label={open ? t('a11y.closeMenu') : t('a11y.openMenu')}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <IconClose className="h-5 w-5" /> : <IconMenu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Menu mobile déroulant */}
        <div
          className={`overflow-hidden border-t border-noir/10 bg-creme transition-[max-height,opacity] duration-300 md:hidden ${
            open ? 'max-h-72 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <nav aria-label="Navigation mobile" className="flex flex-col px-5 py-2">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`py-3 text-sm font-medium ${
                  isActive(item.href) ? 'text-caramel-deep' : 'text-noir/80'
                }`}
              >
                {t(item.key)}
              </Link>
            ))}
            <Link href="/panier" className="py-3 text-sm font-medium text-noir/80">{t('cart.title')}</Link>
          </nav>
        </div>
      </header>
    </>
  );
}
