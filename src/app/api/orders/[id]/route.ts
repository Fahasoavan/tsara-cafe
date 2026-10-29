import { NextResponse } from 'next/server';
import { getOrder, getOrderForTracking } from '@/lib/orders';

/**
 * GET /api/orders/:id?email=... — l'e-mail est OBLIGATOIRE.
 * Une commande ne peut plus être consultée avec le seul numéro : elle
 * contient le nom, l'adresse et l'e-mail du client. Confirmation,
 * facture et suivi passent tous par `?email=` (vérifié côté serveur,
 * insensible à la casse ; 404 sinon).
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: rawId } = await params;
  const id = (rawId ?? '').trim().toUpperCase();
  const email = new URL(request.url).searchParams.get('email');

  if (!id || email === null) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const order = await getOrderForTracking(id, email);
  if (!order) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json({ order });
}
