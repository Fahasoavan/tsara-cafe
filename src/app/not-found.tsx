'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { BagVisual } from '@/components/BagVisual';

export default function NotFound() {
  const { t } = useI18n();

  return (
    <main className="mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      <BagVisual accent="#C07A3A" className="h-40 w-auto animate-float" deco="gift" />
      <p className="font-serif text-6xl font-bold text-noir">404</p>
      <h1 className="font-serif text-3xl font-semibold">{t('nf.title')}</h1>
      <p className="max-w-md text-noir/70">{t('nf.sub')}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/catalogue" className="btn-card bg-caramel text-noir hover:-translate-y-0.5 hover:shadow-warm">
          {t('nf.cta')}
        </Link>
        <Link href="/" className="btn-card border border-noir/20 text-noir hover:border-noir/50">
          {t('nf.home')}
        </Link>
      </div>
    </main>
  );
}
