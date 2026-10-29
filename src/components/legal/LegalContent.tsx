'use client';

import { useI18n } from '@/lib/i18n';
import { Reveal } from '@/components/ui/Reveal';
import { IconBag, IconTruck } from '@/components/ui/icons';

type Kind = 'cgv' | 'shipping';

const CGV_SECTIONS = [1, 2, 3, 4, 5, 6] as const;
const SHIP_SECTIONS = [1, 2, 3, 4, 5] as const;

export function LegalContent({ kind }: { kind: Kind }) {
  const { t } = useI18n();
  const sections = kind === 'cgv' ? CGV_SECTIONS : SHIP_SECTIONS;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6">
      <Reveal>
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-noir text-creme">
            {kind === 'cgv' ? <IconBag className="h-5 w-5" /> : <IconTruck className="h-5 w-5" />}
          </span>
          <div>
            <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
              {t(kind === 'cgv' ? 'legal.cgv.title' : 'legal.ship.title')}
            </h1>
            <p className="text-xs text-noir/50">{t('legal.updated')}</p>
          </div>
        </div>
      </Reveal>

      <div className="mt-10 space-y-8">
        {sections.map((n, i) => (
          <Reveal key={n} delay={i * 60}>
            <section className="rounded-2xl border border-noir/10 bg-white/70 p-6">
              <h2 className="font-serif text-xl font-semibold">
                {t(`legal.${kind}.${n}.t`)}
              </h2>
              <p className="mt-2.5 leading-relaxed text-noir/75">{t(`legal.${kind}.${n}.b`)}</p>
            </section>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
