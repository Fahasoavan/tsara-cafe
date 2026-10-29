/**
 * Couche métier des commandes : identifiants, validation, assemblage.
 * La PERSISTANCE vit dans src/lib/orders-store.ts (Redis ou fichier JSON) ;
 * la MONNAIE/vit dans src/lib/totals.ts (fonctions pures, testées).
 */
import { fetchOrder, fetchOrders, replaceOrder, storeOrders } from '@/lib/orders-store';
import {
  computeTotals,
  itemsFromLines,
} from '@/lib/totals';
import type { ChargeResult } from '@/lib/payment';
import type {
  CheckoutAddress,
  CheckoutPayload,
  OrderStatus,
  StoredOrder,
  StoredOrderLine,
} from '@/lib/types';
import { ORDER_STATUSES } from '@/lib/types';

/** Identifiant public du style TS-AB12CD (sans caractères ambigus) */
export function generateOrderId(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `TS-${code}`;
}

/* Re-exports : les routes API n'ont qu'un seul module à connaître */
export { computeTotals, itemsFromLines } from '@/lib/totals';
export { storageBackend } from '@/lib/orders-store';

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

  /* Unicité : on rejoue l'identifiant tant qu'il existe déjà */
  let id = order.id;
  while (await fetchOrder(id)) id = generateOrderId();
  const finalOrder = id === order.id ? order : { ...order, id };
  await storeOrders([finalOrder]);
  return finalOrder;
}

export async function listOrders(): Promise<StoredOrder[]> {
  return fetchOrders();
}

export async function getOrder(id: string): Promise<StoredOrder | undefined> {
  return fetchOrder(id.trim().toUpperCase());
}

/** Suivi / confirmation : le numéro + l'e-mail doivent tous deux correspondre */
export async function getOrderForTracking(id: string, email: string): Promise<StoredOrder | undefined> {
  const order = await getOrder(id);
  if (!order) return undefined;
  if (order.customer.email !== email.trim().toLowerCase()) return undefined;
  return order;
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<StoredOrder | undefined> {
  if (!ORDER_STATUSES.includes(status)) throw new Error('Statut invalide.');
  const normalized = id.trim().toUpperCase();
  const current = await fetchOrder(normalized);
  if (!current) return undefined;
  return replaceOrder(normalized, { ...current, status });
}
