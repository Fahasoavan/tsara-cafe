'use client';

import Link from 'next/link';
import { ORIGIN_LABELS, getMinPrice, type Product } from '@/data/products';
import { useI18n } from '@/lib/i18n';
import { useCart } from '@/lib/cart';
import { formatMoney } from '@/lib/format';
import { BagVisual } from '@/components/BagVisual';

/** Carte produit (catalogue + produits phares) */
export function ProductCard({ product }: { product: Product }) {
  const { t, locale } = useI18n();
  const { add, ready } = useCart();

  const isCoffret = product.type === 'coffret';
  const minPrice = getMinPrice(product);
  const originLabel = ORIGIN_LABELS[product.origin];
  const badge = product.badge ? product.badge[locale === 'en' ? 'en' : 'fr'] : null;

  const handleAdd = () => {
    if (!ready) return;
    add(product.id, isCoffret ? 'coffret' : 's250', isCoffret ? null : product.type === 'moulu' ? 'filtre' : 'grains', 1);
  };

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-noir/10 bg-white shadow-[0_1px_2px_rgba(30,22,18,0.05)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-warm-lg">
      {/* Visuel */}
      <Link
        href={`/produit/${product.slug}`}
        className="relative flex h-52 items-center justify-center overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${product.accent}33 0%, ${product.accent}18 45%, rgba(30,22,18,0.06) 100%)`,
        }}
        aria-hidden="false"
      >
        <div className="absolute left-3 top-3 z-10 flex flex-col items-start gap-1.5">
          {badge && (
            <span className="rounded-full bg-noir/85 px-2.5 py-1 text-[11px] font-semibold text-creme shadow">
              {badge}
            </span>
          )}
          <span className="rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-medium text-noir/75 backdrop-blur-sm">
            {t(`type.${product.type}`)}
          </span>
        </div>
        <BagVisual
          accent={product.accent}
          deco={isCoffret ? 'gift' : 'coffee'}
          className="h-[88%] w-auto drop-shadow-md transition-transform duration-500 ease-out group-hover:scale-[1.06] group-hover:-rotate-2"
        />
      </Link>

      {/* Texte */}
      <div className="flex flex-1 flex-col gap-2 p-5">
        <Link href={`/produit/${product.slug}`} className="focus-visible:outline-none">
          <h3 className="font-serif text-lg font-semibold leading-tight transition-colors group-hover:text-caramel-deep">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs font-medium uppercase tracking-wide text-noir/50">
          {locale === 'en' ? originLabel.en : originLabel.fr}
        </p>
        <p className="line-clamp-2 text-sm leading-relaxed text-noir/65">
          {(locale === 'en' ? product.notes.en : product.notes.fr).join(' · ')}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <p className="text-sm text-noir/70">
            {t('card.from')}{' '}
            <span className="font-serif text-lg font-bold text-noir">
              {formatMoney(minPrice, locale)}
            </span>
          </p>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!ready}
            className="rounded-full bg-noir px-4 py-2.5 text-xs font-semibold text-creme transition-all duration-300 hover:scale-105 hover:bg-caramel hover:text-noir active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {t('card.add')}
          </button>
        </div>
      </div>
    </article>
  );
}
