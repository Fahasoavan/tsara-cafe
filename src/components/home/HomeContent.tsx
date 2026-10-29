'use client';

import Link from 'next/link';
import { PRODUCTS } from '@/data/products';
import { useI18n, type Locale } from '@/lib/i18n';
import { ProductCard } from '@/components/ProductCard';
import { BagVisual } from '@/components/BagVisual';
import { Reveal } from '@/components/ui/Reveal';
import {
  IconArrowRight,
  IconCheck,
  IconFlame,
  IconLeaf,
  IconStar,
  IconTruck,
} from '@/components/ui/icons';

const MARQUEE_KEYS = ['home.marquee.1', 'home.marquee.2', 'home.marquee.3', 'home.marquee.4'] as const;

export function HomeContent() {
  const { t, locale } = useI18n();
  const L: Locale = locale;
  const featured = PRODUCTS.filter((p) => p.featured).slice(0, 3);

  return (
    <div className="flex flex-col">
      {/* Bandeau déroulant « livraison offerte » */}
      <div className="marquee-mask border-b border-creme/10 bg-sauge py-2 text-creme">
        <div className="marquee-track animate-marquee gap-0">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex shrink-0 items-center gap-10 pr-10" aria-hidden={dup === 1}>
              {MARQUEE_KEYS.map((key) => (
                <span key={key} className="flex items-center gap-10 whitespace-nowrap text-xs font-semibold uppercase tracking-[0.14em]">
                  {t(key)}
                  <span className="text-caramel-light" aria-hidden="true">☕</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ============ HÉRO ============ */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(800px 420px at 82% 8%, rgba(192,122,58,0.16), transparent 70%), radial-gradient(900px 480px at 6% 20%, rgba(107,127,94,0.14), transparent 70%)',
          }}
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-2 lg:pb-28 lg:pt-20">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-caramel/40 bg-caramel/10 px-3.5 py-1.5 text-xs font-semibold text-caramel-deep">
                <span className="h-2 w-2 rounded-full bg-caramel" aria-hidden="true" />
                {t('home.hero.badge')}
              </span>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="mt-5 font-serif text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.4rem]">
                {t('home.hero.title')}
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-noir/70 sm:text-lg">
                {t('home.hero.sub')}
              </p>
            </Reveal>
            <Reveal delay={240}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/catalogue"
                  className="btn-card bg-caramel text-noir shadow-warm hover:-translate-y-0.5 hover:bg-caramel-deep hover:text-creme"
                >
                  {t('home.hero.cta1')}
                  <IconArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#histoire"
                  className="btn-card border border-noir/20 text-noir hover:border-noir/60 hover:-translate-y-0.5"
                >
                  {t('home.hero.cta2')}
                </a>
              </div>
            </Reveal>
            <Reveal delay={320}>
              <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
                {[
                  { n: '4', key: 'home.hero.stat1' },
                  { n: '12', key: 'home.hero.stat2' },
                  { n: '100 %', key: 'home.hero.stat3' },
                ].map((s) => (
                  <div key={s.key}>
                    <dt className="font-serif text-2xl font-bold text-caramel-deep">{s.n}</dt>
                    <dd className="text-xs font-medium uppercase tracking-wide text-noir/55">{t(s.key)}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          {/* Composition visuelle : sachets + tasse fumante */}
          <Reveal variant="zoom" className="relative mx-auto h-[380px] w-full max-w-md sm:h-[440px]">
            <div aria-hidden="true" className="absolute inset-x-6 top-2 bottom-10 rounded-[2.2rem] bg-gradient-to-br from-sauge/15 via-creme-soft to-caramel/25 shadow-warm" />
            <BagVisual
              accent="#C07A3A"
              className="absolute left-[8%] top-[12%] h-[72%] animate-float drop-shadow-xl"
              aria-hidden="true"
            />
            <BagVisual
              accent="#6B7F5E"
              deco="gift"
              className="absolute right-[10%] top-[26%] h-[62%] animate-float-slow drop-shadow-lg"
            />
            <SteamCup className="absolute bottom-[2%] left-[30%] h-32 w-auto" />
            <span className="absolute right-[2%] top-[4%] rounded-2xl bg-white/85 px-3 py-2 text-[11px] font-semibold text-noir shadow backdrop-blur animate-float-slow">
              Torréfaction du mois ☕
            </span>
          </Reveal>
        </div>
      </section>

      {/* ============ RÉASSURANCE ============ */}
      <section className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-4 rounded-3xl border border-noir/10 bg-white/70 p-6 backdrop-blur-sm md:grid-cols-4">
          {[
            { icon: IconFlame, t1: 'home.trust1.t', d: 'home.trust1.d' },
            { icon: IconLeaf, t1: 'home.trust2.t', d: 'home.trust2.d' },
            { icon: IconTruck, t1: 'home.trust3.t', d: 'home.trust3.d' },
            { icon: IconCheck, t1: 'home.trust4.t', d: 'home.trust4.d' },
          ].map(({ icon: Icon, t1, d }, i) => (
            <Reveal key={t1} delay={i * 90} className="flex flex-col items-start gap-3 rounded-2xl p-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sauge/15 text-sauge-deep">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="font-serif text-base font-semibold">{t(t1)}</h3>
              <p className="text-sm leading-snug text-noir/60">{t(d)}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ PRODUITS PHARES ============ */}
      <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="label-warm">{t('home.featured.kicker')}</p>
            <h2 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">{t('home.featured.title')}</h2>
            <p className="mt-2 text-noir/60">{t('home.featured.sub')}</p>
          </div>
          <Link
            href="/catalogue"
            className="link-underline hidden items-center gap-1.5 text-sm font-semibold text-caramel-deep sm:inline-flex"
          >
            {t('home.featured.all')}
            <IconArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p, i) => (
            <Reveal key={p.id} delay={i * 110}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ NOTRE HISTOIRE ============ */}
      <section id="histoire" className="scroll-mt-24 bg-noir py-20 text-creme">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.1fr]">
          <Reveal variant="zoom" className="relative">
            <div
              aria-hidden="true"
              className="absolute inset-4 rounded-[2.5rem] bg-gradient-to-br from-caramel/60 via-caramel/25 to-transparent blur-sm"
            />
            <div className="relative flex items-center justify-center rounded-[2rem] bg-gradient-to-br from-noir-mist to-noir-soft p-10 shadow-warm-lg">
              <BagVisual accent="#C07A3A" className="h-72 w-auto drop-shadow-2xl animate-float-slow" aria-hidden="true" />
            </div>
            <p className="mt-4 text-center text-xs text-creme/50">{L === 'fr' ? 'Chaleur du matin, Haute Matsiatra' : 'Morning warmth, Haute Matsiatra'}</p>
          </Reveal>
          <div>
            <Reveal>
              <p className="label-warm text-caramel-light">{t('home.story.kicker')}</p>
              <h2 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">{t('home.story.title')}</h2>
            </Reveal>
            <Reveal delay={100}>
              <div className="mt-6 space-y-4 text-creme/75 leading-relaxed">
                <p>{t('home.story.p1')}</p>
                <p>{t('home.story.p2')}</p>
                <p className="font-serif text-lg italic text-caramel-light">« {t('home.story.p3')} »</p>
              </div>
            </Reveal>
            <Reveal delay={180}>
              <ul className="mt-8 space-y-3">
                {['home.story.point1', 'home.story.point2', 'home.story.point3'].map((k) => (
                  <li key={k} className="flex items-start gap-3 text-sm text-creme/85">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sauge text-creme">
                      <IconCheck className="h-3 w-3" strokeWidth={2.6} />
                    </span>
                    {t(k)}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={240}>
              <Link
                href="/catalogue"
                className="btn-card mt-8 bg-creme text-noir hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-12px_rgba(246,239,230,0.35)]"
              >
                {t('home.story.cta')}
                <IconArrowRight className="h-4 w-4" />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ AVIS CLIENTS ============ */}
      <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
        <Reveal className="text-center">
          <p className="label-warm">{t('home.reviews.kicker')}</p>
          <h2 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">{t('home.reviews.title')}</h2>
          <p className="mt-2 text-noir/60">{t('home.reviews.sub')}</p>
        </Reveal>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {(['r1', 'r2', 'r3'] as const).map((r, i) => (
            <Reveal key={r} delay={i * 110}>
              <figure className="flex h-full flex-col gap-4 rounded-3xl border border-noir/10 bg-white p-6 shadow-[0_1px_2px_rgba(30,22,18,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-warm">
                <div className="flex gap-0.5 text-caramel" aria-label="5/5">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <IconStar key={s} className="h-4 w-4" />
                  ))}
                </div>
                <blockquote className="flex-1 font-serif text-[1.05rem] leading-relaxed text-noir/85">
                  «&nbsp;{t(`home.reviews.${r}.text`)}&nbsp;»
                </blockquote>
                <figcaption className="text-sm text-noir/55">
                  <span className="font-semibold text-noir">{t(`home.reviews.${r}.name`)}</span>
                  {' — '}
                  {t(`home.reviews.${r}.city`)}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ CTA FINAL ============ */}
      <section className="px-4 pb-24 sm:px-6">
        <Reveal variant="zoom">
          <div className="mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-caramel via-caramel-deep to-noir px-8 py-14 text-center text-creme shadow-warm-lg sm:px-14">
            <h2 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">{t('home.cta.title')}</h2>
            <p className="mx-auto mt-3 max-w-xl text-creme/85">{t('home.cta.sub')}</p>
            <Link
              href="/catalogue"
              className="btn-card mt-8 bg-creme text-noir hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-12px_rgba(0,0,0,0.45)]"
            >
              {t('home.cta.button')}
              <IconArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

/** Tasse fumante en SVG (vapeur animée) */
function SteamCup({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 110" className={className} aria-hidden="true">
      {/* vapeur */}
      <g stroke="#C07A3A" strokeWidth="2.4" fill="none" strokeLinecap="round">
        <path className="steam-path" d="M42 22 c-3 -6 3 -10 0 -16" />
        <path className="steam-path" style={{ animationDelay: '0.7s' }} d="M56 24 c-3 -7 3 -11 0 -18" />
        <path className="steam-path" style={{ animationDelay: '1.3s' }} d="M70 22 c-3 -6 3 -10 0 -16" />
      </g>
      {/* soucoupe */}
      <ellipse cx="56" cy="98" rx="40" ry="6" fill="#1E1612" opacity="0.14" />
      {/* tasse */}
      <path
        d="M30 46 h52 v18 a26 26 0 0 1-52 0 Z"
        fill="#F6EFE6"
        stroke="#1E1612"
        strokeWidth="2.5"
      />
      <path
        d="M82 50 c10 0 14 4 14 9s-4 9-14 9"
        fill="none"
        stroke="#1E1612"
        strokeWidth="2.5"
      />
      <path d="M36 52 h40 v10 a20 20 0 0 1-40 0 Z" fill="#C07A3A" opacity="0.75" />
      {/* libellé */}
      <rect x="44" y="70" width="24" height="10" rx="3" fill="#6B7F5E" opacity="0.9" />
    </svg>
  );
}
