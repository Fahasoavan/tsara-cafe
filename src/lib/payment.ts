/**
 * ============================================================
 *  Passerelle de paiement — TSARA CAFÉ (démonstration)
 * ============================================================
 *
 *  Toute la logique de paiement est isolée dans CE fichier.
 *  Le reste de l'application ne manipule que les interfaces
 *  `PaymentProvider` / `ChargeResult` :
 *
 *  - Aujourd'hui : `SimulatedPaymentProvider` (aucun réseau)
 *    · accepte UNIQUEMENT la carte de test 4242 4242 4242 4242
 *      (expiration future + CVC 3 chiffres)
 *    · refuse la carte de test 4000 0000 0000 0002
 *  - Demain : pour brancher Stripe / PayPal / etc., il suffit
 *    d'implémenter `PaymentProvider` dans un nouveau fichier
 *    (ex. `stripe.ts`), puis de remplacer la ligne
 *    `export const paymentProvider = ...` tout en bas.
 *    Aucun autre fichier n'a besoin de changer.
 *
 *  Ce module n'est importé que par le code serveur (routes API).
 *  Les numéros de carte complets ne sont ni loggés, ni stockés :
 *  seule la référence bancaire (4 derniers chiffres) est conservée.
 * ============================================================
 */

export interface CardInput {
  holder: string;
  /** Numéro tel que saisi (espaces autorisés) */
  number: string;
  /** MM/AA */
  expiry: string;
  /** 3 chiffres */
  cvc: string;
}

export interface ChargeInput {
  /** Montant à encaisser, en euros (recalculé côté serveur) */
  amountEur: number;
  card: CardInput;
  /** Libellé de la transaction (ex. « Commande TS-AB12CD ») */
  description: string;
}

export type PaymentFailureReason =
  | 'invalid_number'
  | 'invalid_expiry'
  | 'invalid_cvc'
  | 'declined';

export interface ChargeResult {
  success: boolean;
  /** Renvoyé uniquement en cas de succès */
  transactionId?: string;
  /** 4 derniers chiffres, pour l'affichage « •••• 4242 » */
  last4?: string;
  /** Raison d'échec — traduite côté client */
  reason?: PaymentFailureReason;
}

export interface PaymentProvider {
  /** Identifiant du prestataire, stocké avec la commande */
  readonly name: string;
  charge(input: ChargeInput): Promise<ChargeResult>;
}

/* Cartes du banc de test (mode démonstration) */
const TEST_CARD_OK = '4242424242424242';
const TEST_CARD_DECLINED = '4000000000000002';

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Parse « MM/AA » et vérifie que la carte est valable au mois en cours */
function parseExpiry(raw: string): { month: number; year: number } | null {
  const m = /^(\d{2})\/(\d{2})$/.exec(raw.trim());
  if (!m) return null;
  const month = Number(m[1]);
  const year = 2000 + Number(m[2]);
  if (month < 1 || month > 12) return null;
  return { month, year };
}

export class SimulatedPaymentProvider implements PaymentProvider {
  readonly name = 'simulation-interne';

  async charge({ amountEur, card }: ChargeInput): Promise<ChargeResult> {
    /* Latence artificielle pour visualiser les états de chargement */
    await sleep(900 + Math.floor(Math.random() * 500));

    if (!Number.isFinite(amountEur) || amountEur <= 0) {
      return { success: false, reason: 'invalid_number' };
    }

    const digits = card.number.replace(/[\s-]/g, '');
    const last4 = digits.slice(-4);

    if (!/^\d{13,19}$/.test(digits) || !isLuhnValid(digits)) {
      return { success: false, reason: 'invalid_number' };
    }

    if (!/^\d{3}$/.test(card.cvc.trim())) {
      return { success: false, reason: 'invalid_cvc' };
    }

    const expiry = parseExpiry(card.expiry);
    if (!expiry) return { success: false, reason: 'invalid_expiry' };

    /* La carte est valable jusqu'à la fin du mois indiqué */
    const expiresAfter = new Date(expiry.year, expiry.month, 1);
    const now = new Date();
    if (expiresAfter <= now) return { success: false, reason: 'invalid_expiry' };

    if (digits === TEST_CARD_DECLINED) {
      return { success: false, reason: 'declined' };
    }

    if (digits !== TEST_CARD_OK) {
      return { success: false, reason: 'invalid_number' };
    }

    return {
      success: true,
      transactionId: `sim_${Date.now()}_${Math.floor(Math.random() * 1_000_000)
        .toString()
        .padStart(6, '0')}`,
      last4,
    };
  }
}

/** Algorithme de Luhn (contrôle de vraisemblance du numéro) */
function isLuhnValid(digits: string): boolean {
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let d = digits.charCodeAt(i) - 48;
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
}

/**
 * Point d'injection unique du prestataire.
 * Remplacez par `new StripePaymentProvider()` pour produire une vraie boutique.
 */
export const paymentProvider: PaymentProvider = new SimulatedPaymentProvider();
