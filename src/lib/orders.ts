/**
 * Stockage des commandes — data/orders.json (aucune base de données).
 * Ce fichier n'est importé QUE par le code serveur : il contient `node:fs`.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { getProductById, getUnitPrice, type FormatId, type GrindId } from '@/data/products';
import { round2 } from '@/lib/format';
import { findPromo } from '@/lib/promo';
import { shippingFor } from '@/lib/shipping';
import type { ChargeResult } from '@/lib/payment';
import {
  ORDER_STATUSES,
  type CartLine,
  type CheckoutAddress,
  type CheckoutPayload,
  type OrderStatus,
  type StoredOrder,
  type StoredOrderLine,
} from '@/lib/types';

const MAX_QTY = 99;

const DATA_DIR = path.join(process.cwd(), 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

async function readAll(): Promise<StoredOrder[]> {
  try {
    const raw = await fs.readFile(ORDERS_FILE, 'utf8');
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as StoredOrder[];
  } catch {
    /* fichier absent ou corrompu : on repart de zéro */
  }
  return [];
}

async function writeAll(orders: StoredOrder[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf8');
}

/** Identifiant public du style TS-AB12CD (sans caractères ambigus) */
export function generateOrderId(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `TS-${code}`;
}

/**
 * Garde-fou : compare les lignes envoyées par le navigateur avec le catalogue.
 * Renvoie la liste nettoyée + les totaux recalculés, ou une erreur explicite.
 */
export function computeTotals(
  rawLines: unknown,
  rawPromo: unknown,
): { lines: CartLine[]; promoCode: string | null; subtotal: number; discount: number; shipping: number; total: number } {
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

  const subtotal = round2(
    lines.reduce((sum, l) => {
      const product = getProductById(l.productId);
      if (!product) throw new Error(`Produit inconnu : « ${l.productId} ».`);
      return sum + getUnitPrice(product, l.format) * l.qty;
    }, 0),
  );

  /* Le code promo est recalculé : on ne fait jamais confiance au client */
  const promo = findPromo(typeof rawPromo === 'string' ? rawPromo : null);
  const discount = promo ? round2((subtotal * promo.percentOff) / 100) : 0;
  const afterDiscount = round2(subtotal - discount);
  const shipping = shippingFor(afterDiscount);
  const total = round2(afterDiscount + shipping);

  return { lines, promoCode: promo?.code ?? null, subtotal, discount, shipping, total };
}

/** Construit le snapshot d'articles à partir de lignes déjà validées */
export function itemsFromLines(lines: CartLine[]): StoredOrderLine[] {
  return lines.map((line) => {
    const product = getProductById(line.productId);
    if (!product) throw new Error(`Produit inconnu : « ${line.productId} ».`);
    const unitPrice = getUnitPrice(product, line.format);
    return {
      productId: product.id,
      name: { fr: product.name, en: product.name },
      format: line.format,
      grind: line.grind,
      qty: line.qty,
      unitPrice: round2(unitPrice),
      lineTotal: round2(unitPrice * line.qty),
      accent: product.accent,
    };
  });
}

/** Assemble une commande complète (identifiants, total, statut, date) */
export function composeOrder(args: {
  customer: CheckoutAddress;
  items: StoredOrderLine[];
  promoCode: string | null;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  payment: { provider: string; transactionId: string; last4: string };
}): StoredOrder {
  const { customer, payment } = args;
  return {
    id: generateOrderId(),
    createdAt: args.createdAt,
    status: args.status,
    customer: {
      name: String(customer.name ?? '').trim(),
      address: String(customer.address ?? '').trim(),
      postalCode: String(customer.postalCode ?? '').trim(),
      city: String(customer.city ?? '').trim(),
      country: String(customer.country ?? '').trim(),
      email: String(customer.email ?? '').trim().toLowerCase(),
    },
    items: args.items,
    promoCode: args.promoCode,
    subtotal: args.subtotal,
    discount: args.discount,
    shipping: args.shipping,
    total: args.total,
    payment: {
      provider: payment.provider,
      transactionId: payment.transactionId,
      last4: payment.last4,
    },
  };
}

/** Insère une ou plusieurs commandes (écriture unique) */
export async function saveOrders(orders: StoredOrder[]): Promise<void> {
  const all = await readAll();
  all.push(...orders);
  await writeAll(all);
}

/** Vide le registre (démonstration) */
export async function clearOrders(): Promise<void> {
  await writeAll([]);
}

/** Construit et enregistre une commande, à partir d'un paiement réussi */
export async function createOrder(
  payload: CheckoutPayload,
  totals: ReturnType<typeof computeTotals>,
  charge: ChargeResult,
): Promise<StoredOrder> {
  const order: StoredOrder = {
    id: generateOrderId(),
    createdAt: new Date().toISOString(),
    status: 'paid',
    customer: {
      name: String(payload.address.name ?? '').trim(),
      address: String(payload.address.address ?? '').trim(),
      postalCode: String(payload.address.postalCode ?? '').trim(),
      city: String(payload.address.city ?? '').trim(),
      country: String(payload.address.country ?? '').trim(),
      email: String(payload.address.email ?? '').trim().toLowerCase(),
    },
    items: itemsFromLines(totals.lines),
    promoCode: totals.promoCode,
    subtotal: totals.subtotal,
    discount: totals.discount,
    shipping: totals.shipping,
    total: totals.total,
    payment: {
      provider: 'simulation-interne',
      transactionId: charge.transactionId ?? '',
      last4: charge.last4 ?? '',
    },
  };
  await saveOrders([order]);
  return order;
}

export async function listOrders(): Promise<StoredOrder[]> {
  const orders = await readAll();
  return orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getOrder(id: string): Promise<StoredOrder | undefined> {
  const orders = await readAll();
  return orders.find((o) => o.id === id);
}

/** Suivi : le numéro + l'e-mail doivent tous deux correspondre */
export async function getOrderForTracking(id: string, email: string): Promise<StoredOrder | undefined> {
  const order = await getOrder(id.trim().toUpperCase());
  if (!order) return undefined;
  if (order.customer.email !== email.trim().toLowerCase()) return undefined;
  return order;
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<StoredOrder | undefined> {
  if (!ORDER_STATUSES.includes(status)) throw new Error('Statut invalide.');
  const orders = await readAll();
  const index = orders.findIndex((o) => o.id === id);
  if (index === -1) return undefined;
  const updated = { ...orders[index], status };
  orders[index] = updated;
  await writeAll(orders);
  return updated;
}
