import { NextResponse } from 'next/server';
import { isValidEmail } from '@/lib/format';
import { computeTotals, createOrder } from '@/lib/orders';
import { clientIp, rateLimit } from '@/lib/rate-limit';
import { paymentProvider } from '@/lib/payment';
import type { CheckoutPayload } from '@/lib/types';

/**
 * POST /api/checkout
 * 1. Limite la fréquence de saisie (anti-abus)
 * 2. Valide les données du navigateur (panier, adresse, carte)
 * 3. Recalcule TOUS les totaux à partir du catalogue (jamais les prix du client)
 * 4. Passe le paiement via paymentProvider (simulation)
 * 5. Enregistre la commande (Redis avec TTL 3 jours, ou data/orders.json en local)
 *
 * AUCUN appel à `request.body` n'est journalisé : le corps contient des
 * données personnelles et le numéro de carte — jamais console.log ici.
 */
const CHECKOUT_LIMIT = 8; // requêtes…
const CHECKOUT_WINDOW_MS = 10 * 60 * 1000; // …par 10 minutes et par IP

export async function POST(request: Request) {
  /* --- Limiteur de débit (le plus tôt possible) --- */
  if (!rateLimit(`checkout:${clientIp(request)}`, CHECKOUT_LIMIT, CHECKOUT_WINDOW_MS)) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  let payload: CheckoutPayload;
  try {
    payload = (await request.json()) as CheckoutPayload;
  } catch {
    return NextResponse.json({ error: 'Corps de requête invalide.' }, { status: 400 });
  }

  /* --- Adresse --- */
  const a = payload?.address;
  if (
    !a ||
    !isNonEmpty(a.name) ||
    !isNonEmpty(a.address) ||
    !isNonEmpty(a.postalCode) ||
    !isNonEmpty(a.city) ||
    !isNonEmpty(a.country) ||
    !isValidEmail(String(a.email ?? ''))
  ) {
    return NextResponse.json({ error: 'address' }, { status: 400 });
  }

  /* --- Panier : recalcul complet côté serveur --- */
  let totals;
  try {
    totals = computeTotals(payload?.items, payload?.promoCode);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Panier invalide.';
    return NextResponse.json({ error: 'cart', detail: message }, { status: 400 });
  }

  /* --- Paiement (SIMULATION) : montant recalculé, jamais celui du client --- */
  const charge = await paymentProvider.charge({
    amountEur: totals.total,
    card: {
      holder: String(payload?.card?.holder ?? ''),
      number: String(payload?.card?.number ?? ''),
      expiry: String(payload?.card?.expiry ?? ''),
      cvc: String(payload?.card?.cvc ?? ''),
    },
    description: 'Commande Tsara Café (démonstration)',
  });

  if (!charge.success) {
    return NextResponse.json({ error: 'payment', reason: charge.reason ?? 'invalid_card' }, { status: 402 });
  }

  /* --- Enregistrement --- */
  try {
    const order = await createOrder(payload, totals, charge);
    return NextResponse.json({ id: order.id }, { status: 201 });
  } catch (err) {
    /* On journalise uniquement le type d'erreur, jamais les données */
    console.error('[checkout] échec d’enregistrement :', err instanceof Error ? err.name : 'inconnu');
    return NextResponse.json({ error: 'database' }, { status: 500 });
  }
}

function isNonEmpty(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}
