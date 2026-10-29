import { NextResponse } from 'next/server';
import { checkAdmin, limitedResponse, unauthorizedResponse } from '@/lib/admin-auth';
import { fetchOrders, eraseOrders, storageBackend } from '@/lib/orders-store';
import { maskOrder } from '@/lib/sanitize';

/**
 * GET /api/orders — liste, récentes d'abord.
 * Lecture ouverte (le dashboard est visitable en lecture seule), mais le
 * contenu varie par privilège :
 *   • sans mot de passe admin : e-mail / rue / code postal MASQUÉS ;
 *   • avec en-tête Authorization Basic : données complètes (admin légitime).
 */
export async function GET(request: Request) {
  const auth = await checkAdmin(request);
  const authorized = auth === 'ok';
  const orders = await fetchOrders();
  return NextResponse.json({ orders: authorized ? orders : orders.map(maskOrder), backend: storageBackend() });
}

/** DELETE /api/orders — purge totale. Route SENSIBLE : mot de passe requis. */
export async function DELETE(request: Request) {
  const auth = await checkAdmin(request);
  if (auth === 'limited') return limitedResponse();
  if (auth !== 'ok') return unauthorizedResponse();
  await eraseOrders();
  return NextResponse.json({ ok: true, cleared: true });
}
