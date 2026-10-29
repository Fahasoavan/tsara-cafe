import { NextResponse } from 'next/server';
import { updateOrderStatus } from '@/lib/orders';
import { ORDER_STATUSES, type OrderStatus } from '@/lib/types';

/** PATCH /api/orders/:id/status — modification du statut (écran Admin) */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
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

  const updated = await updateOrderStatus((params.id ?? '').trim().toUpperCase(), status as OrderStatus);
  if (!updated) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  return NextResponse.json({ order: updated });
}
