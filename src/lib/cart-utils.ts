/** Clé stable d'une ligne de panier (identique client & serveur) */
import type { CartLine } from '@/lib/types';

export function lineKey(line: CartLine): string {
  return `${line.productId}__${line.format}__${line.grind ?? ''}`;
}
