import { NextResponse } from 'next/server';
import { clearOrders, listOrders } from '@/lib/orders';

/** GET /api/orders — liste des commandes (écran Admin de démonstration) */
export async function GET() {
  const orders = await listOrders();
  return NextResponse.json({ orders });
}

/** DELETE /api/orders — purge totale (démonstration Admin) */
export async function DELETE() {
  await clearOrders();
  return NextResponse.json({ ok: true, cleared: true });
}
