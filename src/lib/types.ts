import type { FormatId, GrindId } from '@/data/products';

/** Une ligne de panier (structure partagée navigateur ↔ serveur) */
export interface CartLine {
  productId: string;
  format: FormatId;
  grind: GrindId | null;
  qty: number;
}

/** Adresse de livraison validée côté client */
export interface CheckoutAddress {
  name: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
  email: string;
}

/** Charge utile envoyée à /api/checkout — les prix n'y figurent JAMAIS */
export interface CheckoutPayload {
  items: CartLine[];
  promoCode: string | null;
  address: CheckoutAddress;
  card: { holder: string; number: string; expiry: string; cvc: string };
}

/** Ligne de commande telle qu'enregistrée (avec les prix recalculés côté serveur) */
export interface StoredOrderLine {
  productId: string;
  name: { fr: string; en: string };
  format: FormatId;
  grind: GrindId | null;
  qty: number;
  unitPrice: number;
  lineTotal: number;
  accent: string;
}

export type OrderStatus = 'paid' | 'preparing' | 'shipped';

/** Commande enregistrée dans data/orders.json */
export interface StoredOrder {
  id: string;
  createdAt: string;
  status: OrderStatus;
  customer: CheckoutAddress;
  items: StoredOrderLine[];
  promoCode: string | null;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  payment: {
    provider: string;
    transactionId: string;
    last4: string;
  };
}

export const ORDER_STATUSES: OrderStatus[] = ['paid', 'preparing', 'shipped'];
