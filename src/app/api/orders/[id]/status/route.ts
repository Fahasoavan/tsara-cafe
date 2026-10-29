import { NextResponse } from 'next/server';
import { checkAdmin, limitedResponse, unauthorizedResponse } from '@/lib/admin-auth';
import { updateOrderStatus } from '@/lib/orders';
import { ORDER_STATUSES, type OrderStatus } from '@/lib/types';

/**
 * PATCH /api/orders/:id/status — modification du statut.
 * Route SENSIBLE (destructrice si détournée) : mot de passe admin requis.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await checkAdmin(request);
  if (auth === 'limited') return limitedResponse();
  if (auth !== 'ok') return unauthorizedResponse();

  let body: { status?: string };
  try {
    body = (await request.json()) as { status?: string };
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const status = body?.status;
  if (typeof status !== 'string' || !ORDER_STATUSES.includes(status as OrderStatus)) {
    return NextResponse.json({ error: 'invalid_status' }, { status: 400 });
  }

  const { id } = await params;
  const updated = await updateOrderStatus((id ?? '').trim().toUpperCase(), status as OrderStatus);
  if (!updated) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  return NextResponse.json({ order: updated });
}
