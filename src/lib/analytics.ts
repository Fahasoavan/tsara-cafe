/**
 * Agrégations du tableau de bord Admin — fonctions pures,
 * dérivées des commandes enregistrées (data/orders.json).
 */
import { round2 } from '@/lib/format';
import type { OrderStatus, StoredOrder, StoredOrderLine } from '@/lib/types';

export interface DayPoint {
  /** Clé locale YYYY-MM-DD */
  key: string;
  /** Libellé court (ex. « 12/02 ») */
  label: string;
  revenue: number;
  orders: number;
}

export interface Kpis {
  revenue: number;
  ordersCount: number;
  avgBasket: number;
  itemsSold: number;
  /** Croissance du CA : 7 derniers jours vs 7 précédents (%, null si pas comparable) */
  growth7: number | null;
}

export interface ProductStat {
  productId: string;
  name: { fr: string; en: string };
  units: number;
  revenue: number;
}

export interface StatusStat {
  status: OrderStatus;
  count: number;
}

/** Clé de jour en heure locale (cohérente pour tout le fichier) */
function dayKey(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

function shortLabel(locale: string, key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'fr-FR', {
    day: '2-digit',
    month: '2-digit',
  }).format(new Date(y, m - 1, d));
}

/** Série journalière (CA + nombre de commandes) sur les `days` derniers jours */
export function dailySeries(orders: StoredOrder[], days = 30, locale = 'fr'): DayPoint[] {
  const today = new Date();
  const map = new Map<string, { revenue: number; orders: number }>();
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    map.set(dayKey(d), { revenue: 0, orders: 0 });
  }
  for (const order of orders) {
    const bucket = map.get(dayKey(new Date(order.createdAt)));
    if (bucket) {
      bucket.revenue = round2(bucket.revenue + order.total);
      bucket.orders += 1;
    }
  }
  return Array.from(map.entries()).map(([key, v]) => ({
    key,
    label: shortLabel(locale, key),
    revenue: v.revenue,
    orders: v.orders,
  }));
}

/** Indicateurs clés */
export function computeKpis(orders: StoredOrder[]): Kpis {
  const revenue = round2(orders.reduce((sum, o) => sum + o.total, 0));
  const ordersCount = orders.length;
  const itemsSold = orders.reduce((sum, o) => sum + o.items.reduce((s, l) => s + l.qty, 0), 0);

  const now = new Date();
  const start7 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
  const start14 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 13);
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  let rev7 = 0;
  let revPrev7 = 0;
  for (const o of orders) {
    const d = new Date(o.createdAt);
    if (d >= start7) rev7 = round2(rev7 + o.total);
    else if (d >= start14) revPrev7 = round2(revPrev7 + o.total);
  }
  const growth7 = revPrev7 > 0 ? round2(((rev7 - revPrev7) / revPrev7) * 100) : null;
  const _ = sameDay; // garde-fou (évite lint) : comparaison intégrée via >=
  void _;

  return {
    revenue,
    ordersCount,
    avgBasket: ordersCount > 0 ? round2(revenue / ordersCount) : 0,
    itemsSold,
    growth7,
  };
}

/** CA cumulé par produit, trié du meilleur vendeur au dernier */
export function topProducts(orders: StoredOrder[], limit = 5): ProductStat[] {
  const map = new Map<string, ProductStat>();
  for (const o of orders) {
    for (const line of o.items as StoredOrderLine[]) {
      const entry = map.get(line.productId) ?? {
        productId: line.productId,
        name: line.name,
        units: 0,
        revenue: 0,
      };
      entry.units += line.qty;
      entry.revenue = round2(entry.revenue + line.lineTotal);
      map.set(line.productId, entry);
    }
  }
  return Array.from(map.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

/** CA par format : { s250, s1000, coffret } */
export function revenueByFormat(orders: StoredOrder[]): { s250: number; s1000: number; coffret: number } {
  const out = { s250: 0, s1000: 0, coffret: 0 };
  for (const o of orders) {
    for (const l of o.items as StoredOrderLine[]) {
      out[l.format] = round2(out[l.format] + l.lineTotal);
    }
  }
  return out;
}

/** Nombre de commandes par statut */
export function countByStatus(orders: StoredOrder[]): StatusStat[] {
  const counts: Record<OrderStatus, number> = { paid: 0, preparing: 0, shipped: 0 };
  for (const o of orders) counts[o.status] += 1;
  return (['paid', 'preparing', 'shipped'] as const).map((s) => ({ status: s, count: counts[s] }));
}
