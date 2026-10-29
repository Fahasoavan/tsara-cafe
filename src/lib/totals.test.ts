/**
 * Tests de la fonction pure computeTotals (panier, remise, livraison, centimes).
 * C'est LE point critique serveur : tout ce qui vient du navigateur y est
 * revérifié. Aucune I/O — purement déterministe.
 *
 * Lanceur : `npm test` (Vitest).
 */
import { describe, expect, it } from 'vitest';
import { computeTotals, itemsFromLines, type Totals } from '@/lib/totals';
import { toCents } from '@/lib/format';

const grainsLine = { productId: 'bourbon-pointu', format: 's250', grind: 'grains', qty: 2 };
const coffretLine = { productId: 'coffret-decouverte', format: 'coffret', grind: null, qty: 1 };

describe('computeTotals — validation du panier', () => {
  it('rejette un panier vide', () => {
    expect(() => computeTotals([], null)).toThrow();
    expect(() => computeTotals('nope', null)).toThrow();
  });

  it('rejette une ligne non-objet', () => {
    expect(() => computeTotals([null], null)).toThrow(/Ligne 1/);
  });

  it('rejette un produit inconnu', () => {
    expect(() => computeTotals([{ productId: 'inexistant', format: 's250', grind: 'grains', qty: 1 }], null)).toThrow(
      /Produit inconnu/,
    );
  });

  it('rejette les quantités invalides', () => {
    for (const qty of [0, -1, 1.5, 100]) {
      expect(() => computeTotals([{ ...grainsLine, qty }], null)).toThrow(/Quantité invalide/);
    }
  });

  it('rejette un coffret avec mouture', () => {
    expect(() => computeTotals([{ ...coffretLine, grind: 'grains' }], null)).toThrow(/Mouture invalide/);
  });

  it('rejette un coffret avec un mauvais format', () => {
    expect(() => computeTotals([{ ...coffretLine, format: 's250' }], null)).toThrow(/Format invalide/);
  });

  it('rejette un café moulu commandé en « grains »', () => {
    expect(() =>
      computeTotals([{ productId: 'cacao-sauvage', format: 's250', grind: 'grains', qty: 1 }], null),
    ).toThrow(/Mouture invalide/);
  });
});

describe('computeTotals — économie', () => {
  it('calcule sous-total, livraison (6,90 €) et total', () => {
    const t = computeTotals([grainsLine], null);
    /* 24,90 € × 2 = 49,80 € → < 60 € : livraison 6,90 € */
    expect(t.subtotal).toBe(49.8);
    expect(t.shipping).toBe(6.9);
    expect(t.total).toBe(56.7);
    expect(t.promoCode).toBeNull();
  });

  it('offre la livraison dès 60 € après remise', () => {
    /* 5 × 12,90 € = 64,50 € → ≥ 60 € : livraison offerte */
    const t = computeTotals(
      [{ productId: 'ambanja-grand-cru', format: 's250', grind: 'grains', qty: 5 }],
      null,
    );
    expect(t.shipping).toBe(0);
    expect(t.total).toBe(64.5);
  });

  it('applique le code promo BIENVENUE10 (insensible à la casse)', () => {
    const t = computeTotals([grainsLine], 'bienvenue10');
    /* 49,80 € − 10 % = 44,82 € → < 60 € : livraison 6,90 € */
    expect(t.promoCode).toBe('BIENVENUE10');
    expect(t.discount).toBe(4.98);
    expect(t.shipping).toBe(6.9);
    expect(t.total).toBe(51.72);
  });

  it('ignore silencieusement un code promo inconnu', () => {
    const t = computeTotals([grainsLine], 'FORFAIT');
    expect(t.promoCode).toBeNull();
    expect(t.discount).toBe(0);
  });

  it('montants exacts en centimes (pas de 599.6999999)', () => {
    /* 13 × 44 € = 572 € (livraison offerte ≥ 60 €) : la conversion
       flottante 572 € → centimes serait 57199.9999 sans arithmétique entière */
    const tricky = { productId: 'vanille-antalaha', format: 's1000', grind: 'moka', qty: 13 };
    const t = computeTotals([tricky], null);
    expect(t.subtotal).toBe(572);
    expect(toCents(t.total)).toBe(4400 * 13); // 57 200 centimes exacts
  });
});

describe('itemsFromLines', () => {
  it('produit les snapshots avec totaux de ligne exacts', () => {
    const totals: Totals = computeTotals([grainsLine, coffretLine], 'BIENVENUE10');
    const items = itemsFromLines(totals.lines);
    expect(items).toHaveLength(2);
    expect(items[0].unitPrice).toBe(24.9);
    expect(items[0].lineTotal).toBe(49.8);
    expect(items[1].lineTotal).toBe(39.9);
    expect(items[1].grind).toBeNull();
  });
});
