/**
 * Masquage des données personnelles pour l'affichage public de l'admin.
 * Le dashboard est lisible sans mot de passe : on n'y affiche donc JAMAIS
 * l'e-mail complet, ni l'adresse postale exacte. (RGPD, minimisation.)
 */
import type { StoredOrder } from '@/lib/types';

/** « fahasoavana@gmail.com » → « f***@gmail.com » */
export function maskEmail(email: string): string {
  const at = email.indexOf('@');
  if (at <= 0) return '***';
  const first = email[0];
  return `${first}***${email.slice(at)}`;
}

/** Renvoie une copie correspond à `order` avec les champs sensibles masqués */
export function maskOrder(order: StoredOrder): StoredOrder {
  return {
    ...order,
    customer: {
      ...order.customer,
      email: maskEmail(order.customer.email),
      address: `${order.customer.address.slice(0, 4)}…` || '***',
      postalCode: `${order.customer.postalCode.slice(0, 2)}***`,
    },
  };
}
