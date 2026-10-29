/**
 * Validation du panier & calcul des totaux — fonctions PURES.
 * Aucun import d'I/O : testables directement (src/lib/totals.test.ts).
 *
 * Toute la monnaie est manipulée en CENTIMES ENTIERS pour éviter toute
 * dérive flottante (« 59.99999 € »). Conversion finale uniquement.
 */
import { getProductById, getUnitPrice, type FormatId, type GrindId } from '@/data/products';
import { fromCents, toCents } from '@/lib/format';
import { findPromo } from '@/lib/promo';
import { FREE_SHIPPING_MIN, SHIPPING_FEE } from '@/lib/shipping';
import type { CartLine, StoredOrderLine } from '@/lib/types';

const MAX_QTY = 99;

export interface Totals {
  lines: CartLine[];
  promoCode: string | null;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
}

/** Note : constantes converties en centimes une seule fois, à froid */
const FREE_SHIPPING_MIN_C = Math.round(FREE_SHIPPING_MIN * 100);
const SHIPPING_FEE_C = Math.round(SHIPPING_FEE * 100);

function shippingCents(subtotalAfterDiscountC: number): number {
  return subtotalAfterDiscountC >= FREE_SHIPPING_MIN_C ? 0 : SHIPPING_FEE_C;
}

/**
 * Garde-fou : compare les lignes envoyées par le navigateur avec le catalogue.
 * Renvoie la liste nettoyée + les totaux recalculés, ou une erreur explicite.
 * Le code promo est revérifié ici (jamais confiance au client).
 */
export function computeTotals(rawLines: unknown, rawPromo: unknown): Totals {
  if (!Array.isArray(rawLines) || rawLines.length === 0) {
    throw new Error('Panier vide.');
  }

  const lines: CartLine[] = rawLines.map((raw, index): CartLine => {
    if (typeof raw !== 'object' || raw === null) {
      throw new Error(`Ligne ${index + 1} invalide.`);
    }
    const o = raw as Record<string, unknown>;
    const productId = typeof o.productId === 'string' ? o.productId : '';
    const format = o.format === 's250' || o.format === 's1000' || o.format === 'coffret' ? (o.format as FormatId) : null;
    const grind: GrindId | null =
      o.grind === null || o.grind === undefined
        ? null
        : ['grains', 'filtre', 'espresso', 'piston', 'moka'].includes(String(o.grind))
          ? (String(o.grind) as GrindId)
          : null;
    const qty = typeof o.qty === 'number' && Number.isInteger(o.qty) ? o.qty : 0;

    const product = getProductById(productId);
    if (!product) throw new Error(`Produit inconnu : « ${productId} ».`);
    if (!format) throw new Error(`Format invalide pour « ${product.name} ».`);
    if (qty < 1 || qty > MAX_QTY) throw new Error(`Quantité invalide pour « ${product.name} ».`);

    /* Cohérence type ↔ mouture : un coffret n'a pas de mouture,
       un produit ne peut pas avoir une mouture non proposée. */
    if (product.type === 'coffret') {
      if (format !== 'coffret') throw new Error(`Format invalide pour « ${product.name} ».`);
      if (grind !== null) throw new Error(`Mouture invalide pour « ${product.name} ».`);
    } else {
      const allowed: GrindId[] =
        product.type === 'grains'
          ? ['grains', 'filtre', 'espresso', 'piston', 'moka']
          : ['filtre', 'espresso', 'piston', 'moka'];
      if (!grind || !allowed.includes(grind)) {
        throw new Error(`Mouture invalide pour « ${product.name} ».`);
      }
      if (format !== 's250' && format !== 's1000') {
        throw new Error(`Format invalide pour « ${product.name} ».`);
      }
    }

    return { productId, format, grind, qty };
  });

  /* Sous-total en centimes entiers */
  const subtotalC = lines.reduce((sum, l) => {
    const product = getProductById(l.productId);
    if (!product) throw new Error(`Produit inconnu : « ${l.productId} ».`);
    return sum + toCents(getUnitPrice(product, l.format)) * l.qty;
  }, 0);

  /* Remise : entiers (centimes), puis livraison et total sur le restant */
  const promo = findPromo(typeof rawPromo === 'string' ? rawPromo : null);
  const discountC = promo ? Math.round((subtotalC * promo.percentOff) / 100) : 0;
  const afterDiscountC = subtotalC - discountC;
  const shippingC = shippingCents(afterDiscountC);
  const totalC = afterDiscountC + shippingC;

  return {
    lines,
    promoCode: promo?.code ?? null,
    subtotal: fromCents(subtotalC),
    discount: fromCents(discountC),
    shipping: fromCents(shippingC),
    total: fromCents(totalC),
  };
}

/** Construit le snapshot d'articles à partir de lignes déjà validées */
export function itemsFromLines(lines: CartLine[]): StoredOrderLine[] {
  return lines.map((line) => {
    const product = getProductById(line.productId);
    if (!product) throw new Error(`Produit inconnu : « ${line.productId} ».`);
    const unitC = toCents(getUnitPrice(product, line.format));
    return {
      productId: product.id,
      name: { fr: product.name, en: product.name },
      format: line.format,
      grind: line.grind,
      qty: line.qty,
      unitPrice: fromCents(unitC),
      lineTotal: fromCents(unitC * line.qty),
      accent: product.accent,
    };
  });
}
