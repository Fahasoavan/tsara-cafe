import { NextResponse } from 'next/server';
import { getOrder, getOrderForTracking } from '@/lib/orders';

/**
 * GET /api/orders/:id            → commande (confirmation, facture)
 * GET /api/orders/:id?email=...  → suivi : l'e-mail doit correspondre
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  const id = (params.id ?? '').trim().toUpperCase();
  if (!id) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const email = new URL(request.url).searchParams.get('email');
  if (email !== null) {
    const order = await getOrderForTracking(id, email);
    if (!order) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    return NextResponse.json({ order });
  }

  const order = await getOrder(id);
  if (!order) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json({ order });
}
