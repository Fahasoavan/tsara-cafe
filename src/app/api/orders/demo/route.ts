import { NextResponse } from 'next/server';
import { PRODUCTS, type FormatId, type GrindId } from '@/data/products';
import { computeTotals, itemsFromLines, saveOrders, composeOrder, listOrders } from '@/lib/orders';
import type { CartLine, OrderStatus, StoredOrder } from '@/lib/types';

/**
 * POST /api/orders/demo
 * Génère des commandes de DÉMONSTRATION réalistes, réparties sur les
 * 30 derniers jours, pour donner vie au tableau de bord de l'admin.
 * Corps : { count?: number } (1–60, 25 par défaut)
 */
export async function POST(request: Request) {
  let body: { count?: number };
  try {
    body = (await request.json()) as { count?: number };
  } catch {
    body = {};
  }
  const count = Math.min(60, Math.max(1, Math.floor(Number(body?.count) || 25)));

  const existing = await listOrders();
  const usedIds = new Set(existing.map((o) => o.id));
  const created: StoredOrder[] = [];

  for (let i = 0; i < count; i += 1) {
    /* Identifiant unique */
    let id = newDummyId();
    while (usedIds.has(id)) id = newDummyId();
    usedIds.add(id);

    /* 1 à 3 lignes, produits et moutures cohérents */
    const lineCount = 1 + Math.floor(Math.random() * 3);
    const picked = new Set<string>();
    const lines: CartLine[] = [];
    for (let l = 0; l < lineCount; l += 1) {
      const product = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];
      if (picked.has(product.id)) continue;
      picked.add(product.id);

      const format: FormatId = product.type === 'coffret' ? 'coffret' : Math.random() < 0.6 ? 's250' : 's1000';
      const grind: GrindId | null =
        product.type === 'coffret'
          ? null
          : product.type === 'grains'
            ? (['grains', 'filtre', 'espresso', 'piston', 'moka'] as const)[Math.floor(Math.random() * 5)]
            : (['filtre', 'espresso', 'piston', 'moka'] as const)[Math.floor(Math.random() * 4)];
      const qty = 1 + Math.floor(Math.random() * (Math.random() < 0.75 ? 3 : 6));
      lines.push({ productId: product.id, format, grind, qty });
    }

    /* Codes promo possibles, dates étalées sur 30 jours (skew récent) */
    const usePromo = Math.random() < 0.35;
    const dayOffset = Math.floor(Math.pow(Math.random(), 1.5) * 30);
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - dayOffset);
    createdAt.setHours(8 + Math.floor(Math.random() * 12), Math.floor(Math.random() * 60), 0, 0);

    const totals = computeTotals(lines, usePromo ? 'BIENVENUE10' : null);

    /* Statut cohérent avec l'âge de la commande */
    const roll = Math.random();
    const status: OrderStatus =
      dayOffset > 7 ? 'shipped' : dayOffset > 3 ? (roll < 0.6 ? 'shipped' : 'preparing') : roll < 0.55 ? 'paid' : 'preparing';

    const name = CUST_NAMES[i % CUST_NAMES.length];
    const createdOrder = composeOrder({
      customer: {
        name: name[0],
        address: '12 rue des Baobabs',
        postalCode: `${68 + (i % 9)}00${1 + (i % 8)}`,
        city: name[1],
        country: 'France',
        email: `client${i + 1}@demo.fr`,
      },
      items: itemsFromLines(totals.lines),
      promoCode: totals.promoCode,
      subtotal: totals.subtotal,
      discount: totals.discount,
      shipping: totals.shipping,
      total: totals.total,
      status,
      createdAt: createdAt.toISOString(),
      payment: {
        provider: 'simulation-interne',
        transactionId: `sim_demo_${Date.now()}_${i}`,
        last4: '4242',
      },
    });
    /* L'identifiant a été assuré unique au-dessus : on le réinjecte */
    created.push({ ...createdOrder, id });
    usedIds.add(createdOrder.id);
  }

  await saveOrders(created);
  return NextResponse.json({ created: created.length }, { status: 201 });
}

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function newDummyId(): string {
  let code = '';
  for (let i = 0; i < 6; i += 1) code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return `TS-${code}`;
}

const CUST_NAMES: [string, string][] = [
  ['Nadia Rasoanaivo', 'Antananarivo'],
  ['Marc Delaunay', 'Lyon'],
  ['Zoé Mercier', 'Bruxelles'],
  ['Léo Bernard', 'Paris'],
  ['Claire Fontaine', 'Bordeaux'],
  ['Ando Rakotondrabe', 'Toamasina'],
  ['Julien Meyer', 'Strasbourg'],
  ['Emma Petit', 'Genève'],
  ['Tovo Andriamampianina', 'Antsirabe'],
  ['Lucile Moreau', 'Lille'],
  ['Paulo Costa', 'Luxembourg'],
  ['Hélène Girard', 'Nantes'],
];
