/** Codes promotionnels — partagés client (affichage) / serveur (recalcul) */

export interface PromoCode {
  code: string;
  /** Pourcentage de remise sur le sous-total */
  percentOff: number;
}

export const PROMO_CODES: PromoCode[] = [{ code: 'BIENVENUE10', percentOff: 10 }];

export function findPromo(raw: string | null | undefined): PromoCode | undefined {
  if (!raw) return undefined;
  const code = raw.trim().toUpperCase();
  if (!code) return undefined;
  return PROMO_CODES.find((p) => p.code === code);
}
