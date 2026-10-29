/** Règles de livraison — partagées client (affichage) / serveur (recalcul) */

export const SHIPPING_FEE = 6.9;
export const FREE_SHIPPING_MIN = 60;

/** Livraison offerte dès FREE_SHIPPING_MIN € (calculés après remise) */
export function shippingFor(subtotalAfterDiscount: number): number {
  return subtotalAfterDiscount >= FREE_SHIPPING_MIN ? 0 : SHIPPING_FEE;
}
